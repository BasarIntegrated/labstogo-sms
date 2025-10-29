import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    console.log("Fetching recipients for campaign:", campaignId);

    // First, get the campaign to check recipient_contacts and campaign_type
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from("campaigns")
      .select("recipient_contacts, campaign_type")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error("Campaign not found:", campaignError);
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    console.log("Campaign recipient_contacts:", campaign.recipient_contacts);

    // If no recipient_contacts, return empty array
    if (
      !campaign.recipient_contacts ||
      campaign.recipient_contacts.length === 0
    ) {
      console.log("No recipient_contacts found, returning empty array");
      return NextResponse.json([]);
    }

    // Fetch contacts based on recipient_contacts array
    const { data: contacts, error: contactsError } = await supabaseAdmin
      .from("contacts")
      .select(
        `
        id,
        first_name,
        last_name,
        phone_number,
        email,
        status,
        created_at,
        updated_at
      `
      )
      .in("id", campaign.recipient_contacts);

    if (contactsError) {
      console.error("Error fetching contacts:", contactsError);
      return NextResponse.json(
        { error: "Failed to fetch contacts" },
        { status: 500 }
      );
    }

    console.log("Found contacts:", contacts?.length || 0);

    // For email campaigns, filter out contacts without email addresses
    let filteredContacts = contacts || [];
    if (campaign.campaign_type === "email") {
      filteredContacts = (contacts || []).filter(
        (contact) => contact.email && contact.email.trim() !== ""
      );
      console.log(
        `Filtered to ${filteredContacts.length} contacts with emails (out of ${
          contacts?.length || 0
        } total)`
      );
    }

    // Transform contacts to match the expected format
    const recipients = filteredContacts.map((contact) => ({
      id: contact.id,
      campaign_id: campaignId,
      contact_id: contact.id,
      status: "pending", // Default status for monitoring
      sent_at: null,
      delivered_at: null,
      failed_at: null,
      error_message: null,
      provider_message_id: null,
      provider_response: {},
      created_at: contact.created_at,
      updated_at: contact.updated_at,
      contacts: contact, // Include contact details
    }));

    return NextResponse.json(recipients);
  } catch (error) {
    console.error("Error fetching campaign recipients:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipients" },
      { status: 500 }
    );
  }
}
