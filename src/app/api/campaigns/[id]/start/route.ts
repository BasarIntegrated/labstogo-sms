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

    // First, get the current campaign to check its status
    const { data: currentCampaign, error: fetchError } = await supabaseAdmin
      .from("campaigns")
      .select("status, completed_at")
      .eq("id", campaignId)
      .single();

    if (fetchError) {
      console.error("Error fetching campaign:", fetchError);
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status: "active",
      updated_at: new Date().toISOString(),
    };

    // If this is a restart (cancelled campaign), clear completed_at and reset sent_at
    if (currentCampaign.status === "cancelled") {
      updateData.completed_at = null;
      updateData.sent_at = new Date().toISOString();
    } else if (currentCampaign.status === "draft") {
      // For new campaigns, set sent_at
      updateData.sent_at = new Date().toISOString();
    }

    // Update campaign status to active
    const { data: campaign, error: updateError } = await supabaseAdmin
      .from("campaigns")
      .update(updateData)
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

    // Get campaign recipients and process them
    const { data: fullCampaign, error: campaignError } = await supabaseAdmin
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError) {
      console.error("Error fetching campaign details:", campaignError);
      return NextResponse.json(
        {
          error: "Failed to fetch campaign details",
          details: campaignError?.message,
          code: campaignError?.code,
          hint: campaignError?.hint,
        },
        { status: 500 }
      );
    }

    if (!fullCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    console.log("Full campaign data:", JSON.stringify(fullCampaign, null, 2));

    let processedCount = 0;
    let errorCount = 0;

    // Handle recipient_contacts - it might be an array or JSON string
    let recipientContacts = fullCampaign.recipient_contacts;
    if (typeof recipientContacts === "string") {
      try {
        recipientContacts = JSON.parse(recipientContacts);
      } catch (e) {
        console.error("Failed to parse recipient_contacts:", e);
        recipientContacts = [];
      }
    }
    if (!Array.isArray(recipientContacts)) {
      recipientContacts = [];
    }

    // Process recipients if they exist by calling the backend
    if (recipientContacts && recipientContacts.length > 0) {
      console.log(
        `Processing ${recipientContacts.length} recipients for campaign ${campaignId}`
      );

      try {
        // Call backend to process new contacts
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          "https://bumpy-field-production.up.railway.app";

        const endpoint =
          fullCampaign.campaign_type === "email"
            ? `${backendUrl}/api/campaigns/${campaignId}/process-new-contacts`
            : `${backendUrl}/api/campaigns/${campaignId}/process-new-contacts`;

        const backendResponse = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.BACKEND_API_KEY || "dev-key"}`,
          },
          body: JSON.stringify({
            contactIds: recipientContacts,
          }),
        });

        if (backendResponse.ok) {
          const backendResult = await backendResponse.json();
          console.log(
            `Backend processed ${fullCampaign.campaign_type} contacts:`,
            backendResult
          );
          processedCount =
            backendResult.processedContacts || recipientContacts.length;
        } else {
          console.error(
            "Backend failed to process contacts:",
            await backendResponse.text()
          );
          errorCount = recipientContacts.length;
        }
      } catch (error) {
        console.error("Error calling backend for contact processing:", error);
        // Don't fail the entire request, just log the error
        if (recipientContacts && recipientContacts.length > 0) {
          errorCount = recipientContacts.length;
        }
      }
    } else {
      console.log(
        "No recipients assigned to campaign, skipping SMS processing"
      );
    }

    const isRestart = currentCampaign.status === "cancelled";
    const message = isRestart
      ? "Campaign restarted successfully"
      : "Campaign started successfully";

    return NextResponse.json({
      success: true,
      message: message,
      campaign: campaign,
      patientCount: recipientContacts?.length || 0,
      processedCount: processedCount,
      errorCount: errorCount,
      isRestart: isRestart,
    });
  } catch (error: any) {
    console.error("Campaign start error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        error: "Failed to start campaign",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
