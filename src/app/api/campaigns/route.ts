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
      campaign_type = "renewal_reminder",
      filters,
      renewal_deadline_start,
      renewal_deadline_end,
      license_types,
      specialties,
      reminder_frequency,
      max_reminders,
    } = body;

    if (!name || !message_template) {
      return NextResponse.json(
        { error: "Name and message template are required" },
        { status: 400 }
      );
    }

    // Create campaign with minimal required fields
    const campaignData = {
      name,
      description: description || "",
      message_template,
      created_by: "550e8400-e29b-41d4-a716-446655440000", // Different UUID format
    };

    console.log("Creating campaign with data:", campaignData);

    // Skip optional fields that don't exist in current schema to avoid errors
    // These fields will be added when the database schema is updated
    // if (campaign_type) campaignData.campaign_type = campaign_type;
    // if (renewal_deadline_start) campaignData.renewal_deadline_start = renewal_deadline_start;
    // if (renewal_deadline_end) campaignData.renewal_deadline_end = renewal_deadline_end;
    // if (license_types) campaignData.license_types = license_types;
    // if (specialties) campaignData.specialties = specialties;
    // if (reminder_frequency) campaignData.reminder_frequency = reminder_frequency;
    // if (max_reminders) campaignData.max_reminders = max_reminders;

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
