import { NextRequest, NextResponse } from "next/server";

// Fallback campaigns data when database is not available
const FALLBACK_CAMPAIGNS = [
  {
    id: "fallback-1",
    name: "Medical License Renewal",
    description: "Standard reminder for medical license renewals",
    message_template: "Hi {{first_name}}, your medical license ({{license_number}}) expires on {{renewal_deadline}}. Please renew to avoid any interruption in practice. Reply STOP to opt out.",
    campaign_type: "renewal_reminder",
    status: "draft",
    total_patients: 0,
    sent_count: 0,
    delivered_count: 0,
    failed_count: 0,
    created_at: new Date().toISOString(),
    created_by: "system",
  },
  {
    id: "fallback-2", 
    name: "Urgent License Renewal",
    description: "Urgent reminder for licenses expiring soon",
    message_template: "URGENT: {{first_name}}, your {{license_type}} license ({{license_number}}) expires in {{days_until_renewal}} days on {{renewal_deadline}}. Renew immediately! Reply STOP to opt out.",
    campaign_type: "renewal_reminder",
    status: "draft",
    total_patients: 0,
    sent_count: 0,
    delivered_count: 0,
    failed_count: 0,
    created_at: new Date().toISOString(),
    created_by: "system",
  }
];

// GET /api/campaigns/fallback - Get fallback campaigns
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    campaigns: FALLBACK_CAMPAIGNS,
    fallback: true,
    message: "Using fallback data - database connection unavailable"
  });
}

// POST /api/campaigns/fallback - Create fallback campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, message_template, campaign_type = "renewal_reminder" } = body;

    if (!name || !message_template) {
      return NextResponse.json(
        { error: "Name and message template are required" },
        { status: 400 }
      );
    }

    const newCampaign = {
      id: `fallback-${Date.now()}`,
      name,
      description,
      message_template,
      campaign_type,
      status: "draft",
      total_patients: 0,
      sent_count: 0,
      delivered_count: 0,
      failed_count: 0,
      created_at: new Date().toISOString(),
      created_by: "system",
    };

    FALLBACK_CAMPAIGNS.push(newCampaign);

    return NextResponse.json({ 
      campaign: newCampaign,
      fallback: true,
      message: "Campaign created in fallback mode"
    }, { status: 201 });
  } catch (error) {
    console.error("Error in fallback campaign creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
