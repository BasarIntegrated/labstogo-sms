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
      .select("recipient_contacts, status, message_template")
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

    // If campaign is active and we have newly added contacts, process them immediately
    if (campaign.status === "active" && newlyAddedContacts.length > 0) {
      console.log(
        `Campaign is active, processing ${newlyAddedContacts.length} newly added contacts`
      );

      try {
        // Get contact details for newly added contacts
        const { data: newContacts, error: contactsError } = await supabaseAdmin
          .from("contacts")
          .select("*")
          .in("id", newlyAddedContacts);

        if (contactsError || !newContacts) {
          console.error("Failed to fetch new contacts:", contactsError);
          // Don't fail the assignment, just log the error
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

            // Call backend to add SMS jobs to queue for immediate processing
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
