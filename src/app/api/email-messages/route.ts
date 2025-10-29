import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status") || undefined;
    const campaignId = searchParams.get("campaign_id") || undefined;
    const email = searchParams.get("email") || undefined;

    let query = supabaseAdmin
      .from("email_messages")
      .select(
        `
        id,
        campaign_id,
        contact_id,
        email,
        subject,
        html,
        status,
        provider_message_id,
        provider_response,
        sent_at,
        delivered_at,
        failed_at,
        retry_count,
        last_retry_at,
        created_at,
        updated_at,
        campaigns (
          id,
          name
        ),
        contacts (
          id,
          first_name,
          last_name
        )
      `
      )
      .order("updated_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (campaignId) query = query.eq("campaign_id", campaignId);
    if (email) query = query.ilike("email", `%${email}%`);

    const from = page * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: emailMessages, error } = await query;
    if (error) {
      console.error("Error fetching email messages:", error);
      return NextResponse.json(
        { error: "Failed to fetch email messages" },
        { status: 500 }
      );
    }

    // Count
    let countQuery = supabaseAdmin
      .from("email_messages")
      .select("*", { count: "exact", head: true });
    if (status) countQuery = countQuery.eq("status", status);
    if (campaignId) countQuery = countQuery.eq("campaign_id", campaignId);
    if (email) countQuery = countQuery.ilike("email", `%${email}%`);

    const { count, error: countError } = await countQuery;
    if (countError) {
      console.error("Count error:", countError);
      return NextResponse.json(
        { error: "Failed to get count" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages: emailMessages || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error in email messages GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


