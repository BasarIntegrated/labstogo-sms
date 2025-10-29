import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    // Fetch email messages for this campaign
    const { data: emailMessages, error: emailError } = await supabaseAdmin
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
      .eq("campaign_id", campaignId)
      .order("updated_at", { ascending: false });

    if (emailError) {
      console.error("Error fetching email messages:", emailError);
      return NextResponse.json(
        { error: "Failed to fetch email messages" },
        { status: 500 }
      );
    }

    // Fetch contact details separately if we have email messages
    let contactsMap: Record<string, any> = {};
    if (emailMessages && emailMessages.length > 0) {
      const contactIds = emailMessages
        .map((msg) => msg.contact_id)
        .filter(Boolean);
      if (contactIds.length > 0) {
        const { data: contacts } = await supabaseAdmin
          .from("contacts")
          .select("id, first_name, last_name, email")
          .in("id", contactIds);

        contacts?.forEach((contact) => {
          contactsMap[contact.id] = contact;
        });
      }
    }

    // Transform to match SMS message format for compatibility
    const transformedMessages = (emailMessages || []).map((msg: any) => ({
      id: msg.id,
      campaign_id: msg.campaign_id,
      contact_id: msg.contact_id,
      phone_number: msg.email, // Use email as phone_number for display
      email: msg.email,
      message: msg.subject || "Email campaign",
      html: msg.html,
      status: msg.status,
      provider_message_id: msg.provider_message_id,
      provider_response: msg.provider_response,
      sent_at: msg.sent_at,
      delivered_at: msg.delivered_at,
      failed_at: msg.failed_at,
      retry_count: msg.retry_count,
      last_retry_at: msg.last_retry_at,
      created_at: msg.created_at,
      updated_at: msg.updated_at,
      contacts: contactsMap[msg.contact_id] || null,
    }));

    return NextResponse.json(transformedMessages);
  } catch (error) {
    console.error("Error fetching email messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch email messages" },
      { status: 500 }
    );
  }
}
