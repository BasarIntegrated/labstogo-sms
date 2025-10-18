import {
  completeImportProgress,
  failImportProgress,
  updateImportProgress,
} from "@/lib/importProgress";
import { supabaseAdmin } from "@/lib/supabase";
import { Patient } from "@/types/database";
import { parse } from "csv-parse/sync";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

/**
 * Contact Import API Endpoint
 *
 * Handles CSV and Excel file uploads, data validation, duplicate detection,
 * and bulk contact import with progress tracking.
 */

/**
 * Convert various date formats to ISO date string
 * Handles Excel serial dates, ISO dates, and other common formats
 */
function convertToDateString(value: any): string | null {
  if (!value) return null;

  const stringValue = value.toString().trim();

  // Already in ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  // Excel serial date (5-digit number)
  if (isExcelSerialDate(value)) {
    return convertExcelSerialDate(value);
  }

  // Try parsing as a regular date
  const parsedDate = new Date(stringValue);
  if (!isNaN(parsedDate.getTime())) {
    // Check if it's a reasonable date (between 1900 and 2100)
    const year = parsedDate.getFullYear();
    if (year >= 1900 && year <= 2100) {
      return parsedDate.toISOString().split("T")[0];
    }
  }

  return null; // Could not convert
}

/**
 * Convert Excel serial date to ISO date string
 * Excel stores dates as serial numbers (days since 1900-01-01)
 */
function convertExcelSerialDate(serialDate: any): string | null {
  if (!serialDate) return null;

  const numValue = Number(serialDate);
  if (isNaN(numValue) || numValue < 1 || numValue > 100000) {
    return null; // Not a valid Excel serial date
  }

  // Excel serial date calculation
  // Excel counts from 1900-01-01 as serial number 1
  const excelEpoch = new Date(1900, 0, 1);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  // Adjust for Excel's leap year bug (day 60 doesn't exist in 1900)
  const adjustedSerial = numValue > 60 ? numValue - 1 : numValue;

  const date = new Date(
    excelEpoch.getTime() + (adjustedSerial - 1) * millisecondsPerDay
  );

  // Check if the date is reasonable (between 1900 and 2100)
  if (date.getFullYear() < 1900 || date.getFullYear() > 2100) {
    return null;
  }

  return date.toISOString().split("T")[0]; // Return YYYY-MM-DD format
}

/**
 * Check if a value looks like an Excel serial date
 */
function isExcelSerialDate(value: any): boolean {
  if (!value) return false;
  const numValue = Number(value);
  return (
    !isNaN(numValue) &&
    numValue >= 1 &&
    numValue <= 100000 &&
    Number.isInteger(numValue)
  );
}

/**
 * Maps common field name variations to our standard field names
 */
function mapFieldName(fieldName: string): string {
  const fieldMap: Record<string, string> = {
    // Phone number variations
    phone: "phone_number",
    phone_number: "phone_number",
    mobile: "phone_number",
    cell: "phone_number",
    telephone: "phone_number",

    // Name variations
    first: "first_name",
    first_name: "first_name",
    firstname: "first_name",
    given_name: "first_name",
    fname: "first_name",

    last: "last_name",
    last_name: "last_name",
    lastname: "last_name",
    surname: "last_name",
    family_name: "last_name",
    lname: "last_name",

    // Email variations
    email: "email",
    email_address: "email",
    e_mail: "email",

    // Company variations
    company: "company",
    company_name: "company",
    organization: "company",
    employer: "company",
    workplace: "company",

    // Additional fields we might want to capture
    dob: "date_of_birth",
    date_of_birth: "date_of_birth",
    birth_date: "date_of_birth",
    birthday: "date_of_birth",

    address: "address",
    street_address: "address",
    street: "address",

    city: "city",
    town: "city",

    state: "state",
    province: "state",

    zip: "zip_code",
    zip_code: "zip_code",
    postal_code: "zip_code",
    postcode: "zip_code",

    job_type: "job_type",
    occupation: "job_type",
    position: "job_type",
    title: "job_type",

    expires: "expires",
    expiry: "expires",
    expiration: "expires",
    expiration_date: "expires",

    last_reminder: "last_reminder",
    reminder: "last_reminder",
    last_contact: "last_reminder",

    notes: "notes",
    comments: "notes",
    remarks: "notes",

    // Additional mappings for your specific CSV format
    days: "days_until_expiry",
    date: "created_at", // This might be the import date
  };

  // First try exact match
  if (fieldMap[fieldName]) {
    return fieldMap[fieldName];
  }

  // Then try case-insensitive match
  const lowerFieldName = fieldName.toLowerCase();
  for (const [key, value] of Object.entries(fieldMap)) {
    if (key.toLowerCase() === lowerFieldName) {
      return value;
    }
  }

  // Handle common Excel header variations
  const excelFieldMap: Record<string, string> = {
    phone: "phone_number",
    first: "first_name",
    last: "last_name",
    dob: "date_of_birth",
    zip: "zip_code",
    "job type": "job_type",
    "last reminder": "last_reminder",
  };

  if (excelFieldMap[lowerFieldName]) {
    return excelFieldMap[lowerFieldName];
  }

  return fieldName;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  imported: number;
  skipped: number;
  errors: ImportError[];
  duplicates: DuplicateInfo[];
  summary: ImportSummary;
}

