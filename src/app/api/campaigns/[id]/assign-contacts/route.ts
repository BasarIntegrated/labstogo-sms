// API route to assign contacts to campaigns
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { contactIds, replaceExisting = false } = await request.json();
    const { id: campaignId } = await params;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: "Contact IDs are required" },
        { status: 400 }
      );
    }

    console.log(
      `Assigning ${contactIds.length} contacts to campaign ${campaignId}`
    );

    // Get current campaign data including status
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from("campaigns")
      .select("recipient_contacts, status, message_template, campaign_type")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error("Campaign not found:", campaignError);
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Merge or replace recipient contacts
    let newRecipientContacts: string[];
    let newlyAddedContacts: string[] = [];

    if (replaceExisting) {
      newRecipientContacts = contactIds;
      newlyAddedContacts = contactIds;
    } else {
      // Merge with existing recipients, avoiding duplicates
      const existingRecipients = campaign.recipient_contacts || [];
      const uniqueNewContacts = contactIds.filter(
        (id) => !existingRecipients.includes(id)
      );
      newRecipientContacts = [...existingRecipients, ...uniqueNewContacts];
      newlyAddedContacts = uniqueNewContacts;
    }

    // Update campaign with new recipient contacts
    const { data: updatedCampaign, error: updateError } = await supabaseAdmin
      .from("campaigns")
      .update({
        recipient_contacts: newRecipientContacts,
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaignId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating campaign:", updateError);
      return NextResponse.json(
        { error: "Failed to update campaign" },
        { status: 500 }
      );
    }

    console.log("Campaign updated successfully:", updatedCampaign);

    // If campaign is active, process contacts
    // For email campaigns, check all assigned contacts (in case email was updated)
    // For SMS campaigns, only process newly added contacts
    const contactsToProcess =
      campaign.campaign_type === "email" && campaign.status === "active"
        ? contactIds // For email campaigns, process all assigned contacts to check for email updates
        : newlyAddedContacts; // For SMS, only process newly added

    if (campaign.status === "active" && contactsToProcess.length > 0) {
      console.log(
        `Campaign is active, processing ${contactsToProcess.length} contacts`
      );

      try {
        // Get contact details
        const { data: newContacts, error: contactsError } = await supabaseAdmin
          .from("contacts")
          .select("*")
          .in("id", contactsToProcess);

        if (contactsError || !newContacts) {
          console.error("Failed to fetch new contacts:", contactsError);
          // Don't fail the assignment, just log the error
        } else {
          // Check if this is an email campaign or SMS campaign
          if (campaign.campaign_type === "email") {
            // Create email message records for new contacts
            const emailMessages = newContacts.map((contact) => ({
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
              console.error(
                "Failed to create email messages for new contacts:",
                emailError
              );
            } else {
              console.log(
                `Created ${emailMessages.length} email message records for new contacts`
              );
            }
          } else {
            // Create SMS message records for new contacts
            const smsMessages = newContacts.map((contact) => ({
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
              console.error(
                "Failed to create SMS messages for new contacts:",
                smsError
              );
            } else {
              console.log(
                `Created ${smsMessages.length} SMS message records for new contacts`
              );
            }
          }

          // Call backend to add jobs to queue for immediate processing
          try {
            const backendResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/campaigns/${campaignId}/process-new-contacts`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${
                    process.env.BACKEND_API_KEY || "dev-key"
                  }`,
                },
                body: JSON.stringify({ contactIds: newlyAddedContacts }),
              }
            );

            if (backendResponse.ok) {
              const backendResult = await backendResponse.json();
              console.log("Backend processed new contacts:", backendResult);
            } else {
              console.error(
                "Backend failed to process new contacts:",
                await backendResponse.text()
              );
            }
          } catch (backendError) {
            console.error(
              "Error calling backend for new contact processing:",
              backendError
            );
          }
        }
      } catch (error) {
        console.error(
          "Error processing new contacts for active campaign:",
          error
        );
        // Don't fail the assignment, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${contactIds.length} contacts to campaign`,
      campaign: updatedCampaign,
      assignedContacts: contactIds.length,
      totalRecipients: newRecipientContacts.length,
      newRecipients: newlyAddedContacts.length,
      campaignStatus: campaign.status,
      processedImmediately:
        campaign.status === "active" && newlyAddedContacts.length > 0,
    });
  } catch (error: any) {
    console.error("Campaign assignment error:", error);
    return NextResponse.json(
      { error: "Failed to assign contacts to campaign" },
      { status: 500 }
    );
  }
}
