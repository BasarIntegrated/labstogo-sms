import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientIds, operation, parameters } = body;

    if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
      return NextResponse.json(
        { error: "Patient IDs are required" },
        { status: 400 }
      );
    }

    if (!operation) {
      return NextResponse.json(
        { error: "Operation is required" },
        { status: 400 }
      );
    }

    let result;

    switch (operation) {
      case "update_status":
        if (!parameters?.status) {
          return NextResponse.json(
            { error: "Status is required for update operation" },
            { status: 400 }
          );
        }

        const { data: updateData, error: updateError } = await supabase
          .from("patients")
          .update({ status: parameters.status })
          .in("id", patientIds)
          .select();

        if (updateError) {
          console.error("Error updating patient status:", updateError);
          return NextResponse.json(
            { error: "Failed to update patient status" },
            { status: 500 }
          );
        }

        result = updateData;
        break;

      case "add_tags":
        if (!parameters?.tags || !Array.isArray(parameters.tags)) {
          return NextResponse.json(
            { error: "Tags array is required for add_tags operation" },
            { status: 400 }
          );
        }

        // Get current patients with their tags
        const { data: currentPatients, error: fetchError } = await supabase
          .from("patients")
          .select("id, tags")
          .in("id", patientIds);

        if (fetchError) {
          console.error("Error fetching patients:", fetchError);
          return NextResponse.json(
            { error: "Failed to fetch patients" },
            { status: 500 }
          );
        }

        // Update tags by adding new ones
        const tagUpdates = currentPatients.map((patient) => ({
          id: patient.id,
          tags: [...new Set([...(patient.tags || []), ...parameters.tags])],
        }));

        const { data: tagData, error: tagError } = await supabase
          .from("patients")
          .upsert(tagUpdates)
          .select();

        if (tagError) {
          console.error("Error updating patient tags:", tagError);
          return NextResponse.json(
            { error: "Failed to update patient tags" },
            { status: 500 }
          );
        }

        result = tagData;
        break;

      case "remove_tags":
        if (!parameters?.tags || !Array.isArray(parameters.tags)) {
          return NextResponse.json(
            { error: "Tags array is required for remove_tags operation" },
            { status: 400 }
          );
        }

        // Get current patients with their tags
        const { data: currentPatientsRemove, error: fetchErrorRemove } =
          await supabase
            .from("patients")
            .select("id, tags")
            .in("id", patientIds);

        if (fetchErrorRemove) {
          console.error("Error fetching patients:", fetchErrorRemove);
          return NextResponse.json(
            { error: "Failed to fetch patients" },
            { status: 500 }
          );
        }

        // Update tags by removing specified ones
        const tagRemoveUpdates = currentPatientsRemove.map((patient) => ({
          id: patient.id,
          tags: (patient.tags || []).filter(
            (tag: string) => !parameters.tags.includes(tag)
          ),
        }));

        const { data: tagRemoveData, error: tagRemoveError } = await supabase
          .from("patients")
          .upsert(tagRemoveUpdates)
          .select();

        if (tagRemoveError) {
          console.error("Error updating patient tags:", tagRemoveError);
          return NextResponse.json(
            { error: "Failed to update patient tags" },
            { status: 500 }
          );
        }

        result = tagRemoveData;
        break;

      case "delete":
        const { data: deleteData, error: deleteError } = await supabase
          .from("patients")
          .delete()
          .in("id", patientIds)
          .select();

        if (deleteError) {
          console.error("Error deleting patients:", deleteError);
          return NextResponse.json(
            { error: "Failed to delete patients" },
            { status: 500 }
          );
        }

        result = deleteData;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid operation" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      operation,
      affectedCount: result?.length || 0,
      data: result,
    });
  } catch (error) {
    console.error("Error in bulk operations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
