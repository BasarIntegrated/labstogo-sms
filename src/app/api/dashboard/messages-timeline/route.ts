import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

/**
 * Messages Timeline API Endpoint
 *
 * Returns message counts grouped by date for the last 30 days,
 * showing SMS and Email separately.
 */
export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Fetch SMS messages for last 30 days
    const { data: smsMessages, error: smsError } = await supabaseAdmin
      .from("sms_messages")
      .select("sent_at")
      .gte("sent_at", thirtyDaysAgo.toISOString())
      .not("sent_at", "is", null);

    // Fetch Email messages for last 30 days
    const { data: emailMessages, error: emailError } = await supabaseAdmin
      .from("email_messages")
      .select("sent_at")
      .gte("sent_at", thirtyDaysAgo.toISOString())
      .not("sent_at", "is", null);

    if (smsError || emailError) {
      console.error(
        "Error fetching timeline messages:",
        smsError || emailError
      );
    }

    // Group by date
    const timelineMap = new Map<string, { sms: number; email: number }>();

    // Initialize all dates in the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toISOString().split("T")[0];
      timelineMap.set(dateKey, { sms: 0, email: 0 });
    }

    // Count SMS messages by date
    if (smsMessages) {
      smsMessages.forEach((msg: any) => {
        if (msg.sent_at) {
          const dateKey = new Date(msg.sent_at).toISOString().split("T")[0];
          const existing = timelineMap.get(dateKey);
          if (existing) {
            existing.sms++;
          }
        }
      });
    }

    // Count Email messages by date
    if (emailMessages) {
      emailMessages.forEach((msg: any) => {
        if (msg.sent_at) {
          const dateKey = new Date(msg.sent_at).toISOString().split("T")[0];
          const existing = timelineMap.get(dateKey);
          if (existing) {
            existing.email++;
          }
        }
      });
    }

    // Convert to array format
    const data = Array.from(timelineMap.entries())
      .map(([date, counts]) => ({
        date,
        sms: counts.sms,
        email: counts.email,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Messages timeline API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch messages timeline",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
