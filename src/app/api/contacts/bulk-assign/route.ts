import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// POST /api/contacts/bulk-assign - Bulk assign contacts to group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactIds, groupId } = body;

    // Validate input
    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: "Contact IDs are required" },
        { status: 400 }
      );
    }

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    console.log(`Assigning ${contactIds.length} contacts to group ${groupId}`);

    // Update all contacts to assign them to the group
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .update({ group_id: groupId })
      .in("id", contactIds)
      .select();

    if (error) {
      console.error("Error assigning contacts to group:", error);
      return NextResponse.json(
        { error: "Failed to assign contacts to group" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      assigned: data?.length || 0,
      contacts: data,
    });
  } catch (error) {
    console.error("Error in bulk-assign POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
