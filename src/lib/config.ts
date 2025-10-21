// Configuration for hybrid deployment
export const config = {
  // Backend URL (Railway)
  backendUrl:
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://bumpy-field-production.up.railway.app",

  // API Key for backend communication
  backendApiKey: process.env.BACKEND_API_KEY || "dev-key",

  // Supabase configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  // Twilio configuration
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
    authToken: process.env.TWILIO_AUTH_TOKEN!,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER!,
    sandboxMode: process.env.TWILIO_SANDBOX_MODE === "true",
  },

  // Environment
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
};
