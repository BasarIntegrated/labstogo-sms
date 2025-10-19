import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config(); // Load environment variables from .env.local

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkCampaigns() {
  console.log("🔍 Checking campaigns in database...\n");

  try {
    // Fetch all campaigns
    const { data: campaigns, error } = await supabaseAdmin
      .from("campaigns")
      .select("id, name, description, status, recipient_contacts")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching campaigns:", error);
      return;
    }

    if (!campaigns || campaigns.length === 0) {
      console.log("⚠️ No campaigns found in database");
      return;
    }

    console.log(`✅ Found ${campaigns.length} campaigns:`);
    console.log("=====================================");
    
    campaigns.forEach((campaign, index) => {
      console.log(`${index + 1}. ID: ${campaign.id}`);
      console.log(`   Name: ${campaign.name}`);
      console.log(`   Description: ${campaign.description || "No description"}`);
      console.log(`   Status: ${campaign.status}`);
      console.log(`   Recipients: ${campaign.recipient_contacts?.length || 0} contacts`);
      console.log(`   Total Recipients: ${campaign.recipient_contacts?.length || 0}`);
      console.log("   ---");
    });

    console.log("\n🎯 Campaign IDs available for assignment:");
    campaigns.forEach(campaign => {
      console.log(`- ${campaign.id} (${campaign.name})`);
    });

  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

checkCampaigns();
