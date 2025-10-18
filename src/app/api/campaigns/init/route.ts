import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// Create initial renewal campaign template
export async function POST(request: NextRequest) {
  try {
    // Create the initial Medical License Renewal campaign
    const { data: campaign, error } = await supabaseAdmin
      .from("campaigns")
      .insert({
        name: "Medical License Renewal",
        description: "Standard reminder for medical license renewals",
        message_template:
          "Hi {{first_name}}, your medical license ({{license_number}}) expires on {{renewal_deadline}}. Please renew to avoid any interruption in practice. Reply STOP to opt out.",
        campaign_type: "renewal_reminder",
        status: "draft",
        license_types: ["Medical"],
        specialties: [],
        reminder_frequency: "weekly",
        max_reminders: 5,
        total_patients: 0,
        sent_count: 0,
        delivered_count: 0,
        failed_count: 0,
        created_by: "00000000-0000-0000-0000-000000000000", // Use a valid UUID
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating initial campaign:", error);
      return NextResponse.json(
        { error: "Failed to create initial campaign", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error("Error in initial campaign creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
