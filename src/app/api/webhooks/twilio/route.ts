import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const messageSid = formData.get("MessageSid") as string;
    const messageStatus = formData.get("MessageStatus") as string;
    const errorCode = formData.get("ErrorCode") as string;
    const errorMessage = formData.get("ErrorMessage") as string;

    if (!messageSid) {
      return NextResponse.json(
        { error: "MessageSid is required" },
        { status: 400 }
      );
    }

    // Find the SMS message by provider_message_id
    const { data: smsMessage, error: fetchError } = await supabaseAdmin
      .from("sms_messages")
      .select("*")
      .eq("provider_message_id", messageSid)
      .single();

    if (fetchError || !smsMessage) {
      console.error("SMS message not found for MessageSid:", messageSid);
      return NextResponse.json(
        { error: "SMS message not found" },
        { status: 404 }
      );
    }

    // Update SMS message status based on Twilio webhook
    const updateData: Record<string, string> = {
      updated_at: new Date().toISOString(),
    };

    switch (messageStatus) {
      case "delivered":
        updateData.status = "delivered";
        updateData.delivered_at = new Date().toISOString();
        break;
      case "failed":
      case "undelivered":
        updateData.status = "failed";
        updateData.failed_at = new Date().toISOString();
        updateData.error_message = errorMessage || "Message delivery failed";
        break;
      case "sent":
        updateData.status = "sent";
        break;
      default:
        // For other statuses, just update the provider response
        updateData.provider_response = {
          ...smsMessage.provider_response,
          status: messageStatus,
          errorCode,
          errorMessage,
        };
    }

    const { error: updateError } = await supabaseAdmin
      .from("sms_messages")
      .update(updateData)
      .eq("id", smsMessage.id);

    if (updateError) {
      console.error("Error updating SMS message:", updateError);
      return NextResponse.json(
        { error: "Failed to update SMS message" },
        { status: 500 }
      );
    }

    // Update campaign statistics if message was delivered or failed
    if (messageStatus === "delivered" || messageStatus === "failed") {
      const { data: campaign, error: campaignError } = await supabaseAdmin
        .from("campaigns")
        .select("delivered_count, failed_count")
        .eq("id", smsMessage.campaign_id)
        .single();

      if (!campaignError && campaign) {
        const updateCampaignData: Record<string, number> = {};

        if (messageStatus === "delivered") {
          updateCampaignData.delivered_count = campaign.delivered_count + 1;
        } else if (messageStatus === "failed") {
          updateCampaignData.failed_count = campaign.failed_count + 1;
        }

        await supabaseAdmin
          .from("campaigns")
          .update(updateCampaignData)
          .eq("id", smsMessage.campaign_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing Twilio webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
