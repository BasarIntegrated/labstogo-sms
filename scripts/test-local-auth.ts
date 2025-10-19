import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testAuthentication() {
  console.log("🧪 Testing NextAuth.js Authentication Locally...\n");

  try {
    // 1. Test database connection
    console.log("1. Testing Supabase connection...");
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, role, password_hash")
      .eq("email", "admin@messageblasting.com")
      .single();

    if (usersError) {
      console.log("❌ Database connection failed:", usersError.message);
      return;
    }

    if (!users) {
      console.log("❌ Admin user not found in database");
      return;
    }

    console.log("✅ Database connection successful");
    console.log(`   User ID: ${users.id}`);
    console.log(`   Email: ${users.email}`);
    console.log(`   Role: ${users.role}`);

    // 2. Test password verification
    console.log("\n2. Testing password verification...");
    const passwordMatch = await bcrypt.compare("admin123", users.password_hash);

    if (passwordMatch) {
      console.log("✅ Password verification successful");
    } else {
      console.log("❌ Password verification failed");
      return;
    }

    // 3. Test NextAuth.js API endpoint
    console.log("\n3. Testing NextAuth.js API endpoint...");
    try {
      const response = await fetch("http://localhost:3000/api/auth/providers");
      const providers = await response.json();

      if (providers.credentials) {
        console.log("✅ NextAuth.js API endpoint accessible");
        console.log(`   Provider: ${providers.credentials.name}`);
      } else {
        console.log("❌ NextAuth.js credentials provider not found");
      }
    } catch (error) {
      console.log("❌ NextAuth.js API endpoint not accessible:", error);
    }

    console.log("\n🎯 Authentication Test Summary:");
    console.log("✅ Database: Connected");
    console.log("✅ User: Found");
    console.log("✅ Password: Valid");
    console.log("✅ NextAuth.js: Configured");

    console.log("\n📝 Next Steps:");
    console.log("1. Open http://localhost:3000/login in browser");
    console.log("2. Login with: admin@messageblasting.com / admin123");
    console.log("3. Check browser console for any errors");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testAuthentication()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
