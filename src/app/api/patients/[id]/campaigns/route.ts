import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: patientId } = await params;

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    // Get all SMS messages for this patient with campaign details
    const { data: smsMessages, error: smsError } = await supabaseAdmin
      .from("sms_messages")
      .select(
        `
        id,
        campaign_id,
        status,
        sent_at,
        delivered_at,
        failed_at,
        campaigns (
          id,
          name,
          message_template
        )
      `
      )
      .eq("patient_id", patientId)
      .order("sent_at", { ascending: false });

    if (smsError) {
      console.error("Error fetching patient campaigns:", smsError);
      return NextResponse.json(
        { error: "Failed to fetch patient campaigns" },
        { status: 500 }
      );
    }

    // Transform the data to include campaign information
    const campaigns =
      smsMessages?.map((sms) => ({
        id: sms.id,
        campaign_id: sms.campaign_id,
        name: sms.campaigns?.[0]?.name || "Unknown Campaign",
        status: sms.status,
        sent_at: sms.sent_at,
        delivered_at: sms.delivered_at,
        failed_at: sms.failed_at,
      })) || [];

    // Get unique campaigns (in case multiple SMS were sent for the same campaign)
    const uniqueCampaigns = campaigns.reduce((acc, campaign) => {
      const existing = acc.find((c) => c.campaign_id === campaign.campaign_id);
      if (!existing) {
        acc.push(campaign);
      } else {
        // Keep the most recent status
        if (new Date(campaign.sent_at) > new Date(existing.sent_at)) {
          const index = acc.findIndex(
            (c) => c.campaign_id === campaign.campaign_id
          );
          acc[index] = campaign;
        }
      }
      return acc;
    }, [] as typeof campaigns);

    // Get campaign statistics
    const stats = {
      total: uniqueCampaigns.length,
      delivered: uniqueCampaigns.filter((c) => c.status === "delivered").length,
      sent: uniqueCampaigns.filter((c) => c.status === "sent").length,
      failed: uniqueCampaigns.filter((c) => c.status === "failed").length,
      pending: uniqueCampaigns.filter((c) => c.status === "pending").length,
    };

    return NextResponse.json({
      campaigns: uniqueCampaigns,
      stats,
      patient_id: patientId,
    });
  } catch (error) {
    console.error("Error in patient campaigns API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
