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
        updated_at
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

    // Fetch related campaigns and contacts separately
    const campaignIds = [
      ...new Set((emailMessages || []).map((m: any) => m.campaign_id)),
    ];
    const contactIds = [
      ...new Set((emailMessages || []).map((m: any) => m.contact_id)),
    ];

    const campaignsMap = new Map();
    const contactsMap = new Map();

    if (campaignIds.length > 0) {
      const { data: campaigns } = await supabaseAdmin
        .from("campaigns")
        .select("id, name")
        .in("id", campaignIds);
      campaigns?.forEach((c: any) => campaignsMap.set(c.id, c));
    }

    if (contactIds.length > 0) {
      const { data: contacts } = await supabaseAdmin
        .from("contacts")
        .select("id, first_name, last_name")
        .in("id", contactIds);
      contacts?.forEach((c: any) => contactsMap.set(c.id, c));
    }

    // Attach related data to messages
    const messagesWithRelations = (emailMessages || []).map((m: any) => ({
      ...m,
      campaigns: campaignsMap.get(m.campaign_id) || null,
      contacts: contactsMap.get(m.contact_id) || null,
    }));

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
      messages: messagesWithRelations,
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
