import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

/**
 * Delivery Status API Endpoint
 *
 * Returns count of messages by status (delivered, failed, pending)
 * for both SMS and Email messages.
 */
export async function GET() {
  try {
    // Fetch SMS messages status counts
    const { data: smsMessages, error: smsError } = await supabaseAdmin
      .from("sms_messages")
      .select("status");

    // Fetch Email messages status counts
    const { data: emailMessages, error: emailError } = await supabaseAdmin
      .from("email_messages")
      .select("status");

    if (smsError || emailError) {
      console.error("Error fetching delivery status:", smsError || emailError);
    }

    // Combine all messages
    const allMessages = [...(smsMessages || []), ...(emailMessages || [])];

    // Count by status
    const counts = {
      delivered: 0,
      sent: 0,
      failed: 0,
      pending: 0,
      total: allMessages.length,
    };

    allMessages.forEach((msg: any) => {
      const status = msg.status?.toLowerCase() || "pending";
      if (status === "delivered") {
        counts.delivered++;
      } else if (status === "sent") {
        counts.sent++;
      } else if (status === "failed") {
        counts.failed++;
      } else {
        counts.pending++;
      }
    });

    // Calculate total delivered (delivered + sent are both considered successful)
    const totalDelivered = counts.delivered + counts.sent;

    return NextResponse.json({
      success: true,
      data: {
        delivered: totalDelivered,
        sent: counts.sent,
        failed: counts.failed,
        pending: counts.pending,
        total: counts.total,
      },
    });
  } catch (error) {
    console.error("Delivery status API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch delivery status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
