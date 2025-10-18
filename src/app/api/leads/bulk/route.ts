import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, patientIds, updates, tags } = body;

    if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
      return NextResponse.json(
        { error: "Patient IDs are required" },
        { status: 400 }
      );
    }

    let result;

    switch (operation) {
      case "update_status":
        if (!updates?.status) {
          return NextResponse.json(
            { error: "Status is required for update operation" },
            { status: 400 }
          );
        }

        result = await supabase
          .from("patients")
          .update({
            status: updates.status,
            updated_at: new Date().toISOString(),
          })
          .in("id", patientIds)
          .select();

        if (result.error) throw result.error;

        return NextResponse.json({
          success: true,
          message: `Updated status for ${result.data.length} patients`,
          data: result.data,
        });

      case "add_tags":
      case "remove_tags":
        if (!tags || !Array.isArray(tags) || tags.length === 0) {
          return NextResponse.json(
            { error: "Tags are required for tag operations" },
            { status: 400 }
          );
        }

        // Get current patients with tags
        const { data: currentPatients, error: fetchError } = await supabase
          .from("patients")
          .select("id, tags")
          .in("id", patientIds);

        if (fetchError) throw fetchError;

        // Update tags based on operation
        const tagUpdates = currentPatients?.map((patient) => {
          let newTags = patient.tags || [];

          if (operation === "add_tags") {
            newTags = [...new Set([...newTags, ...tags])];
          } else if (operation === "remove_tags") {
            newTags = newTags.filter((tag: string) => !tags.includes(tag));
          }

          return {
            id: patient.id,
            tags: newTags,
            updated_at: new Date().toISOString(),
          };
        });

        if (!tagUpdates) {
          return NextResponse.json(
            { error: "No patients found to update" },
            { status: 404 }
          );
        }

        result = await supabase.from("patients").upsert(tagUpdates).select();

        if (result.error) throw result.error;

        return NextResponse.json({
          success: true,
          message: `${
            operation === "add_tags" ? "Added" : "Removed"
          } tags for ${result.data.length} patients`,
          data: result.data,
        });

      case "delete":
        result = await supabase
          .from("patients")
          .delete()
          .in("id", patientIds)
          .select();

        if (result.error) throw result.error;

        return NextResponse.json({
          success: true,
          message: `Deleted ${result.data.length} patients`,
          data: result.data,
        });

      default:
        return NextResponse.json(
          { error: "Invalid operation" },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    console.error("Bulk operation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Bulk operation failed",
      },
      { status: 500 }
    );
  }
}
