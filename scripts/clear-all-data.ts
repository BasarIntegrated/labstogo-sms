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

// Tables to clear in order (respecting foreign key constraints)
const TABLES_TO_CLEAR = [
  "upload_errors",
  "uploads",
  "campaign_recipients",
  "sms_messages",
  "job_queue",
  "campaigns",
  "message_templates",
  "contact_groups",
  "contacts",
  "sessions",
  "users",
];

async function getTableCount(tableName: string): Promise<number> {
  const { count, error } = await supabase
    .from(tableName)
    .select("*", { count: "exact", head: true });

  if (error) {
    console.warn(`⚠️  Could not get count for ${tableName}:`, error.message);
    return 0;
  }

  return count || 0;
}

async function clearTable(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all records

    if (error) {
      console.error(`❌ Error clearing ${tableName}:`, error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`❌ Fatal error clearing ${tableName}:`, error);
    return false;
  }
}

async function clearAllData() {
  console.log("🧹 Clearing ALL data from database...\n");
  console.log("⚠️  WARNING: This will delete ALL data from ALL tables!");
  console.log("📋 Tables to be cleared:", TABLES_TO_CLEAR.join(", "));
  console.log("");

  let totalRecordsCleared = 0;
  let successCount = 0;
  let failureCount = 0;

  // First, show current data counts
  console.log("📊 Current data counts:");
  for (const table of TABLES_TO_CLEAR) {
    const count = await getTableCount(table);
    console.log(`  ${table}: ${count} records`);
    totalRecordsCleared += count;
  }

  if (totalRecordsCleared === 0) {
    console.log("\n✅ No data to clear. Database is already empty.");
    return;
  }

  console.log(`\n📈 Total records to clear: ${totalRecordsCleared}`);
  console.log("\n🗑️ Starting data clearing process...\n");

  // Clear tables in order
  for (const table of TABLES_TO_CLEAR) {
    const beforeCount = await getTableCount(table);

    if (beforeCount === 0) {
      console.log(`⏭️  Skipping ${table} (already empty)`);
      continue;
    }

    console.log(`🧹 Clearing ${table} (${beforeCount} records)...`);

    const success = await clearTable(table);

    if (success) {
      const afterCount = await getTableCount(table);
      console.log(
        `✅ ${table} cleared successfully (${beforeCount} → ${afterCount} records)`
      );
      successCount++;
    } else {
      console.log(`❌ Failed to clear ${table}`);
      failureCount++;
    }
  }

  // Final verification
  console.log("\n🔍 Final verification:");
  let remainingRecords = 0;

  for (const table of TABLES_TO_CLEAR) {
    const count = await getTableCount(table);
    remainingRecords += count;
    if (count > 0) {
      console.log(`⚠️  ${table}: ${count} records remaining`);
    }
  }

  // Summary
  console.log("\n📋 SUMMARY:");
  console.log(`✅ Tables cleared successfully: ${successCount}`);
  console.log(`❌ Tables failed to clear: ${failureCount}`);
  console.log(`📊 Total records cleared: ${totalRecordsCleared}`);
  console.log(`📊 Records remaining: ${remainingRecords}`);

  if (remainingRecords === 0) {
    console.log("\n🎉 SUCCESS: All data has been cleared from the database!");
  } else {
    console.log(
      "\n⚠️  WARNING: Some data may still remain. Check the verification above."
    );
  }

  // Recreate default data
  console.log("\n🌱 Recreating default data...");
  await recreateDefaultData();
}

async function recreateDefaultData() {
  try {
    // Insert default admin user
    const { data: adminUser, error: userError } = await supabase
      .from("users")
      .insert({
        email: "admin@messageblasting.com",
        password_hash: "admin123",
        first_name: "Admin",
        last_name: "User",
        role: "admin",
      })
      .select()
      .single();

    if (userError) {
      console.error("❌ Error creating admin user:", userError.message);
      return;
    }

    console.log("✅ Admin user created");

    // Insert default contact group
    const { data: defaultGroup, error: groupError } = await supabase
      .from("contact_groups")
      .insert({
        name: "Default Group",
        description: "Default group for all contacts",
        created_by: adminUser.id,
      })
      .select()
      .single();

    if (groupError) {
      console.error("❌ Error creating default group:", groupError.message);
      return;
    }

    console.log("✅ Default contact group created");

    // Insert default message template
    const { error: templateError } = await supabase
      .from("message_templates")
      .insert({
        name: "Welcome Message",
        description: "Default welcome message template",
        content:
          "Hello {{first_name}}, welcome to our service! Your phone number is {{phone_number}} and email is {{email}}.",
        merge_tags: [
          "first_name",
          "last_name",
          "phone_number",
          "email",
          "group",
          "license_expiration_date",
        ],
        created_by: adminUser.id,
      });

    if (templateError) {
      console.error(
        "❌ Error creating default template:",
        templateError.message
      );
      return;
    }

    console.log("✅ Default message template created");
    console.log("\n🎉 Default data recreation completed!");
  } catch (error) {
    console.error("❌ Error recreating default data:", error);
  }
}

// Run the script
clearAllData()
  .then(() => {
    console.log("\n✨ Data clearing process completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
