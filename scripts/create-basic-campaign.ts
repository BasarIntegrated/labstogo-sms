import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config(); // Load environment variables from .env.local

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createBasicCampaign() {
  console.log("Creating basic campaign...\n");

  try {
    // First, check if we have any users
    const { data: users, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .limit(1);

    let userId: string;
    if (userError || !users || users.length === 0) {
      console.log("No users found, creating a test user...");
      const { data: newUser, error: createUserError } = await supabaseAdmin
        .from("users")
        .insert([
          {
            email: "admin@messageblasting.com",
            password_hash:
              "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
            first_name: "Admin",
            last_name: "User",
            role: "admin",
            is_active: true,
          },
        ])
        .select("id")
        .single();

      if (createUserError || !newUser) {
        console.error("❌ Failed to create test user:", createUserError);
        return;
      }
      userId = newUser.id;
      console.log("✅ Created test user:", userId);
    } else {
      userId = users[0].id;
      console.log("✅ Using existing user:", userId);
    }

    // Create multiple campaigns
    const campaignsData = [
      {
        name: "General Message Campaign",
        description: "A basic campaign for general messaging to contacts",
        message_template:
          "Hi {first_name}, this is a general message from LabsToGo. Thank you for being a valued contact!",
        status: "draft",
        recipient_type: "all",
        sent_count: 0,
        failed_count: 0,
        created_by: userId,
      },
      {
        name: "Appointment Reminder",
        description: "Reminder campaign for upcoming appointments",
        message_template:
          "Hi {first_name}, this is a reminder about your upcoming appointment. Please confirm your attendance.",
        status: "draft",
        recipient_type: "all",
        sent_count: 0,
        failed_count: 0,
        created_by: userId,
      },
      {
        name: "Welcome Message",
        description: "Welcome new contacts to the system",
        message_template:
          "Welcome {first_name}! Thank you for joining LabsToGo. We're excited to have you on board.",
        status: "draft",
        recipient_type: "all",
        sent_count: 0,
        failed_count: 0,
        created_by: userId,
      },
    ];

    console.log("Creating multiple campaigns...\n");

    for (const campaignData of campaignsData) {
      const { data: campaign, error: campaignError } = await supabaseAdmin
        .from("campaigns")
        .insert([campaignData])
        .select()
        .single();

      if (campaignError) {
        console.error(
          "❌ Error creating campaign:",
          campaignData.name,
          campaignError
        );
        continue;
      }

      console.log("✅ Campaign created:", campaign.name);
      console.log("   ID:", campaign.id);
      console.log("   Template:", campaign.message_template);
      console.log("");
    }

    console.log(
      "🎯 All campaigns created! You can now use them to assign contacts!"
    );
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

createBasicCampaign();
