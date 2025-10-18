import {
  DuplicateInfo,
  ImportError,
  ImportOptions,
  ImportResult,
} from "@/app/api/patients/import/route";
import { Patient } from "@/types/database";

/**
 * Patient Import Utility Functions
 *
 * Provides data processing, validation, formatting, and analysis
 * utilities for patient CSV imports.
 */

/**
 * Parse CSV content and validate structure
 */
export function parseCSVContent(csvContent: string): {
  records: any[];
  errors: string[];
} {
  const errors: string[] = [];

  try {
    // Split into lines and remove empty lines
    const lines = csvContent.split("\n").filter((line) => line.trim() !== "");

    if (lines.length === 0) {
      errors.push("CSV file is empty");
      return { records: [], errors };
    }

    // Parse header row
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredFields = ["phone_number"];
    const missingFields = requiredFields.filter(
      (field) => !headers.includes(field)
    );

    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(", ")}`);
      return { records: [], errors };
    }

    // Parse data rows
    const records = lines.slice(1).map((line, index) => {
      const values = line.split(",").map((v) => v.trim());
      const record: any = {};

      headers.forEach((header, i) => {
        record[header] = values[i] || "";
      });

      return record;
    });

    return { records, errors };
  } catch (error) {
    errors.push(
      `Failed to parse CSV: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return { records: [], errors };
  }
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): {
  isValid: boolean;
  normalized: string;
  error?: string;
} {
  if (!phone || phone.trim() === "") {
    return {
      isValid: false,
      normalized: "",
      error: "Phone number is required",
    };
  }

  // Remove all non-digit characters except +
  const normalized = phone.replace(/[^\d+]/g, "");

  // Basic validation - adjust regex as needed for your requirements
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;

  if (!phoneRegex.test(normalized)) {
    return { isValid: false, normalized, error: "Invalid phone number format" };
  }

  return { isValid: true, normalized };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): {
  isValid: boolean;
  error?: string;
} {
  if (!email || email.trim() === "") {
    return { isValid: true }; // Email is optional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: "Invalid email format" };
  }

  return { isValid: true };
}

/**
 * Validate patient record
 */
export function validatePatientRecord(
  record: any,
  options: ImportOptions
): ImportError[] {
  const errors: ImportError[] = [];

  // Validate phone number
  const phoneValidation = validatePhoneNumber(record.phone_number);
  if (!phoneValidation.isValid) {
    errors.push({
      row: 0,
      field: "phone_number",
      value: record.phone_number || "",
      message: phoneValidation.error || "Invalid phone number",
    });
  }

  // Validate email if provided and validation is enabled
  if (record.email && options.validateEmails) {
    const emailValidation = validateEmail(record.email);
    if (!emailValidation.isValid) {
      errors.push({
        row: 0,
        field: "email",
        value: record.email,
        message: emailValidation.error || "Invalid email",
      });
    }
  }

  // Validate name lengths
  if (record.first_name && record.first_name.length > 100) {
    errors.push({
      row: 0,
      field: "first_name",
      value: record.first_name,
      message: "First name is too long (max 100 characters)",
    });
  }

  if (record.last_name && record.last_name.length > 100) {
    errors.push({
      row: 0,
      field: "last_name",
      value: record.last_name,
      message: "Last name is too long (max 100 characters)",
    });
  }

  // Validate company name length
  if (record.company && record.company.length > 200) {
    errors.push({
      row: 0,
      field: "company",
      value: record.company,
      message: "Company name is too long (max 200 characters)",
    });
  }

  return errors;
}

/**
 * Detect duplicates in import data
 */
export function detectDuplicates(
  records: any[],
  existingPatients: Patient[]
): DuplicateInfo[] {
  const duplicates: DuplicateInfo[] = [];
  const existingPhoneNumbers = new Map(
    existingPatients.map((p) => [normalizePhoneNumber(p.phone_number), p])
  );

  records.forEach((record, index) => {
    const normalizedPhone = normalizePhoneNumber(record.phone_number);
    const existingPatient = existingPhoneNumbers.get(normalizedPhone);

    if (existingPatient) {
      duplicates.push({
        row: index + 1,
        phoneNumber: normalizedPhone,
        existingPatient,
        action: "skip", // Default action, can be overridden
      });
    }
  });

  return duplicates;
}

