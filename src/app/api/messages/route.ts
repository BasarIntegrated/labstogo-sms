import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// Unified messages endpoint: returns both SMS and Email messages in a common shape
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status") || undefined;
    const campaignId = searchParams.get("campaign_id") || undefined;
    const search = searchParams.get("search") || undefined; // phone or email

    const from = page * limit;
    const to = from + limit - 1;

    // Fetch SMS
    let smsQuery = supabaseAdmin
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
        campaigns ( id, name ),
        contacts ( id, first_name, last_name )
      `
      )
      .order("updated_at", { ascending: false })
      .range(from, to);

    if (status) smsQuery = smsQuery.eq("status", status);
    if (campaignId) smsQuery = smsQuery.eq("campaign_id", campaignId);
    if (search) smsQuery = smsQuery.ilike("phone_number", `%${search}%`);

    const { data: smsMessages, error: smsError } = await smsQuery;
    if (smsError) {
      console.error("Error fetching SMS messages:", smsError);
      return NextResponse.json(
        { error: "Failed to fetch SMS messages" },
        { status: 500 }
      );
    }

    // Fetch Email
    let emailQuery = supabaseAdmin
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
        campaigns ( id, name ),
        contacts ( id, first_name, last_name )
      `
      )
      .order("updated_at", { ascending: false })
      .range(from, to);

    if (status) emailQuery = emailQuery.eq("status", status);
    if (campaignId) emailQuery = emailQuery.eq("campaign_id", campaignId);
    if (search) emailQuery = emailQuery.ilike("email", `%${search}%`);

    const { data: emailMessages, error: emailError } = await emailQuery;
    if (emailError) {
      console.error("Error fetching email messages:", emailError);
      return NextResponse.json(
        { error: "Failed to fetch email messages" },
        { status: 500 }
      );
    }

    // Normalize into a common shape the UI already understands
    const normalized = [
      ...(smsMessages || []).map((m: any) => ({
        id: m.id,
        campaign_id: m.campaign_id,
        contact_id: m.contact_id,
        phone_number: m.phone_number, // true phone
        email: null,
        message: m.message,
        html: null,
        status: m.status,
        provider_message_id: m.provider_message_id,
        provider_response: m.provider_response,
        sent_at: m.sent_at,
        delivered_at: m.delivered_at,
        failed_at: m.failed_at,
        retry_count: m.retry_count,
        last_retry_at: m.last_retry_at,
        created_at: m.created_at,
        updated_at: m.updated_at,
        campaigns: m.campaigns,
        contacts: m.contacts,
        kind: "sms" as const,
      })),
      ...(emailMessages || []).map((m: any) => ({
        id: m.id,
        campaign_id: m.campaign_id,
        contact_id: m.contact_id,
        phone_number: m.email, // reuse field for display
        email: m.email,
        message: m.subject || "Email campaign",
        html: m.html,
        status: m.status,
        provider_message_id: m.provider_message_id,
        provider_response: m.provider_response,
        sent_at: m.sent_at,
        delivered_at: m.delivered_at,
        failed_at: m.failed_at,
        retry_count: m.retry_count,
        last_retry_at: m.last_retry_at,
        created_at: m.created_at,
        updated_at: m.updated_at,
        campaigns: m.campaigns,
        contacts: m.contacts,
        kind: "email" as const,
      })),
    ];

    // Sort by updated_at desc
    normalized.sort((a, b) =>
      (b.updated_at ? new Date(b.updated_at).getTime() : 0) -
      (a.updated_at ? new Date(a.updated_at).getTime() : 0)
    );

    return NextResponse.json({
      messages: normalized,
      total: normalized.length, // simple combined count for now
      page,
      limit,
    });
  } catch (error) {
    console.error("Error in unified messages GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


