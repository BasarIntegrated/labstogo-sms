// API route to start campaigns (frontend-only implementation)
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { patientIds } = await request.json();
    const { id: campaignId } = await params;

    console.log("Starting campaign:", campaignId);

    // Update campaign status to active
    const { data: campaign, error: updateError } = await supabaseAdmin
      .from("campaigns")
      .update({ 
        status: "active",
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", campaignId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating campaign:", updateError);
      return NextResponse.json(
        { error: "Failed to start campaign" },
        { status: 500 }
      );
    }

    console.log("Campaign started successfully:", campaign);

    return NextResponse.json({
      success: true,
      message: "Campaign started successfully",
      campaign: campaign,
      patientCount: patientIds?.length || 0
    });
  } catch (error) {
    console.error("Campaign start error:", error);
    return NextResponse.json(
      { error: "Failed to start campaign" },
      { status: 500 }
    );
  }
}
