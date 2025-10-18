import { campaignQueue } from "@/lib/queue";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (campaign.status !== "draft") {
      return NextResponse.json(
        { error: "Campaign is not in draft status" },
        { status: 400 }
      );
    }

    // Get patients based on campaign filters
    let patientsQuery = supabaseAdmin
      .from("patients")
      .select("*")
      .eq("status", "Active");

    // Apply filters if they exist
    if (campaign.filters) {
      const filters = campaign.filters as Record<string, unknown>;

      if (
        filters.tags &&
        Array.isArray(filters.tags) &&
        filters.tags.length > 0
      ) {
        patientsQuery = patientsQuery.overlaps("tags", filters.tags);
      }

      if (filters.created_after) {
        patientsQuery = patientsQuery.gte("created_at", filters.created_after);
      }

      if (filters.created_before) {
        patientsQuery = patientsQuery.lte("created_at", filters.created_before);
      }
    }

    const { data: patients, error: patientsError } = await patientsQuery;

    if (patientsError) {
      return NextResponse.json(
        { error: "Failed to fetch patients" },
        { status: 500 }
      );
    }

    if (!patients || patients.length === 0) {
      return NextResponse.json(
        { error: "No patients found for this campaign" },
        { status: 400 }
      );
    }

    // Update campaign status and total patients
    const { error: updateError } = await supabaseAdmin
      .from("campaigns")
      .update({
        status: "running",
        total_patients: patients.length,
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaignId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update campaign" },
        { status: 500 }
      );
    }

    // Add campaign start job to BullMQ
    const job = await campaignQueue.add(
      "start-campaign",
      {
        campaignId,
        patientIds: patients.map((patient) => patient.id),
      },
      {
        jobId: `campaign-${campaignId}`,
        removeOnComplete: 10,
        removeOnFail: 5,
      }
    );

    return NextResponse.json({
      success: true,
      message: `Campaign queued for processing with ${patients.length} patients`,
      totalPatients: patients.length,
      jobId: job.id,
    });
  } catch (error) {
    console.error("Error starting campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