/**
 * Normalize phone number for comparison
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

/**
 * Process import results and generate summary
 */
export function processImportResults(
  totalRows: number,
  imported: number,
  errors: ImportError[],
  duplicates: DuplicateInfo[],
  options: ImportOptions
): ImportResult {
  const skipped = totalRows - imported - errors.length;
  const duplicateCount = duplicates.length;
  const errorCount = errors.length;

  return {
    success: errorCount === 0 || imported > 0,
    totalRows,
    imported,
    skipped,
    errors,
    duplicates,
    summary: {
      newPatients: imported,
      updatedPatients: 0, // This would be calculated based on updateExisting option
      skippedPatients: skipped,
      errorCount,
      duplicateCount,
    },
  };
}

/**
 * Generate import statistics
 */
export function generateImportStats(results: ImportResult[]): {
  totalImports: number;
  totalPatients: number;
  successRate: number;
  averageImportSize: number;
  commonErrors: { error: string; count: number }[];
} {
  if (results.length === 0) {
    return {
      totalImports: 0,
      totalPatients: 0,
      successRate: 0,
      averageImportSize: 0,
      commonErrors: [],
    };
  }

  const totalImports = results.length;
  const totalPatients = results.reduce(
    (sum, result) => sum + result.imported,
    0
  );
  const successfulImports = results.filter((result) => result.success).length;
  const successRate = (successfulImports / totalImports) * 100;
  const averageImportSize =
    results.reduce((sum, result) => sum + result.totalRows, 0) / totalImports;

  // Count common errors
  const errorCounts = new Map<string, number>();
  results.forEach((result) => {
    result.errors.forEach((error) => {
      const key = error.message;
      errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
    });
  });

  const commonErrors = Array.from(errorCounts.entries())
    .map(([error, count]) => ({ error, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalImports,
    totalPatients,
    successRate,
    averageImportSize,
    commonErrors,
  };
}

/**
 * Format import results for display
 */
export function formatImportResults(result: ImportResult): {
  summary: string;
  details: string[];
  warnings: string[];
} {
  const summary = `Import completed: ${result.imported} patients imported, ${result.skipped} skipped, ${result.errors.length} errors`;

  const details: string[] = [];
  if (result.imported > 0) {
    details.push(`✅ ${result.imported} new patients added`);
  }
  if (result.summary.updatedPatients > 0) {
    details.push(`🔄 ${result.summary.updatedPatients} patients updated`);
  }
  if (result.skipped > 0) {
    details.push(`⏭️ ${result.skipped} records skipped`);
  }
  if (result.errors.length > 0) {
    details.push(`❌ ${result.errors.length} validation errors`);
  }

  const warnings: string[] = [];
  if (result.duplicates.length > 0) {
    warnings.push(
      `⚠️ ${result.duplicates.length} duplicate phone numbers found`
    );
  }
  if (result.errors.length > 0) {
    warnings.push(`⚠️ ${result.errors.length} records had validation errors`);
  }

  return { summary, details, warnings };
}

/**
 * Generate CSV export of import errors
 */
export function exportImportErrors(errors: ImportError[]): string {
  const headers = ["Row", "Field", "Value", "Error Message"];
  const rows = errors.map((error) => [
    error.row.toString(),
    error.field,
    error.value,
    error.message,
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

/**
 * Generate CSV export of duplicates
 */
export function exportDuplicates(duplicates: DuplicateInfo[]): string {
  const headers = ["Row", "Phone Number", "Existing Patient", "Action"];
  const rows = duplicates.map((duplicate) => [
    duplicate.row.toString(),
    duplicate.phoneNumber,
    `${duplicate.existingPatient.first_name || ""} ${
      duplicate.existingPatient.last_name || ""
    }`.trim(),
    duplicate.action,
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}
