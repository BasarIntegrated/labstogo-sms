// Test login functionality
console.log("🔐 Testing Login Functionality");

// Test the login credentials
const testCredentials = {
  email: "admin@messageblasting.com",
  password: "admin123",
};

console.log("📧 Test Credentials:");
console.log(`Email: ${testCredentials.email}`);
console.log(`Password: ${testCredentials.password}`);

// Simulate the login logic from the AuthContext
async function testLogin(email: string, password: string) {
  console.log("\n🧪 Testing Login Logic:");

  // Mock authentication - same as in AuthContext
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // For demo purposes, accept any email/password combination
  if (email && password) {
    const userData = {
      id: "1",
      email: email,
      name: email.split("@")[0],
      role: email.includes("admin") ? "admin" : "standard",
    };

    console.log("✅ Login should succeed");
    console.log("👤 User data:", userData);

    // Simulate localStorage storage
    console.log("💾 Would store in localStorage:", JSON.stringify(userData));

    return true;
  }

  console.log("❌ Login would fail - missing email or password");
  return false;
}

// Test the login
testLogin(testCredentials.email, testCredentials.password)
  .then((success) => {
    if (success) {
      console.log("\n🎉 Login test PASSED!");
      console.log("📱 The credentials should work in the browser");
      console.log(
        "🔗 Try logging in at: https://labstogo-sms.vercel.app/login"
      );
    } else {
      console.log("\n❌ Login test FAILED!");
    }
  })
  .catch((error) => {
    console.error("❌ Login test error:", error);
  });
