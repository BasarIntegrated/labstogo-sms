// API route to process newly assigned contacts for active campaigns
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { contactIds } = await request.json();
    const { id: campaignId } = await params;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: "Contact IDs are required" },
        { status: 400 }
      );
    }

    console.log(
      `Processing ${contactIds.length} newly assigned contacts for active campaign ${campaignId}`
    );

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

    // Verify campaign is active
    if (campaign.status !== "active") {
      return NextResponse.json(
        { error: "Campaign is not active" },
        { status: 400 }
      );
    }

    // Get contact details
    const { data: contacts, error: contactsError } = await supabaseAdmin
      .from("contacts")
      .select("*")
      .in("id", contactIds);

    if (contactsError || !contacts) {
      return NextResponse.json(
        { error: "Failed to get contacts" },
        { status: 500 }
      );
    }

    let messagesCreated = 0;

    // Check if this is an email campaign or SMS campaign
    if (campaign.campaign_type === "email") {
      // Create email message records
      const emailMessages = contacts.map((contact) => ({
        campaign_id: campaignId,
        contact_id: contact.id,
        email: contact.email,
        subject: campaign.message_template, // Use message_template as subject for now
        html: campaign.message_template, // For now, using template as HTML
        status: "pending",
      }));

      const { error: emailError } = await supabaseAdmin
        .from("email_messages")
        .insert(emailMessages);

      if (emailError) {
        console.error("Failed to create email messages:", emailError);
        return NextResponse.json(
          { error: "Failed to create email messages" },
          { status: 500 }
        );
      }

      messagesCreated = emailMessages.length;
      console.log(`Created ${messagesCreated} email message records`);
    } else {
      // Create SMS message records
      const smsMessages = contacts.map((contact) => ({
        campaign_id: campaignId,
        contact_id: contact.id,
        phone_number: contact.phone_number,
        message: campaign.message_template,
        status: "pending",
      }));

      const { error: smsError } = await supabaseAdmin
        .from("sms_messages")
        .insert(smsMessages);

      if (smsError) {
        console.error("Failed to create SMS messages:", smsError);
        return NextResponse.json(
          { error: "Failed to create SMS messages" },
          { status: 500 }
        );
      }

      messagesCreated = smsMessages.length;
      console.log(`Created ${messagesCreated} SMS message records`);
    }

    // TODO: Add jobs to queue for immediate processing
    // This would require backend integration
    console.log(
      "Message jobs should be added to queue for immediate processing"
    );

    return NextResponse.json({
      success: true,
      message: `Processed ${contacts.length} newly assigned contacts`,
      campaignId,
      processedContacts: contacts.length,
      messagesCreated: messagesCreated,
      campaignType: campaign.campaign_type,
    });
  } catch (error: any) {
    console.error("Error processing new contacts:", error);
    return NextResponse.json(
      { error: "Failed to process new contacts" },
      { status: 500 }
    );
  }
}
