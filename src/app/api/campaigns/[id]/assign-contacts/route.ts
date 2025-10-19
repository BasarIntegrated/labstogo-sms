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

    console.log(`Assigning ${contactIds.length} contacts to campaign ${campaignId}`);

    // Debug: Check what campaigns exist
    const { data: allCampaigns, error: debugError } = await supabaseAdmin
      .from("campaigns")
      .select("id, name")
      .limit(10);
    
    console.log("Available campaigns:", allCampaigns);
    console.log("Looking for campaign ID:", campaignId);

    // Get current campaign data
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from("campaigns")
      .select("recipient_contacts")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error("Campaign not found:", campaignError);
      console.error("Campaign ID provided:", campaignId);
      console.error("Available campaign IDs:", allCampaigns?.map(c => c.id));
      return NextResponse.json(
        { error: "Campaign not found", debug: { providedId: campaignId, availableIds: allCampaigns?.map(c => c.id) } },
        { status: 404 }
      );
    }

    // Merge or replace recipient contacts
    let newRecipientContacts: string[];
    if (replaceExisting) {
      newRecipientContacts = contactIds;
    } else {
      // Merge with existing recipients, avoiding duplicates
      const existingRecipients = campaign.recipient_contacts || [];
      const uniqueNewContacts = contactIds.filter(id => !existingRecipients.includes(id));
      newRecipientContacts = [...existingRecipients, ...uniqueNewContacts];
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

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${contactIds.length} contacts to campaign`,
      campaign: updatedCampaign,
      assignedContacts: contactIds.length,
      totalRecipients: newRecipientContacts.length,
      newRecipients: replaceExisting ? contactIds.length : contactIds.filter(id => !(campaign.recipient_contacts || []).includes(id)).length
    });

  } catch (error: any) {
    console.error("Campaign assignment error:", error);
    return NextResponse.json(
      { error: "Failed to assign contacts to campaign" },
      { status: 500 }
    );
  }
}
