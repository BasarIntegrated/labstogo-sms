import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    // Fetch SMS messages for this campaign
    const { data: smsMessages, error: smsError } = await supabaseAdmin
      .from("sms_messages")
      .select(
        `
        id,
        campaign_id,
        contact_id,
        phone_number,
        message,
        status,
        provider_message_id,
        provider_response,
        sent_at,
        delivered_at,
        failed_at,
        retry_count,
        last_retry_at,
        created_at,
        updated_at,
        contacts (
          id,
          first_name,
          last_name,
          phone_number
        )
      `
      )
      .eq("campaign_id", campaignId)
      .order("updated_at", { ascending: false });

    if (smsError) {
      console.error("Error fetching SMS messages:", smsError);
      return NextResponse.json(
        { error: "Failed to fetch SMS messages" },
        { status: 500 }
      );
    }

    return NextResponse.json(smsMessages || []);
  } catch (error) {
    console.error("Error fetching SMS messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch SMS messages" },
      { status: 500 }
    );
  }
}
