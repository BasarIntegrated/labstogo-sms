import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status") || undefined;
    const campaignId = searchParams.get("campaign_id") || undefined;
    const phoneNumber = searchParams.get("phone_number") || undefined;

    let query = supabaseAdmin
      .from("sms_messages")
      .select(
        `
        id,
        campaign_id,
        contact_id,
        phone_number,
        message,
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
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (campaignId) {
      query = query.eq("campaign_id", campaignId);
    }

    if (phoneNumber) {
      query = query.ilike("phone_number", `%${phoneNumber}%`);
    }

    // Apply pagination
    const from = page * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: smsMessages, error } = await query;

    if (error) {
      console.error("Error fetching SMS messages:", error);
      return NextResponse.json(
        { error: "Failed to fetch SMS messages" },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from("sms_messages")
      .select("*", { count: "exact", head: true });

    if (status) {
      countQuery = countQuery.eq("status", status);
    }
    if (campaignId) {
      countQuery = countQuery.eq("campaign_id", campaignId);
    }
    if (phoneNumber) {
      countQuery = countQuery.ilike("phone_number", `%${phoneNumber}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error("Count error:", countError);
      return NextResponse.json(
        { error: "Failed to get count" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages: smsMessages || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error in SMS messages GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
