import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTestCampaign() {
  console.log("Creating test campaign...");

  const campaignData = {
    name: "Exam Renewal Notification",
    description: "Test campaign for DOT exam renewal reminders",
    message_template:
      "Hi {{first_name}}, your DOT exam expires soon. Please schedule your renewal appointment at LabsToGo. Reply STOP to opt out.",
    status: "draft",
    created_by: "550e8400-e29b-41d4-a716-446655440000",
  };

  const { data, error } = await supabase
    .from("campaigns")
    .insert(campaignData)
    .select()
    .single();

  if (error) {
    console.error("Error creating campaign:", error);
    process.exit(1);
  }

  console.log("✅ Campaign created successfully!");
  console.log("Campaign ID:", data.id);
  console.log("Campaign Name:", data.name);
  console.log("\nYou can now use this campaign ID to start the campaign.");

  return data;
}

createTestCampaign()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
