import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/campaigns - Fetch all campaigns
export async function GET(request: NextRequest) {
  try {
    const { data: campaigns, error } = await supabaseAdmin
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching campaigns:", error);
      return NextResponse.json(
        { error: "Failed to fetch campaigns" },
        { status: 500 }
      );
    }

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Error in campaigns GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      message_template,
      status = "draft",
      recipient_type = "all",
      recipient_groups,
      recipient_contacts,
      scheduled_at,
      created_by,
    } = body;

    if (!name || !message_template) {
      return NextResponse.json(
        { error: "Name and message template are required" },
        { status: 400 }
      );
    }

    // Create campaign with provided fields
    const campaignData: any = {
      name,
      description: description || "",
      message_template,
      status,
      recipient_type,
      created_by: created_by || "550e8400-e29b-41d4-a716-446655440000",
    };

    // Add optional fields if provided
    if (recipient_groups) campaignData.recipient_groups = recipient_groups;
    if (recipient_contacts)
      campaignData.recipient_contacts = recipient_contacts;
    if (scheduled_at) campaignData.scheduled_at = scheduled_at;

    console.log("Creating campaign with data:", campaignData);

    const { data: campaign, error } = await supabaseAdmin
      .from("campaigns")
      .insert(campaignData)
      .select()
      .single();

    if (error) {
      console.error("Error creating campaign:", error);
      return NextResponse.json(
        { error: "Failed to create campaign", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error("Error in campaigns POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/campaigns - Update existing campaign
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      message_template,
      status,
      recipient_type,
      recipient_groups,
      recipient_contacts,
      scheduled_at,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Campaign ID is required for updates" },
        { status: 400 }
      );
    }

    if (!name || !message_template) {
      return NextResponse.json(
        { error: "Name and message template are required" },
        { status: 400 }
      );
    }

    // Update campaign with provided fields
    const updateData: any = {
      name,
      description: description || "",
      message_template,
      updated_at: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (status) updateData.status = status;
    if (recipient_type) updateData.recipient_type = recipient_type;
    if (recipient_groups) updateData.recipient_groups = recipient_groups;
    if (recipient_contacts) updateData.recipient_contacts = recipient_contacts;
    if (scheduled_at) updateData.scheduled_at = scheduled_at;

    console.log("Updating campaign with data:", updateData);

    const { data: campaign, error } = await supabaseAdmin
      .from("campaigns")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating campaign:", error);
      return NextResponse.json(
        { error: "Failed to update campaign", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ campaign }, { status: 200 });
  } catch (error) {
    console.error("Error in campaigns PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns - Delete campaign
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const campaignId = url.searchParams.get("id");

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required for deletion" },
        { status: 400 }
      );
    }

    console.log("Deleting campaign:", campaignId);

    const { error } = await supabaseAdmin
      .from("campaigns")
      .delete()
      .eq("id", campaignId);

    if (error) {
      console.error("Error deleting campaign:", error);
      return NextResponse.json(
        { error: "Failed to delete campaign", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Campaign deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in campaigns DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
