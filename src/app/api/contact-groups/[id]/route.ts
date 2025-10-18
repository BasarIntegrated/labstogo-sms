import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/contact-groups/[id] - Get specific contact group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: group, error } = await supabaseAdmin
      .from("contact_groups")
      .select(
        `
        *,
        contacts(count)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching contact group:", error);
      return NextResponse.json(
        { error: "Contact group not found" },
        { status: 404 }
      );
    }

    // Process group to include contact count
    const processedGroup = {
      ...group,
      contact_count: group.contacts?.[0]?.count || 0,
    };

    return NextResponse.json({ group: processedGroup });
  } catch (error) {
    console.error("Error in contact group GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/contact-groups/[id] - Update contact group
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, color } = body;

    const updateData: Record<string, string | null> = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || null;
    if (color !== undefined) updateData.color = color;

    const { data: group, error } = await supabaseAdmin
      .from("contact_groups")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating contact group:", error);
      return NextResponse.json(
        { error: "Failed to update contact group" },
        { status: 500 }
      );
    }

    return NextResponse.json({ group });
  } catch (error) {
    console.error("Error in contact group PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/contact-groups/[id] - Delete contact group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First, remove all contacts from this group
    const { error: updateError } = await supabaseAdmin
      .from("contacts")
      .update({ group_id: null })
      .eq("group_id", id);

    if (updateError) {
      console.error("Error removing contacts from group:", updateError);
      return NextResponse.json(
        { error: "Failed to remove contacts from group" },
        { status: 500 }
      );
    }

    // Then delete the group
    const { error } = await supabaseAdmin
      .from("contact_groups")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting contact group:", error);
      return NextResponse.json(
        { error: "Failed to delete contact group" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in contact group DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
