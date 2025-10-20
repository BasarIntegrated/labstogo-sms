import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const { status, updated_at, completed_at } = await request.json();

    console.log("Updating campaign status:", { campaignId, status });

    // Validate status
    const validStatuses = [
      "draft",
      "active",
      "paused",
      "cancelled",
      "completed",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status. Must be one of: " + validStatuses.join(", "),
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status,
      updated_at: updated_at || new Date().toISOString(),
    };

    // Add completed_at if provided or if status is completed/cancelled
    if (completed_at) {
      updateData.completed_at = completed_at;
    } else if (status === "completed" || status === "cancelled") {
      updateData.completed_at = new Date().toISOString();
    }

    // Update campaign status
    const { data: campaign, error: updateError } = await supabaseAdmin
      .from("campaigns")
      .update(updateData)
      .eq("id", campaignId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating campaign:", updateError);
      return NextResponse.json(
        { error: "Failed to update campaign status" },
        { status: 500 }
      );
    }

    console.log("Campaign status updated successfully:", campaign);

    return NextResponse.json({
      success: true,
      message: `Campaign ${status} successfully`,
      campaign: campaign,
    });
  } catch (error) {
    console.error("Campaign status update error:", error);
    return NextResponse.json(
      { error: "Failed to update campaign status" },
      { status: 500 }
    );
  }
}
