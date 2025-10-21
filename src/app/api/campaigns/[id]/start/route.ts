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
      .select("recipient_contacts, message_template")
      .eq("id", campaignId)
      .single();

    if (campaignError || !fullCampaign) {
      console.error("Error fetching campaign details:", campaignError);
      return NextResponse.json(
        { error: "Failed to fetch campaign details" },
        { status: 500 }
      );
    }

    let processedCount = 0;
    let errorCount = 0;

    // Process recipients if they exist by calling the backend
    if (
      fullCampaign.recipient_contacts &&
      fullCampaign.recipient_contacts.length > 0
    ) {
      console.log(
        `Processing ${fullCampaign.recipient_contacts.length} recipients for campaign ${campaignId}`
      );

      try {
        // Call backend to process new contacts
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          "https://bumpy-field-production.up.railway.app";
        const backendResponse = await fetch(
          `${backendUrl}/api/campaigns/${campaignId}/process-new-contacts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${
                process.env.BACKEND_API_KEY || "dev-key"
              }`,
            },
            body: JSON.stringify({
              contactIds: fullCampaign.recipient_contacts,
            }),
          }
        );

        if (backendResponse.ok) {
          const backendResult = await backendResponse.json();
          console.log("Backend processed contacts:", backendResult);
          processedCount =
            backendResult.processedContacts ||
            fullCampaign.recipient_contacts.length;
        } else {
          console.error(
            "Backend failed to process contacts:",
            await backendResponse.text()
          );
          errorCount = fullCampaign.recipient_contacts.length;
        }
      } catch (error) {
        console.error("Error calling backend for contact processing:", error);
        // Don't fail the entire request, just log the error
        errorCount = fullCampaign.recipient_contacts.length;
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
      patientCount: fullCampaign.recipient_contacts?.length || 0,
      processedCount: processedCount,
      errorCount: errorCount,
      isRestart: isRestart,
    });
  } catch (error) {
    console.error("Campaign start error:", error);
    return NextResponse.json(
      { error: "Failed to start campaign" },
      { status: 500 }
    );
  }
}
