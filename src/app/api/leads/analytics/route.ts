import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    startDate.setDate(startDate.getDate() - days);

    // Get patient counts by status
    const { data: patientsData, error: patientsError } = await supabase
      .from("patients")
      .select("status, created_at");

    if (patientsError) throw patientsError;

    const statusCounts =
      patientsData?.reduce((acc, patient) => {
        acc[patient.status] = (acc[patient.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

    // Get patients created over time
    const timeSeriesData =
      patientsData?.filter((patient) => {
        const createdAt = new Date(patient.created_at);
        return createdAt >= startDate && createdAt <= endDate;
      }) || [];

    const dailyCounts = timeSeriesData.reduce((acc, patient) => {
      const date = patient.created_at.split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get renewal analytics
    const { data: renewalData, error: renewalError } = await supabase
      .from("renewal_data")
      .select("status, renewal_date");

    if (renewalError) throw renewalError;

    const renewalCounts =
      renewalData?.reduce((acc, renewal) => {
        acc[renewal.status] = (acc[renewal.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

    // Calculate growth rate
    const totalPatients = patientsData?.length || 0;
    const recentPatients = timeSeriesData.length;
    const growthRate =
      totalPatients > 0 ? (recentPatients / totalPatients) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        statusCounts,
        dailyCounts,
        renewalCounts,
        totalPatients,
        growthRate,
        period,
      },
    });
  } catch (error: unknown) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch analytics",
      },
      { status: 500 }
    );
  }
}
