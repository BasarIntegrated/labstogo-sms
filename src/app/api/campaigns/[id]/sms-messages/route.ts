import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    // Fetch campaign recipients
    const { data: recipients, error: recipientsError } = await supabaseAdmin
      .from("campaign_recipients")
      .select(`
        *,
        contacts (
          id,
          first_name,
          last_name,
          phone_number,
          email
        )
      `)
      .eq("campaign_id", campaignId);

    if (recipientsError) {
      console.error("Error fetching recipients:", recipientsError);
      return NextResponse.json(
        { error: "Failed to fetch recipients" },
        { status: 500 }
      );
    }

    return NextResponse.json(recipients || []);
  } catch (error) {
    console.error("Error fetching campaign recipients:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipients" },
      { status: 500 }
    );
  }
}
