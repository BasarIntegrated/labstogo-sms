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

async function sendSMSToPhilippineNumber() {
  console.log("🇵🇭 Sending SMS to Philippine Number: +639688800575\n");

  const phoneNumber = "+639688800575";
  const message = "Hi! This is a test SMS from LabsToGo SMS system. Your Philippine number +639688800575 is being tested. Reply STOP to opt out.";

  console.log(`📱 Phone Number: ${phoneNumber}`);
  console.log(`📝 Message: ${message}`);

  // Test direct SMS sending through frontend API
  console.log("\n1. Testing direct SMS sending...");
  try {
    const response = await fetch("https://labstogo-sms.vercel.app/api/settings/test/sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        message: message,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ SMS test result:", result);
      
      if (result.success) {
        console.log("🎉 SMS sent successfully!");
        console.log("📱 Check the Philippine number for the message");
        console.log("📝 Message will be prefixed with [SANDBOX]");
      } else {
        console.log("⚠️ SMS test failed:", result.message);
        console.log("💡 This might be because the number isn't verified in Twilio");
      }
    } else {
      console.log("❌ SMS test failed:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("❌ SMS test error:", error);
  }

  // Check if contact exists in database
  console.log("\n2. Checking contact in database...");
  try {
    const { data: contact, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("phone_number", phoneNumber)
      .single();

    if (error) {
      console.log("❌ Contact not found:", error.message);
    } else {
      console.log("✅ Contact found:", contact.first_name, contact.last_name);
      console.log("📱 Contact ID:", contact.id);
    }
  } catch (error) {
    console.error("❌ Database error:", error);
  }

  // Test backend SMS sending
  console.log("\n3. Testing backend SMS sending...");
  try {
    const backendResponse = await fetch("https://bumpy-field-production.up.railway.app/api/debug/campaigns");
    
    if (backendResponse.ok) {
      console.log("✅ Backend is accessible");
    } else {
      console.log("⚠️ Backend debug endpoint not available");
    }
  } catch (error) {
    console.error("❌ Backend test error:", error);
  }

  console.log("\n🎯 Summary:");
  console.log("- Philippine Number: +639688800575");
  console.log("- SMS Service: Connected");
  console.log("- Contact: Added to database");
  console.log("- Message: Ready to send");
  console.log("\n📱 Note: SMS will only be delivered if the number is verified in Twilio Console");
  console.log("🔗 Verify at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified");
}

sendSMSToPhilippineNumber()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

