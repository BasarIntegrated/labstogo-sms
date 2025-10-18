import { supabaseAdmin } from "@/lib/supabase";
import csv from "csv-parser";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const strategy = (formData.get("strategy") as string) || "skip"; // "skip" or "upsert"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only CSV files are allowed" },
        { status: 400 }
      );
    }

    // Parse CSV file
    const csvData: any[] = [];
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer.toString());

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on("data", (row) => {
          // Clean and validate phone number
          if (row.phone_number) {
            row.phone_number = row.phone_number.replace(/[^\d+]/g, "");
            if (!row.phone_number.startsWith("+")) {
              row.phone_number = "+1" + row.phone_number;
            }
          }
          csvData.push(row);
        })
        .on("end", resolve)
        .on("error", reject);
    });

    if (csvData.length === 0) {
      return NextResponse.json(
        { error: "No data found in CSV file" },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ["phone_number"];
    const missingFields = requiredFields.filter(
      (field) => !csvData[0].hasOwnProperty(field)
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
          requiredFields: ["phone_number"],
          optionalFields: ["first_name", "last_name", "email", "company"],
        },
        { status: 400 }
      );
    }

    // Process patients one by one to handle duplicates gracefully
    const results = {
      successful: 0,
      duplicates: 0,
      updated: 0,
      errors: 0,
      details: [] as any[],
    };

    for (const patient of csvData) {
      try {
        // Check if phone number already exists
        const { data: existingPatient } = await supabaseAdmin
          .from("patients")
          .select("id, phone_number")
          .eq("phone_number", patient.phone_number)
          .single();

        const patientData = {
          phone_number: patient.phone_number,
          first_name: patient.first_name || null,
          last_name: patient.last_name || null,
          email: patient.email || null,
          company: patient.company || null,
          source: "CSV Upload",
          status: "active",
          updated_at: new Date().toISOString(),
        };

        if (existingPatient) {
          if (strategy === "skip") {
            // SKIP strategy: Don't update existing patients
            results.duplicates++;
            results.details.push({
              phone_number: patient.phone_number,
              status: "duplicate",
              message: "Phone number already exists - skipped",
            });
            continue;
          } else if (strategy === "upsert") {
            // UPSERT strategy: Update existing patients
            const { data: updatedPatient, error: updateError } =
              await supabaseAdmin
                .from("patients")
                .update(patientData)
                .eq("id", existingPatient.id)
                .select()
                .single();

            if (updateError) {
              results.errors++;
              results.details.push({
                phone_number: patient.phone_number,
                status: "error",
                message: updateError.message,
              });
            } else {
              results.updated++;
              results.details.push({
                phone_number: patient.phone_number,
                status: "updated",
                patient: {
                  ...updatedPatient,
                  status: updatedPatient.status?.toLowerCase() || "active",
                },
              });
            }
            continue;
          }
        }

        // Insert new patient (only if it doesn't exist)
        const { data: newPatient, error: insertError } = await supabaseAdmin
          .from("patients")
          .insert({
            ...patientData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          results.errors++;
          results.details.push({
            phone_number: patient.phone_number,
            status: "error",
            message: insertError.message,
          });
        } else {
          results.successful++;
          results.details.push({
            phone_number: patient.phone_number,
            status: "success",
            patient: {
              ...newPatient,
              status: newPatient.status?.toLowerCase() || "active",
            },
          });
        }
      } catch (error: any) {
        results.errors++;
        results.details.push({
          phone_number: patient.phone_number,
          status: "error",
          message: error.message || "Unknown error",
        });
      }
    }

    const message =
      strategy === "upsert"
        ? `Processed ${csvData.length} patients: ${results.successful} new, ${results.updated} updated, ${results.errors} errors`
        : `Processed ${csvData.length} patients: ${results.successful} successful, ${results.duplicates} duplicates, ${results.errors} errors`;

    return NextResponse.json({
      success: true,
      message,
      strategy,
      summary: {
        total: csvData.length,
        successful: results.successful,
        duplicates: results.duplicates,
        updated: results.updated,
        errors: results.errors,
      },
      details: results.details,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process CSV file" },
      { status: 500 }
    );
  }
}
