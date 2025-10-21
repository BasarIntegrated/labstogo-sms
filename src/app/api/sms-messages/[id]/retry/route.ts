import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: smsMessageId } = await params;
    const { retryReason } = await request.json();

    // Get the SMS message details
    const { data: smsMessage, error: fetchError } = await supabaseAdmin
      .from("sms_messages")
      .select(
        `
        id,
        campaign_id,
        contact_id,
        phone_number,
        message,
        status,
        retry_count,
        last_retry_at,
        provider_response,
        contacts (
          id,
          first_name,
          last_name,
          phone_number
        ),
        campaigns (
          id,
          name,
          status
        )
      `
      )
      .eq("id", smsMessageId)
      .single();

    if (fetchError || !smsMessage) {
      console.error("Error fetching SMS message:", fetchError);
      return NextResponse.json(
        { error: "SMS message not found" },
        { status: 404 }
      );
    }

    // Check if the message is in a retryable state
    if (smsMessage.status !== "failed") {
      return NextResponse.json(
        { error: "Only failed messages can be retried" },
        { status: 400 }
      );
    }

    // Check if the campaign is still active
    if (smsMessage.campaigns?.[0]?.status !== "active") {
      return NextResponse.json(
        { error: "Campaign is not active" },
        { status: 400 }
      );
    }

    // Reset the SMS message status to pending and increment retry count
    const currentRetryCount = smsMessage.retry_count || 0;
    const { data: updatedMessage, error: updateError } = await supabaseAdmin
      .from("sms_messages")
      .update({
        status: "pending",
        failed_at: null,
        retry_count: currentRetryCount + 1,
        last_retry_at: new Date().toISOString(),
        provider_response: {
          ...smsMessage.provider_response,
          retryReason: retryReason || "Manual retry",
          retryAt: new Date().toISOString(),
          retryCount: currentRetryCount + 1,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", smsMessageId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating SMS message:", updateError);
      return NextResponse.json(
        { error: "Failed to update SMS message" },
        { status: 500 }
      );
    }

    // Call backend to process the retry
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "https://bumpy-field-production.up.railway.app";

    try {
      const backendResponse = await fetch(
        `${backendUrl}/api/process-pending-sms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.BACKEND_API_KEY || "dev-key"}`,
          },
        }
      );

      if (!backendResponse.ok) {
        console.error("Backend retry failed:", await backendResponse.text());
        // Don't fail the request, just log the error
      }
    } catch (backendError) {
      console.error("Error calling backend for retry:", backendError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      message: "SMS message queued for retry",
      smsMessage: updatedMessage,
    });
  } catch (error) {
    console.error("Error retrying SMS message:", error);
    return NextResponse.json(
      { error: "Failed to retry SMS message" },
      { status: 500 }
    );
  }
}
