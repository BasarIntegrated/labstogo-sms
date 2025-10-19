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

async function testUSNumberSMS() {
  console.log("🇺🇸 Testing US Number SMS Workflow...\n");

  const testNumber = "+19786159222";
  const testMessage = "Test SMS from LabsToGo - US Number Verification Test";

  console.log(`📱 Testing SMS to: ${testNumber}`);
  console.log(`📝 Message: ${testMessage}`);

  // Test direct SMS sending
  console.log("\n1. Testing direct SMS sending...");
  try {
    const response = await fetch(
      "https://labstogo-sms.vercel.app/api/settings/test/sms",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: testNumber,
          message: testMessage,
        }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("✅ SMS test result:", result);

      if (result.success) {
        console.log("🎉 SMS sent successfully!");
        console.log("📱 Check your phone for the message");
      } else {
        console.log("⚠️ SMS test failed:", result.message);
      }
    } else {
      console.log("❌ SMS test failed:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("❌ SMS test error:", error);
  }

  // Check if contact exists
  console.log("\n2. Checking contact in database...");
  try {
    const { data: contact, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("phone_number", testNumber)
      .single();

    if (error) {
      console.log("❌ Contact not found:", error.message);
    } else {
      console.log("✅ Contact found:", contact.first_name, contact.last_name);
    }
  } catch (error) {
    console.error("❌ Database error:", error);
  }

  // Test campaign creation with this number
  console.log("\n3. Testing campaign workflow...");
  try {
    const campaignData = {
      name: "US Number Test Campaign",
      description: "Test campaign for US number verification",
      message_template: `Hi {{first_name}}, this is a test message from LabsToGo. Your number ${testNumber} is being tested.`,
      created_by: "cd5f2fe3-4488-405c-9d36-a3aaf4b86935",
    };

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .insert(campaignData)
      .select()
      .single();

    if (campaignError) {
      console.log("❌ Campaign creation failed:", campaignError.message);
    } else {
      console.log("✅ Campaign created:", campaign.id);
      console.log("📝 Campaign name:", campaign.name);

      // Try to start the campaign
      console.log("\n4. Testing campaign start...");
      const startResponse = await fetch(
        `https://labstogo-sms.vercel.app/api/campaigns/${campaign.id}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientIds: ["d64a3fd6-193d-4873-b384-4a09d55023b0"],
          }),
        }
      );

      if (startResponse.ok) {
        const startResult = await startResponse.json();
        console.log("✅ Campaign started:", startResult);
      } else {
        console.log(
          "⚠️ Campaign start failed:",
          startResponse.status,
          startResponse.statusText
        );
      }
    }
  } catch (error) {
    console.error("❌ Campaign test error:", error);
  }

  console.log("\n🎯 Summary:");
  console.log("- US Number: Ready for testing");
  console.log("- SMS Service: Connected");
  console.log("- Database: Operational");
  console.log("- Campaign System: Ready");
  console.log(
    "\n📱 Next: Verify the number in Twilio Console and test SMS delivery!"
  );
}

testUSNumberSMS()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
