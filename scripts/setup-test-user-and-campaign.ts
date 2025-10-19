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

async function setupTestUserAndCampaign() {
  console.log("Checking for existing users...");

  // Check if there are any existing users
  const { data: existingUsers, error: usersError } = await supabase
    .from("users")
    .select("id")
    .limit(1);

  if (usersError) {
    console.error("Error checking users:", usersError);
    process.exit(1);
  }

  let userId: string;

  if (existingUsers && existingUsers.length > 0) {
    userId = existingUsers[0].id;
    console.log("✅ Using existing user:", userId);
  } else {
    // Create a test user
    console.log("Creating test user...");
    const { data: newUser, error: createUserError } = await supabase
      .from("users")
      .insert({
        email: "test@labstogo.com",
        password_hash: "placeholder",
        first_name: "Test",
        last_name: "User",
        role: "admin",
        is_active: true,
      })
      .select()
      .single();

    if (createUserError) {
      console.error("Error creating user:", createUserError);
      process.exit(1);
    }

    userId = newUser.id;
    console.log("✅ Test user created:", userId);
  }

  // Now create the campaign
  console.log("\nCreating test campaign...");

  const campaignData = {
    name: "Exam Renewal Notification",
    description: "Test campaign for DOT exam renewal reminders",
    message_template:
      "Hi {{first_name}}, your DOT exam expires soon. Please schedule your renewal appointment at LabsToGo. Reply STOP to opt out.",
    status: "draft",
    created_by: userId,
  };

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .insert(campaignData)
    .select()
    .single();

  if (campaignError) {
    console.error("Error creating campaign:", campaignError);
    process.exit(1);
  }

  console.log("\n✅ Campaign created successfully!");
  console.log("Campaign ID:", campaign.id);
  console.log("Campaign Name:", campaign.name);
  console.log("Campaign Status:", campaign.status);
  console.log("\nYou can now use this campaign ID to start the campaign.");

  return campaign;
}

setupTestUserAndCampaign()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
