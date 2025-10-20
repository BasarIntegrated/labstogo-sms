import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    console.log("Fetching campaign details:", campaignId);

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error("Campaign not found:", campaignError);
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    console.log("Found campaign:", campaign.name);

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}