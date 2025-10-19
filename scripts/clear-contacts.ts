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

async function clearAllContacts() {
  console.log("🧹 Clearing all contacts from database...\n");

  try {
    // First, let's see how many contacts we have
    const { data: contacts, error: countError } = await supabase
      .from("contacts")
      .select("id, first_name, last_name, phone_number")
      .limit(10);

    if (countError) {
      console.error("❌ Error fetching contacts:", countError);
      return;
    }

    console.log(
      `📊 Found ${contacts?.length || 0} contacts (showing first 10):`
    );
    if (contacts && contacts.length > 0) {
      contacts.forEach((contact, index) => {
        console.log(
          `  ${index + 1}. ${contact.first_name} ${contact.last_name} - ${
            contact.phone_number
          }`
        );
      });
    }

    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from("contacts")
      .select("*", { count: "exact", head: true });

    if (totalError) {
      console.error("❌ Error getting total count:", totalError);
      return;
    }

    console.log(`\n📈 Total contacts in database: ${totalCount || 0}`);

    if (totalCount === 0) {
      console.log("✅ No contacts to clear. Database is already empty.");
      return;
    }

    // Clear all contacts
    console.log("\n🗑️ Deleting all contacts...");
    const { error: deleteError } = await supabase
      .from("contacts")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all records

    if (deleteError) {
      console.error("❌ Error deleting contacts:", deleteError);
      return;
    }

    console.log("✅ All contacts have been cleared successfully!");
    console.log(`🗑️ Deleted ${totalCount} contacts from the database.`);

    // Verify the deletion
    const { count: remainingCount, error: verifyError } = await supabase
      .from("contacts")
      .select("*", { count: "exact", head: true });

    if (verifyError) {
      console.error("❌ Error verifying deletion:", verifyError);
      return;
    }

    console.log(
      `\n✅ Verification: ${
        remainingCount || 0
      } contacts remaining in database.`
    );
  } catch (error) {
    console.error("❌ Fatal error:", error);
  }
}

clearAllContacts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
