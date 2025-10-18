import { ImportOptions } from "@/app/api/patients/import/route";
import {
  detectDuplicates,
  normalizePhoneNumber,
  validateEmail,
  validatePatientRecord,
  validatePhoneNumber,
} from "@/lib/patientImport";
import { Patient } from "@/types/database";

describe("Patient Import Utilities", () => {
  describe("validatePhoneNumber", () => {
    it("validates correct phone numbers", () => {
      const validPhones = [
        "+1-555-123-4567",
        "5551234567",
        "+1 (555) 123-4567",
        "+15551234567",
      ];

      validPhones.forEach((phone) => {
        const result = validatePhoneNumber(phone);
        expect(result.isValid).toBe(true);
        expect(result.normalized).toBeTruthy();
      });
    });

    it("rejects invalid phone numbers", () => {
      const invalidPhones = ["", "123", "abc-def-ghij", "555-123"];

      invalidPhones.forEach((phone) => {
        const result = validatePhoneNumber(phone);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeTruthy();
      });
    });

    it("normalizes phone numbers correctly", () => {
      const testCases = [
        { input: "+1-555-123-4567", expected: "+15551234567" },
        { input: "(555) 123-4567", expected: "5551234567" },
        { input: "555.123.4567", expected: "5551234567" },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = validatePhoneNumber(input);
        expect(result.normalized).toBe(expected);
      });
    });
  });

  describe("validateEmail", () => {
    it("validates correct email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.org",
      ];

      validEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
      });
    });

    it("rejects invalid email addresses", () => {
      const invalidEmails = [
        "invalid-email",
        "@example.com",
        "user@",
        "user@.com",
      ];

      invalidEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeTruthy();
      });
    });

    it("allows empty email addresses", () => {
      const result = validateEmail("");
      expect(result.isValid).toBe(true);
    });
  });

  describe("validatePatientRecord", () => {
    const defaultOptions: ImportOptions = {
      skipDuplicates: true,
      updateExisting: false,
      validatePhoneNumbers: true,
      validateEmails: true,
      batchSize: 100,
    };

    it("validates correct patient records", () => {
      const validRecord = {
        phone_number: "+1-555-123-4567",
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        company: "Test Company",
      };

      const errors = validatePatientRecord(validRecord, defaultOptions);
      expect(errors).toHaveLength(0);
    });

    it("detects missing phone number", () => {
      const invalidRecord = {
        phone_number: "",
        first_name: "John",
        last_name: "Doe",
      };

      const errors = validatePatientRecord(invalidRecord, defaultOptions);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("phone_number");
    });

    it("detects invalid email when validation is enabled", () => {
      const invalidRecord = {
        phone_number: "+1-555-123-4567",
        email: "invalid-email",
      };

      const errors = validatePatientRecord(invalidRecord, defaultOptions);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("email");
    });

    it("skips email validation when disabled", () => {
      const options = { ...defaultOptions, validateEmails: false };
      const record = {
        phone_number: "+1-555-123-4567",
        email: "invalid-email",
      };

      const errors = validatePatientRecord(record, options);
      expect(errors).toHaveLength(0);
    });

    it("detects long names", () => {
      const invalidRecord = {
        phone_number: "+1-555-123-4567",
        first_name: "A".repeat(101),
        last_name: "B".repeat(101),
      };

      const errors = validatePatientRecord(invalidRecord, defaultOptions);
      expect(errors).toHaveLength(2);
      expect(errors[0].field).toBe("first_name");
      expect(errors[1].field).toBe("last_name");
    });
  });

  describe("detectDuplicates", () => {
    const existingPatients: Patient[] = [
      {
        id: "1",
        phone_number: "+1-555-123-4567",
        first_name: "John",
        last_name: "Doe",
        status: "active",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
      {
        id: "2",
        phone_number: "555-987-6543",
        first_name: "Jane",
        last_name: "Smith",
        status: "active",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    it("detects duplicates correctly", () => {
      const records = [
        {
          phone_number: "+1-555-123-4567",
          first_name: "John",
          last_name: "Doe",
        },
        {
          phone_number: "555-987-6543",
          first_name: "Jane",
          last_name: "Smith",
        },
        {
          phone_number: "+1-555-999-9999",
          first_name: "New",
          last_name: "User",
        },
      ];

      const duplicates = detectDuplicates(records, existingPatients);
      expect(duplicates).toHaveLength(2);
      expect(duplicates[0].phoneNumber).toBe("+15551234567");
      expect(duplicates[1].phoneNumber).toBe("5559876543");
    });

    it("handles normalized phone numbers", () => {
      const records = [
        {
          phone_number: "(555) 123-4567",
          first_name: "John",
          last_name: "Doe",
        },
      ];

      const duplicates = detectDuplicates(records, existingPatients);
      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].phoneNumber).toBe("5551234567");
    });

    it("returns empty array when no duplicates", () => {
      const records = [
        {
          phone_number: "+1-555-999-9999",
          first_name: "New",
          last_name: "User",
        },
      ];

      const duplicates = detectDuplicates(records, existingPatients);
      expect(duplicates).toHaveLength(0);
    });
  });

  describe("normalizePhoneNumber", () => {
    it("normalizes phone numbers correctly", () => {
      const testCases = [
        { input: "+1-555-123-4567", expected: "+15551234567" },
        { input: "(555) 123-4567", expected: "5551234567" },
        { input: "555.123.4567", expected: "5551234567" },
        { input: "555 123 4567", expected: "5551234567" },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = normalizePhoneNumber(input);
        expect(result).toBe(expected);
      });
    });

    it("handles empty input", () => {
      const result = normalizePhoneNumber("");
      expect(result).toBe("");
    });

    it("handles input with only non-digit characters", () => {
      const result = normalizePhoneNumber("abc-def-ghij");
      expect(result).toBe("");
    });
  });
});
