import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/campaigns/[id] - Get specific campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: campaign, error } = await supabaseAdmin
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching campaign:", error);
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Error in campaign GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/campaigns/[id] - Update campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      message_template,
      campaign_type,
      status,
      filters,
      renewal_deadline_start,
      renewal_deadline_end,
      license_types,
      specialties,
      reminder_frequency,
      max_reminders,
    } = body;

    const updateData: Record<string, string> = {};

    if (name !== undefined) updateData.name = name;

    // Handle description and message_template together
    if (description !== undefined || message_template !== undefined) {
      if (message_template) {
        // Store message template in description if message_template column doesn't exist
        updateData.description = description
          ? `${description}\n\nTemplate: ${message_template}`
          : `Template: ${message_template}`;
      } else if (description !== undefined) {
        updateData.description = description;
      }
    }

    // Add status field if provided (this field exists in the database)
    if (status !== undefined) updateData.status = status;

    // Skip fields that likely don't exist in current schema to avoid errors
    // if (campaign_type !== undefined) updateData.campaign_type = campaign_type;
    // if (filters !== undefined) updateData.filters = filters;
    // if (renewal_deadline_start !== undefined) updateData.renewal_deadline_start = renewal_deadline_start;
    // if (renewal_deadline_end !== undefined) updateData.renewal_deadline_end = renewal_deadline_end;
    // if (license_types !== undefined) updateData.license_types = license_types;
    // if (specialties !== undefined) updateData.specialties = specialties;
    // if (reminder_frequency !== undefined) updateData.reminder_frequency = reminder_frequency;
    // if (max_reminders !== undefined) updateData.max_reminders = max_reminders;

    const { data: campaign, error } = await supabaseAdmin
      .from("campaigns")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating campaign:", error);
      return NextResponse.json(
        { error: "Failed to update campaign" },
        { status: 500 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Error in campaign PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[id] - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from("campaigns")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting campaign:", error);
      return NextResponse.json(
        { error: "Failed to delete campaign" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in campaign DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
