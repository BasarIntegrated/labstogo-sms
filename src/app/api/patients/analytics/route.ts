import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get patient status counts
    const { data: statusCounts, error: statusError } = await supabase
      .from("patients")
      .select("status")
      .gte("created_at", startDate.toISOString());

    if (statusError) {
      console.error("Error fetching status counts:", statusError);
      return NextResponse.json(
        { error: "Failed to fetch status counts" },
        { status: 500 }
      );
    }

    // Count statuses
    const statusDistribution = statusCounts.reduce(
      (acc: Record<string, number>, patient) => {
        acc[patient.status] = (acc[patient.status] || 0) + 1;
        return acc;
      },
      {}
    );

    // Get daily patient creation counts
    const { data: dailyCounts, error: dailyError } = await supabase
      .from("patients")
      .select("created_at")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (dailyError) {
      console.error("Error fetching daily counts:", dailyError);
      return NextResponse.json(
        { error: "Failed to fetch daily counts" },
        { status: 500 }
      );
    }

    // Group by date
    const dailyPatientCreation = dailyCounts.reduce(
      (acc: Record<string, number>, patient) => {
        const date = patient.created_at.split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {}
    );

    // Get renewal status counts - DISABLED: Table does not exist
    // const { data: renewalCounts, error: renewalError } = await supabase
    //   .from("renewal_data")
    //   .select("status")
    //   .gte("created_at", startDate.toISOString());

    // if (renewalError) {
    //   console.error("Error fetching renewal counts:", renewalError);
    //   return NextResponse.json(
    //     { error: "Failed to fetch renewal counts" },
    //     { status: 500 }
    //   );
    // }

    // Mock renewal data since table doesn't exist
    const renewalCounts: { status: string }[] = [];

    const renewalStatusDistribution = renewalCounts.reduce(
      (acc: Record<string, number>, renewal) => {
        acc[renewal.status] = (acc[renewal.status] || 0) + 1;
        return acc;
      },
      {}
    );

    // Calculate growth rate
    const totalPatients = statusCounts.length;
    const previousPeriodStart = new Date(
      startDate.getTime() - (now.getTime() - startDate.getTime())
    );

    const { data: previousPeriodCounts, error: previousError } = await supabase
      .from("patients")
      .select("id")
      .gte("created_at", previousPeriodStart.toISOString())
      .lt("created_at", startDate.toISOString());

    if (previousError) {
      console.error("Error fetching previous period counts:", previousError);
      return NextResponse.json(
        { error: "Failed to fetch previous period counts" },
        { status: 500 }
      );
    }

    const previousPeriodTotal = previousPeriodCounts.length;
    const growthRate =
      previousPeriodTotal > 0
        ? ((totalPatients - previousPeriodTotal) / previousPeriodTotal) * 100
        : 0;

    // Get license type distribution
    const { data: licenseTypes, error: licenseError } = await supabase
      .from("patients")
      .select("license_type")
      .gte("created_at", startDate.toISOString())
      .not("license_type", "is", null);

    if (licenseError) {
      console.error("Error fetching license types:", licenseError);
      return NextResponse.json(
        { error: "Failed to fetch license types" },
        { status: 500 }
      );
    }

    const licenseTypeDistribution = licenseTypes.reduce(
      (acc: Record<string, number>, patient) => {
        const type = patient.license_type || "Unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {}
    );

    const analytics = {
      period,
      totalPatients,
      growthRate: Math.round(growthRate * 100) / 100,
      statusDistribution,
      renewalStatusDistribution,
      licenseTypeDistribution,
      dailyPatientCreation,
      summary: {
        activePatients: statusDistribution.active || 0,
        inactivePatients: statusDistribution.inactive || 0,
        renewalDue: statusDistribution.renewal_due || 0,
        examPending: statusDistribution.exam_pending || 0,
        unsubscribed: statusDistribution.unsubscribed || 0,
      },
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Error in analytics GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
