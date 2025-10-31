import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

/**
 * Dashboard Stats API Endpoint
 *
 * Returns aggregated dashboard metrics including messages sent today,
 * delivery rates, active campaigns, and contact statistics.
 */
export async function GET() {
  try {
    // Calculate date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get messages sent today (SMS + Email)
    const { count: smsToday, error: smsTodayError } = await supabaseAdmin
      .from("sms_messages")
      .select("*", { count: "exact", head: true })
      .gte("sent_at", today.toISOString())
      .lt("sent_at", tomorrow.toISOString());

    const { count: emailToday, error: emailTodayError } = await supabaseAdmin
      .from("email_messages")
      .select("*", { count: "exact", head: true })
      .gte("sent_at", today.toISOString())
      .lt("sent_at", tomorrow.toISOString());

    if (smsTodayError || emailTodayError) {
      console.error(
        "Error fetching messages today:",
        smsTodayError || emailTodayError
      );
    }

    // Get messages sent yesterday (for % change)
    const { count: smsYesterday, error: smsYesterdayError } =
      await supabaseAdmin
        .from("sms_messages")
        .select("*", { count: "exact", head: true })
        .gte("sent_at", yesterday.toISOString())
        .lt("sent_at", today.toISOString());

    const { count: emailYesterday, error: emailYesterdayError } =
      await supabaseAdmin
        .from("email_messages")
        .select("*", { count: "exact", head: true })
        .gte("sent_at", yesterday.toISOString())
        .lt("sent_at", today.toISOString());

    const messagesToday = (smsToday || 0) + (emailToday || 0);
    const messagesYesterday = (smsYesterday || 0) + (emailYesterday || 0);
    const messagesChange =
      messagesYesterday > 0
        ? ((messagesToday - messagesYesterday) / messagesYesterday) * 100
        : messagesToday > 0
        ? 100
        : 0;

    // Get delivery rate (last 7 days)
    const { data: smsMessages7d, error: sms7dError } = await supabaseAdmin
      .from("sms_messages")
      .select("status")
      .gte("sent_at", sevenDaysAgo.toISOString());

    const { data: emailMessages7d, error: email7dError } = await supabaseAdmin
      .from("email_messages")
      .select("status")
      .gte("sent_at", sevenDaysAgo.toISOString());

    const allMessages7d = [
      ...(smsMessages7d || []),
      ...(emailMessages7d || []),
    ];

    const totalMessages7d = allMessages7d.length;
    const deliveredMessages7d = allMessages7d.filter(
      (msg: any) => msg.status === "delivered" || msg.status === "sent"
    ).length;

    // Get delivery rate from last 7 days for comparison
    const last14DaysAgo = new Date(today);
    last14DaysAgo.setDate(last14DaysAgo.getDate() - 14);

    const { data: smsMessages14d, error: sms14dError } = await supabaseAdmin
      .from("sms_messages")
      .select("status")
      .gte("sent_at", last14DaysAgo.toISOString())
      .lt("sent_at", sevenDaysAgo.toISOString());

    const { data: emailMessages14d, error: email14dError } = await supabaseAdmin
      .from("email_messages")
      .select("status")
      .gte("sent_at", last14DaysAgo.toISOString())
      .lt("sent_at", sevenDaysAgo.toISOString());

    const allMessagesPrev7d = [
      ...(smsMessages14d || []),
      ...(emailMessages14d || []),
    ];

    const totalMessagesPrev7d = allMessagesPrev7d.length;
    const deliveredMessagesPrev7d = allMessagesPrev7d.filter(
      (msg: any) => msg.status === "delivered" || msg.status === "sent"
    ).length;

    const deliveryRate7d =
      totalMessages7d > 0 ? (deliveredMessages7d / totalMessages7d) * 100 : 0;

    const deliveryRatePrev7d =
      totalMessagesPrev7d > 0
        ? (deliveredMessagesPrev7d / totalMessagesPrev7d) * 100
        : 0;

    const deliveryRateChange =
      deliveryRatePrev7d > 0 ? deliveryRate7d - deliveryRatePrev7d : 0;

    // Get active campaigns
    const { count: activeCampaigns, error: campaignsError } =
      await supabaseAdmin
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

    const { count: scheduledCampaigns, error: scheduledError } =
      await supabaseAdmin
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .eq("status", "scheduled");

    // Get campaigns completed today
    const { count: completedToday, error: completedError } = await supabaseAdmin
      .from("campaigns")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("completed_at", today.toISOString())
      .lt("completed_at", tomorrow.toISOString());

    // Get total contacts with breakdown
    const { count: totalContacts, error: contactsError } = await supabaseAdmin
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    const { count: contactsWithEmail, error: emailContactsError } =
      await supabaseAdmin
        .from("contacts")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .not("email", "is", null)
        .neq("email", "");

    const { count: contactsWithPhone, error: phoneContactsError } =
      await supabaseAdmin
        .from("contacts")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .not("phone_number", "is", null)
        .neq("phone_number", "");

    return NextResponse.json({
      success: true,
      data: {
        messagesToday: {
          sms: smsToday || 0,
          email: emailToday || 0,
          total: messagesToday,
          change: Math.round(messagesChange * 100) / 100,
        },
        deliveryRate: {
          overall: Math.round(deliveryRate7d * 100) / 100,
          sms: 0, // Will calculate if needed
          email: 0, // Will calculate if needed
          change: Math.round(deliveryRateChange * 100) / 100,
        },
        activeCampaigns: {
          active: activeCampaigns || 0,
          scheduled: scheduledCampaigns || 0,
          completedToday: completedToday || 0,
        },
        contacts: {
          total: totalContacts || 0,
          withEmail: contactsWithEmail || 0,
          withPhone: contactsWithPhone || 0,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard stats API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
