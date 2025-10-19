import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function cleanupCampaigns() {
  console.log("🧹 Cleaning up duplicate campaigns...\n");
  
  // Get all campaigns
  const { data: campaigns, error } = await supabaseAdmin
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });
    
  if (error) {
    console.error("Error fetching campaigns:", error);
    return;
  }
  
  console.log("📊 Found", campaigns.length, "campaigns:");
  campaigns.forEach((campaign, index) => {
    console.log(`${index + 1}. ${campaign.name} (ID: ${campaign.id})`);
  });
  
  // Find duplicates by name
  const nameCounts: Record<string, number> = {};
  campaigns.forEach(campaign => {
    nameCounts[campaign.name] = (nameCounts[campaign.name] || 0) + 1;
  });
  
  const duplicates = Object.entries(nameCounts).filter(([name, count]) => count > 1);
  
  if (duplicates.length > 0) {
    console.log("\n🔄 Found duplicate campaigns:");
    duplicates.forEach(([name, count]) => {
      console.log(`- ${name}: ${count} copies`);
    });
    
    // Keep the first occurrence, delete the rest
    for (const [duplicateName, count] of duplicates) {
      const campaignsWithSameName = campaigns.filter(c => c.name === duplicateName);
      const toDelete = campaignsWithSameName.slice(1); // Keep first, delete rest
      
      console.log(`\n🗑️ Deleting ${toDelete.length} duplicate(s) of "${duplicateName}":`);
      for (const campaign of toDelete) {
        const { error: deleteError } = await supabaseAdmin
          .from("campaigns")
          .delete()
          .eq("id", campaign.id);
          
        if (deleteError) {
          console.error(`❌ Failed to delete ${campaign.name}:`, deleteError);
        } else {
          console.log(`✅ Deleted: ${campaign.name} (ID: ${campaign.id})`);
        }
      }
    }
  } else {
    console.log("\n✅ No duplicate campaigns found!");
  }
  
  // Also clean up the Exam Renewal Notification description
  const { data: examCampaign } = await supabaseAdmin
    .from("campaigns")
    .select("*")
    .eq("name", "Exam Renewal Notification")
    .single();
    
  if (examCampaign && examCampaign.description && examCampaign.description.length > 100) {
    console.log("\n📝 Shortening Exam Renewal Notification description...");
    const { error: updateError } = await supabaseAdmin
      .from("campaigns")
      .update({ description: "Test campaign for DOT exam renewal reminders" })
      .eq("id", examCampaign.id);
      
    if (updateError) {
      console.error("❌ Failed to update description:", updateError);
    } else {
      console.log("✅ Updated description successfully");
    }
  }
  
  console.log("\n🎯 Campaign cleanup completed!");
}

cleanupCampaigns();
