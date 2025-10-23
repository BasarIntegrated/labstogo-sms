import { DashboardData, DashboardFilters } from "@/hooks/useDashboardData";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

/**
 * Dashboard API Endpoint
 *
 * Provides comprehensive dashboard data including metrics, charts,
 * and recent activity with caching and error handling.
 */
export async function GET() {
  try {
    // Get total contacts count
    const { count: totalContacts, error: contactsError } = await supabaseAdmin
      .from("contacts")
      .select("*", { count: "exact", head: true });

    if (contactsError) {
      console.error("Error fetching contacts count:", contactsError);
      return NextResponse.json(
        { error: "Failed to fetch contacts count" },
        { status: 500 }
      );
    }

    // Get active campaigns count
    const { count: activeCampaigns, error: campaignsError } =
      await supabaseAdmin
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .in("status", ["active", "scheduled"]);

    if (campaignsError) {
      console.error("Error fetching campaigns count:", campaignsError);
      return NextResponse.json(
        { error: "Failed to fetch campaigns count" },
        { status: 500 }
      );
    }

    // Get messages sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { count: messagesSentToday, error: messagesError } =
      await supabaseAdmin
        .from("sms_messages")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString())
        .lt("created_at", tomorrow.toISOString());

    if (messagesError) {
      console.error("Error fetching messages count:", messagesError);
      return NextResponse.json(
        { error: "Failed to fetch messages count" },
        { status: 500 }
      );
    }

    // Get delivery rate
    const { data: deliveryStats, error: deliveryError } = await supabaseAdmin
      .from("sms_messages")
      .select("status")
      .gte("created_at", today.toISOString())
      .lt("created_at", tomorrow.toISOString());

    if (deliveryError) {
      console.error("Error fetching delivery stats:", deliveryError);
      return NextResponse.json(
        { error: "Failed to fetch delivery stats" },
        { status: 500 }
      );
    }

    const totalSent = deliveryStats?.length || 0;
    const delivered =
      deliveryStats?.filter((msg: any) => msg.status === "delivered").length ||
      0;
    const deliveryRate =
      totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 0;

    // Get recent campaigns
    const { data: campaigns, error: campaignsDataError } = await supabaseAdmin
      .from("campaigns")
      .select(
        `
        id,
        name,
        description,
        status,
        total_patients,
        sent_count,
        delivered_count,
        failed_count,
        created_at,
        scheduled_at
      `
      )
      .order("created_at", { ascending: false })
      .limit(10);

    if (campaignsDataError) {
      console.error("Error fetching campaigns:", campaignsDataError);
      return NextResponse.json(
        { error: "Failed to fetch campaigns" },
        { status: 500 }
      );
    }

    // Get performance data for last 7 days
    const performanceData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: dayStats } = await supabaseAdmin
        .from("sms_messages")
        .select("status")
        .gte("created_at", startOfDay.toISOString())
        .lt("created_at", endOfDay.toISOString());

      const sent = dayStats?.length || 0;
      const delivered =
        dayStats?.filter((msg: any) => msg.status === "delivered").length || 0;
      const failed =
        dayStats?.filter((msg: any) => msg.status === "failed").length || 0;

      performanceData.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        sent,
        delivered,
        failed,
      });
    }

    return NextResponse.json({
      totalContacts: totalContacts || 0,
      activeCampaigns: activeCampaigns || 0,
      messagesSentToday: messagesSentToday || 0,
      deliveryRate,
      campaigns: campaigns || [],
      performanceData,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const filters: DashboardFilters = await request.json();

    // Use the exported supabase instance

    // Validate filters
    const validatedFilters = {
      timeRange: filters.timeRange || "30d",
      campaignType: filters.campaignType,
      licenseType: filters.licenseType,
      specialty: filters.specialty,
    };

    // Calculate date range
    const now = new Date();
    const startDate = new Date();

    switch (validatedFilters.timeRange) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Fetch dashboard data in parallel
    const [
      metricsResult,
      campaignPerformanceResult,
      patientEngagementResult,
      recentActivityResult,
    ] = await Promise.all([
      getDashboardMetrics(supabase, startDate, now),
      getCampaignPerformance(supabase, startDate, now),
      getPatientEngagement(supabase, startDate, now),
      getRecentActivity(supabase, 10),
    ]);

    const dashboardData: DashboardData = {
      metrics: metricsResult,
      campaignPerformance: campaignPerformanceResult,
      patientEngagement: patientEngagementResult,
      recentActivity: recentActivityResult,
      timeRange: {
        start: startDate.toISOString(),
        end: now.toISOString(),
        period: validatedFilters.timeRange,
      },
      totalContacts: metricsResult.totalPatients,
      activeCampaigns: metricsResult.activeCampaigns,
      messagesSentToday: metricsResult.messagesSentToday,
      deliveryRate: metricsResult.deliveryRate,
      performanceData: [],
      campaigns: [],
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Get dashboard metrics
 */
async function getDashboardMetrics(
  supabase: any,
  startDate: Date,
  endDate: Date
) {
  try {
    // Get total patients count
    const { count: totalPatients } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true });

    // Get active campaigns count
    const { count: activeCampaigns } = await supabase
      .from("campaigns")
      .select("*", { count: "exact", head: true })
      .in("status", ["running", "scheduled"]);

    // Get messages sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { count: messagesSentToday } = await supabase
      .from("sms_messages")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString())
      .lt("created_at", tomorrow.toISOString());

    // Get delivery rate
    const { data: deliveryStats } = await supabase
      .from("sms_messages")
      .select("status")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    const totalMessages = deliveryStats?.length || 0;
    const deliveredMessages =
      deliveryStats?.filter(
        (msg: { status: string }) => msg.status === "delivered"
      ).length || 0;
    const deliveryRate =
      totalMessages > 0 ? (deliveredMessages / totalMessages) * 100 : 0;

    // Get renewal due count (patients with expiring licenses)
    const { count: renewalDueCount } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .not("expires", "is", null)
      .lte(
        "expires",
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      ); // 30 days from now

    // Get exam pending count (patients with upcoming exams)
    const { count: examPendingCount } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .not("exam_date", "is", null)
      .gte("exam_date", new Date().toISOString())
      .lte(
        "exam_date",
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      ); // Next 90 days

    return {
      totalPatients: totalPatients || 0,
      activeCampaigns: activeCampaigns || 0,
      messagesSentToday: messagesSentToday || 0,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      renewalDueCount: renewalDueCount || 0,
      examPendingCount: examPendingCount || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return {
      totalPatients: 0,
      activeCampaigns: 0,
      messagesSentToday: 0,
      deliveryRate: 0,
      renewalDueCount: 0,
      examPendingCount: 0,
    };
  }
}

/**
 * Get campaign performance data
 */
async function getCampaignPerformance(
  supabase: any,
  startDate: Date,
  endDate: Date
) {
  try {
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select(
        `
        id,
        created_at,
        total_patients,
        sent_count,
        delivered_count,
        failed_count
      `
      )
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: true });

    // Group by date and calculate daily metrics
    const dailyData: { [key: string]: any } = {};

    campaigns?.forEach((campaign: any) => {
      const date = new Date(campaign.created_at).toISOString().split("T")[0];

      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          campaigns: 0,
          messagesSent: 0,
          deliveryRate: 0,
          engagementRate: 0,
        };
      }

      dailyData[date].campaigns += 1;
      dailyData[date].messagesSent += campaign.sent_count || 0;

      if (campaign.sent_count > 0) {
        dailyData[date].deliveryRate =
          ((campaign.delivered_count || 0) / campaign.sent_count) * 100;
      }
    });

    return Object.values(dailyData).sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  } catch (error) {
    console.error("Error fetching campaign performance:", error);
    return [];
  }
}