export interface ImportError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export interface DuplicateInfo {
  row: number;
  phoneNumber: string;
  existingPatient: Patient;
  action: "skip" | "update" | "merge";
}

export interface ImportSummary {
  newPatients: number;
  updatedPatients: number;
  skippedPatients: number;
  errorCount: number;
  duplicateCount: number;
  actualRowsProcessed?: number;
  totalRowsInFile?: number;
  stoppedEarly?: boolean;
}

export interface ImportOptions {
  skipDuplicates: boolean;
  updateExisting: boolean;
  validatePhoneNumbers: boolean;
  validateEmails: boolean;
  batchSize: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const options = JSON.parse(
      (formData.get("options") as string) || "{}"
    ) as Partial<ImportOptions>;
    const sessionId =
      (formData.get("sessionId") as string) ||
      `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const fileExtension = file.name.toLowerCase().split(".").pop();
    if (!["csv", "xlsx", "xls"].includes(fileExtension || "")) {
      return NextResponse.json(
        { success: false, error: "Only CSV and Excel files are supported" },
        { status: 400 }
      );
    }

    // Parse file content based on file type
    let records: any[] = [];

    if (fileExtension === "csv") {
      const csvContent = await file.text();
      records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } else if (["xlsx", "xls"].includes(fileExtension || "")) {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });

      // Get the first worksheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON with header row
      records = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      });

      // Convert to objects with headers and field mapping
      if (records.length > 0) {
        const headers = records[0] as string[];
        records = records.slice(1).map((row: any[]) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            const normalizedHeader =
              header?.toLowerCase().trim() || `column_${index}`;
            // Map common field variations to our standard fields
            const mappedField = mapFieldName(normalizedHeader);
            obj[mappedField] = row[index] || "";
          });
          return obj;
        });
      }
    }

    if (records.length === 0) {
      return NextResponse.json(
        { success: false, error: "File is empty or contains no data" },
        { status: 400 }
      );
    }

    // Set default options
    const importOptions: ImportOptions = {
      skipDuplicates: true,
      updateExisting: true,
      validatePhoneNumbers: true,
      validateEmails: true,
      batchSize: 100,
      ...options,
    };

    // Initialize progress tracking
    updateImportProgress(
      sessionId,
      0,
      records.length,
      `Starting import of ${records.length} contacts...`
    );

    // Process the import with progress tracking
    const result = await processContactImport(
      records,
      importOptions,
      sessionId
    );

    // Complete the progress tracking
    completeImportProgress(sessionId, result);

    return NextResponse.json({
      success: true,
      data: result,
      sessionId,
      progress: {
        status: "completed",
        message: `Import completed: ${result.imported} patients imported, ${result.errors.length} errors`,
        current: result.totalRows,
        total: result.totalRows,
        progress: 100,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Patient import error:", error);

    // Fail the progress tracking
    const sessionId = `import_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    failImportProgress(
      sessionId,
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process patient import",
        message: error instanceof Error ? error.message : "Unknown error",
        sessionId,
        progress: {
          status: "failed",
          message: "Import failed due to an error",
          current: 0,
          total: 0,
          progress: 0,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Process contact import with validation and duplicate handling
 */
async function processContactImport(
  records: any[],
  options: ImportOptions,
  sessionId: string
): Promise<ImportResult> {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not configured");
  }
  const errors: ImportError[] = [];
  const duplicates: DuplicateInfo[] = [];
  const importedPatients: Patient[] = [];
  const updatedPatients: Patient[] = [];
  const skippedRows: number[] = [];

  // Process records with field mapping first
  console.log(`🔧 Processing ${records.length} records with field mapping...`);

  // Log the first record's original keys to see what we're working with
  if (records.length > 0) {
    console.log(
      `📋 Original column names from first record:`,
      Object.keys(records[0])
    );
  }

  const processedRecords = records.map((record, index) => {
    const processedRecord: any = {};
    Object.keys(record).forEach((key) => {
      const mappedField = mapFieldName(key);
      let value = record[key];

      // Convert various date formats for date fields
      if (
        mappedField === "date_of_birth" ||
        mappedField === "expires" ||
        mappedField === "last_reminder"
      ) {
        const convertedDate = convertToDateString(value);
        if (convertedDate) {
          console.log(
            `📅 Converted date: ${record[key]} → ${convertedDate} (${mappedField})`
          );
          value = convertedDate;
        }
      }

      processedRecord[mappedField] = value;

      // Log field mapping for first few records
      if (index < 3) {
        console.log(
          `🔄 Field mapping: "${key}" → "${mappedField}" (value: ${value})`
        );
      }
    });
    return processedRecord;
  });

  // Log the mapped fields from first record
  if (processedRecords.length > 0) {
    console.log(
      `📋 Mapped fields from first record:`,
      Object.keys(processedRecords[0])
    );
  }

  // Validate CSV structure after field mapping
  const requiredFields: string[] = []; // No required fields for now
  const optionalFields = [
    "phone_number",
    "first_name",
    "last_name",
    "email",
    "company",
  ];

  const firstRecord = processedRecords[0];
  const missingFields = requiredFields.filter(
    (field) => !(field in firstRecord)
  );

  if (missingFields.length > 0) {
    return {
      success: false,
      totalRows: processedRecords.length,
      imported: 0,
      skipped: processedRecords.length,
      errors: [
        {
          row: 0,
          field: "structure",
          value: "",
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
      ],
      duplicates: [],
      summary: {
        newPatients: 0,
        updatedPatients: 0,
        skippedPatients: processedRecords.length,
        errorCount: 1,
        duplicateCount: 0,
      },
    };
  }

  // Get existing patients for duplicate detection
  const { data: existingPatients } = await supabaseAdmin
    .from("contacts")
    .select(
      "id, phone_number, first_name, last_name, email, status, created_at, updated_at"
    );

  const existingPhoneNumbers = new Map(
    existingPatients?.map((p) => [p.phone_number, p as Patient]) || []
  );

  // Process each record with detailed logging and progress tracking
  console.log(`🚀 Starting to process ${processedRecords.length} records...`);

  // Smart pre-analysis: Check if file is mostly empty
  console.log(`🔍 Pre-analyzing file structure...`);
  const sampleSize = Math.min(50, processedRecords.length); // Check first 50 rows
  const sampleRows = processedRecords.slice(0, sampleSize);
  const meaningfulRows = sampleRows.filter(
    (row) => row.phone_number || row.first_name || row.last_name || row.company
  );
  const meaningfulPercentage = (meaningfulRows.length / sampleSize) * 100;

  console.log(
    `📊 File analysis: ${
      meaningfulRows.length
    }/${sampleSize} rows have data (${meaningfulPercentage.toFixed(1)}%)`
  );

  if (meaningfulPercentage < 20) {
    console.log(
      `⚠️ Warning: File appears to be mostly empty (${meaningfulPercentage.toFixed(
        1
      )}% meaningful data)`
    );
    console.log(`💡 Consider checking file format or data quality`);
  }

  // Calculate actual rows processed (before stopping at blank rows)
  let actualRowsProcessed = processedRecords.length; // Default to all rows

  // Smart detection: Check if remaining rows are mostly empty
  let consecutiveBlankRows = 0;
  const maxConsecutiveBlankRows = 3; // Reduced threshold

  for (let i = 0; i < processedRecords.length; i++) {
    const record = processedRecords[i];
    const rowNumber = i + 1;

    // Check if row is blank (no phone number, no name, no company)
    const isBlankRow =
      !record.phone_number &&
      !record.first_name &&
      !record.last_name &&
      !record.company;

    if (isBlankRow) {
      consecutiveBlankRows++;
      console.log(
        `⏭️ Row ${rowNumber}: Blank row detected (${consecutiveBlankRows}/${maxConsecutiveBlankRows})`
      );

      // Smart detection: Check if remaining rows are mostly empty
      if (consecutiveBlankRows >= maxConsecutiveBlankRows) {
        // Look ahead to see if the next 10 rows are also empty
        const remainingRows = processedRecords.slice(i + 1, i + 11);
        const emptyRowsAhead = remainingRows.filter(
          (row) =>
            !row.phone_number &&
            !row.first_name &&
            !row.last_name &&
            !row.company
        ).length;

        // If 80% or more of the next 10 rows are empty, stop processing
        if (emptyRowsAhead >= 8) {
          console.log(
            `🧠 Smart detection: ${emptyRowsAhead}/10 remaining rows are empty - stopping import`
          );
          console.log(
            `🛑 Stopping import at row ${rowNumber} - detected end of meaningful data`
          );
          console.log(
            `📊 Processed ${i} rows before stopping (saved processing ${
              processedRecords.length - i
            } empty rows)`
          );
          actualRowsProcessed = i; // Update actual rows processed
          break;
        }
      }
      continue; // Skip this blank row
    } else {
      consecutiveBlankRows = 0; // Reset counter when we find a non-blank row
    }

    // Update progress tracking
    updateImportProgress(
      sessionId,
      rowNumber,
      processedRecords.length,
      `Processing ${rowNumber} of ${processedRecords.length} contacts...`
    );

    // Log progress every 10 rows or for first few rows
    if (
      rowNumber <= 5 ||
      rowNumber % 10 === 0 ||
      rowNumber === processedRecords.length
    ) {
      console.log(
        `📊 Processing row ${rowNumber} of ${
          processedRecords.length
        } (${Math.round((rowNumber / processedRecords.length) * 100)}%)`
      );
      console.log(`🔍 Row ${rowNumber} data:`, {
        first_name: record.first_name,
        last_name: record.last_name,
        phone_number: record.phone_number,
        company: record.company,
        expires: record.expires,
        date_of_birth: record.date_of_birth,
        email: record.email,
        address: record.address,
        city: record.city,
        state: record.state,
        zip_code: record.zip_code,
      });
    }

    try {
      // Validate record
      const validationErrors = validatePatientRecord(record, options);
      if (validationErrors.length > 0) {
        console.log(`❌ Row ${rowNumber} validation errors:`, validationErrors);
        errors.push(
          ...validationErrors.map((error) => ({
            ...error,
            row: rowNumber,
          }))
        );
        skippedRows.push(rowNumber);
        continue;
      }

      // Check for duplicates (only if phone number exists)
      const phoneNumber =
        record.phone_number && record.phone_number.trim() !== ""
          ? normalizePhoneNumber(record.phone_number)
          : null;

      // Skip records without phone numbers - they're not valid patients
      if (!phoneNumber) {
        console.log(
          `⏭️ Row ${rowNumber}: Skipping record without phone number`
        );
        errors.push({
          row: rowNumber,
          field: "phone_number",
          value: record.phone_number || "",
          message: "Phone number is required for patient import",
        });
        skippedRows.push(rowNumber);
        continue;
      }

      const existingPatient = existingPhoneNumbers.get(phoneNumber);

      if (existingPatient) {
        console.log(
          `🔄 Row ${rowNumber}: Found duplicate patient with phone ${phoneNumber}`
        );
        const duplicateInfo: DuplicateInfo = {
          row: rowNumber,
          phoneNumber: phoneNumber || "",
          existingPatient: existingPatient!,
          action: options.updateExisting ? "update" : "skip",
        };
        duplicates.push(duplicateInfo);

        if (options.skipDuplicates && !options.updateExisting) {
          console.log(
            `⏭️ Row ${rowNumber}: Skipping duplicate (skipDuplicates=true)`
          );
          skippedRows.push(rowNumber);
          continue;
        }

        if (options.updateExisting) {
          console.log(`🔄 Row ${rowNumber}: Updating existing patient`);
          // Update existing patient
          const updatedPatient = await updateExistingPatient(
            supabaseAdmin,
            existingPatient.id,
            record
          );
          if (updatedPatient) {
            updatedPatients.push(updatedPatient);
            console.log(`✅ Row ${rowNumber}: Successfully updated patient`);
          } else {
            console.log(`❌ Row ${rowNumber}: Failed to update patient`);
          }
        }
      } else {
        console.log(`🆕 Row ${rowNumber}: Creating new contact`);
        // Create new patient
        const newPatient = await createNewPatient(supabaseAdmin, record);
        if (newPatient) {
          importedPatients.push(newPatient);
          if (phoneNumber) {
            existingPhoneNumbers.set(phoneNumber, newPatient);
          }
          console.log(
            `✅ Row ${rowNumber}: Successfully created patient with ID ${newPatient.id}`
          );
        } else {
          console.log(`❌ Row ${rowNumber}: Failed to create contact`);
        }
      }
    } catch (error) {
      errors.push({
        row: rowNumber,
        field: "processing",
        value: "",
        message: error instanceof Error ? error.message : "Unknown error",
      });
      skippedRows.push(rowNumber);
    }
  }

  console.log(`🎉 Import completed! Summary:`);
  console.log(`   📊 Total rows in file: ${processedRecords.length}`);
  console.log(`   📊 Rows actually processed: ${actualRowsProcessed}`);
  console.log(`   ✅ New contacts created: ${importedPatients.length}`);
  console.log(`   🔄 Contacts updated: ${updatedPatients.length}`);
  console.log(`   ⏭️ Rows skipped: ${skippedRows.length}`);
  console.log(`   ❌ Errors: ${errors.length}`);
  console.log(`   🔄 Duplicates found: ${duplicates.length}`);

  if (actualRowsProcessed < processedRecords.length) {
    const savedRows = processedRecords.length - actualRowsProcessed;
    const efficiencyGain = (
      (savedRows / processedRecords.length) *
      100
    ).toFixed(1);
    console.log(
      `   🛑 Stopped early due to blank rows (saved processing ${savedRows} empty rows)`
    );
    console.log(`   ⚡ Efficiency gain: ${efficiencyGain}% faster processing`);
  }

  return {
    success: errors.length === 0 || importedPatients.length > 0,
    totalRows: actualRowsProcessed, // Use actual rows processed instead of total
    imported: importedPatients.length,
    skipped: skippedRows.length,
    errors,
    duplicates,
    summary: {
      newPatients: importedPatients.length,
      updatedPatients: updatedPatients.length,
      skippedPatients: skippedRows.length,
      errorCount: errors.length,
      duplicateCount: duplicates.length,
      actualRowsProcessed: actualRowsProcessed,
      totalRowsInFile: processedRecords.length,
      stoppedEarly: actualRowsProcessed < processedRecords.length,
    },
  };
}

/**
 * Validate a single patient record
 */
function validatePatientRecord(
  record: any,
  options: ImportOptions
): ImportError[] {
  const errors: ImportError[] = [];

  // Validate phone number (optional for now)
  if (
    record.phone_number &&
    record.phone_number.trim() !== "" &&
    options.validatePhoneNumbers
  ) {
    const normalizedPhone = normalizePhoneNumber(record.phone_number);
    if (!isValidPhoneNumber(normalizedPhone)) {
      errors.push({
        row: 0,
        field: "phone_number",
        value: record.phone_number,
        message: "Invalid phone number format",
      });
    }
  }

  // Validate email if provided
  if (record.email && options.validateEmails) {
    if (!isValidEmail(record.email)) {
      errors.push({
        row: 0,
        field: "email",
        value: record.email,
        message: "Invalid email format",
      });
    }
  }

  // Validate name fields
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

  return errors;
}

/**
 * Create a new patient record
 */
// Helper function to safely convert values to strings and trim
function safeStringTrim(value: any): string | null {
  if (value === null || value === undefined) return null;

  // Handle Date objects
  if (value instanceof Date) {
    return value.toISOString().split("T")[0]; // Return YYYY-MM-DD format
  }

  // Handle Excel serial numbers (dates stored as numbers)
  if (typeof value === "number" && value > 25569) {
    // Excel epoch starts at 1900-01-01
    try {
      // Excel serial number to JavaScript Date
      // Excel counts days since 1900-01-01, but has a bug where it treats 1900 as a leap year
      const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
      const jsDate = new Date(
        excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000
      );
      return jsDate.toISOString().split("T")[0];
    } catch (error) {
      console.warn("Failed to convert Excel serial number to date:", value);
      return null;
    }
  }

  // Convert to string and trim
  const str = String(value).trim();
  return str === "" ? null : str;
}

async function createNewPatient(
  supabase: typeof supabaseAdmin,
  record: any
): Promise<Patient | null> {
  try {
    // Ensure we have a valid phone number - this should have been validated earlier
    const phoneNumber =
      record.phone_number && safeStringTrim(record.phone_number) !== ""
        ? normalizePhoneNumber(safeStringTrim(record.phone_number)!)
        : null;

    if (!phoneNumber) {
      console.error("Cannot create patient without phone number");
      return null;
    }

    const patientData = {
      phone_number: phoneNumber,
      first_name: safeStringTrim(record.first_name),
      last_name: safeStringTrim(record.last_name),
      email: safeStringTrim(record.email),
      date_of_birth:
        safeStringTrim(record.date_of_birth) || safeStringTrim(record.dob),
      company: safeStringTrim(record.company),
      address: safeStringTrim(record.address),
      city: safeStringTrim(record.city),
      state: safeStringTrim(record.state),
      zip_code: safeStringTrim(record.zip_code),
      job_type: safeStringTrim(record.job_type),
      expires: safeStringTrim(record.expires) || safeStringTrim(record.expiry),
      last_reminder: safeStringTrim(record.last_reminder),
      source: "CSV Import",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("contacts")
      .insert(patientData)
      .select()
      .single();

    if (error) {
      console.error("Error creating patient:", patientData, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error creating patient:", error);
    return null;
  }
}

/**
 * Update an existing patient record
 */
async function updateExistingPatient(
  supabase: typeof supabaseAdmin,
  patientId: string,
  record: any
): Promise<Patient | null> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (record.first_name) updateData.first_name = record.first_name.trim();
    if (record.last_name) updateData.last_name = record.last_name.trim();
    if (record.email) updateData.email = record.email.trim();

    const { data, error } = await supabase
      .from("contacts")
      .update(updateData)
      .eq("id", patientId)
      .select()
      .single();

    if (error) {
      console.error("Error updating patient:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error updating patient:", error);
    return null;
  }
}

/**
 * Utility functions
 */
function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

function isValidPhoneNumber(phone: string): boolean {
  // Normalize the phone number first
  const normalized = normalizePhoneNumber(phone);
  // Check if it has at least 7 digits (minimum for a phone number)
  // and starts with + or is 7+ digits
  const phoneRegex = /^(\+\d{7,}|\d{7,})$/;
  return phoneRegex.test(normalized);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