/**
 * Get patient engagement data
 */
async function getPatientEngagement(
  supabase: any,
  startDate: Date,
  endDate: Date
) {
  try {
    const { data: patients } = await supabase
      .from("patients")
      .select(
        `
        id,
        created_at,
        status,
        updated_at
      `
      )
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: true });

    // Group by date and calculate daily metrics
    const dailyData: { [key: string]: any } = {};

    patients?.forEach((patient: any) => {
      const date = new Date(patient.created_at).toISOString().split("T")[0];

      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          newPatients: 0,
          activePatients: 0,
          renewedPatients: 0,
          expiredPatients: 0,
        };
      }

      dailyData[date].newPatients += 1;

      if (patient.status === "Active") {
        dailyData[date].activePatients += 1;
      } else if (patient.status === "Inactive") {
        dailyData[date].renewedPatients += 1;
      } else if (patient.status === "Unsubscribed") {
        dailyData[date].expiredPatients += 1;
      }
    });

    return Object.values(dailyData).sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  } catch (error) {
    console.error("Error fetching patient engagement:", error);
    return [];
  }
}

/**
 * Get recent activity
 */
async function getRecentActivity(supabase: any, limit: number = 10) {
  try {
    // Get recent campaigns
    const { data: recentCampaigns } = await supabase
      .from("campaigns")
      .select(
        `
        id,
        name,
        status,
        created_at,
        total_patients
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    // Get recent patient registrations
    const { data: recentPatients } = await supabase
      .from("patients")
      .select(
        `
        id,
        first_name,
        last_name,
        status,
        created_at
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    // Combine and format activities
    const activities = [
      ...(recentCampaigns || []).map((campaign: any) => ({
        id: `campaign-${campaign.id}`,
        type: "campaign" as const,
        title: `Campaign "${campaign.name}" ${campaign.status}`,
        description: `Campaign ${campaign.status} with ${
          campaign.total_patients || 0
        } patients`,
        timestamp: campaign.created_at,
        status:
          campaign.status === "running"
            ? ("success" as const)
            : ("info" as const),
        metadata: {
          campaignId: campaign.id,
          patientCount: campaign.total_patients,
        },
      })),
      ...(recentPatients || []).map((patient: any) => ({
        id: `patient-${patient.id}`,
        type: "patient" as const,
        title: `New Patient: ${patient.first_name} ${patient.last_name}`,
        description: `Patient registered with status: ${patient.status}`,
        timestamp: patient.created_at,
        status: "info" as const,
        metadata: { patientId: patient.id, status: patient.status },
      })),
    ];

    // Sort by timestamp and limit
    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
}
