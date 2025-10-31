import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/settings
 * Fetches system settings from the database
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    // Fetch all settings from database
    const { data: settingsData, error } = await supabaseAdmin
      .from("system_settings")
      .select("*")
      .order("category", { ascending: true })
      .order("key", { ascending: true });

    if (error) {
      console.error("Error fetching settings from database:", error);
      // Fallback to defaults if database query fails
      return NextResponse.json({
        success: true,
        settings: getDefaultSettings(),
      });
    }

    // Transform database key-value structure to nested settings object
    const settings = transformDatabaseToSettings(settingsData || []);

    // Merge with environment variables for sensitive values (if they exist)
    const mergedSettings = mergeWithEnvDefaults(settings);

    return NextResponse.json({
      success: true,
      settings: mergedSettings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings
 * Saves system settings to the database
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json(
        { error: "Settings data is required" },
        { status: 400 }
      );
    }

    // Transform nested settings object to database key-value structure
    const settingsToSave = transformSettingsToDatabase(settings);

    // Save each setting to the database using upsert
    const upsertPromises = settingsToSave.map((setting) =>
      supabaseAdmin
        .from("system_settings")
        .upsert(
          {
            category: setting.category,
            key: setting.key,
            value: setting.value,
            description: setting.description,
            is_encrypted: setting.is_encrypted || false,
          },
          {
            onConflict: "category,key",
          }
        )
        .select()
    );

    const results = await Promise.all(upsertPromises);
    const errors = results.filter((result) => result.error);

    if (errors.length > 0) {
      console.error("Error saving some settings:", errors);
      return NextResponse.json(
        { error: "Failed to save some settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}

/**
 * Transform database key-value structure to nested settings object
 */
function transformDatabaseToSettings(settingsData: any[]): any {
  const settings: any = {
    sms: {
      provider: "twilio",
      accountSid: "",
      authToken: "",
      fromNumber: "",
      rateLimit: 100,
      retryAttempts: 3,
      sandboxMode: false,
      verifiedNumber: "",
      apiKeySid: "",
      apiKeySecret: "",
    },
    email: {
      provider: "sendgrid",
      sendgridApiKey: "",
      fromEmail: "",
      fromName: "LabsToGo",
      sandboxMode: false,
      testEmailAddress: "",
    },
  };

  // Map database values to settings object
  settingsData.forEach((setting) => {
    const category = setting.category as keyof typeof settings;
    const key = setting.key;
    let value = setting.value;

    // Parse JSONB value if it's a string
    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch {
        // Keep as string if parsing fails
      }
    }

    // Map database keys to settings object keys
    const keyMapping: Record<string, Record<string, string>> = {
      sms: {
        provider: "provider",
        account_sid: "accountSid",
        auth_token: "authToken",
        from_number: "fromNumber",
        rate_limit: "rateLimit",
        retry_attempts: "retryAttempts",
        sandbox_mode: "sandboxMode",
        verified_number: "verifiedNumber",
        api_key_sid: "apiKeySid",
        api_key_secret: "apiKeySecret",
      },
      email: {
        provider: "provider",
        sendgrid_api_key: "sendgridApiKey",
        from_email: "fromEmail",
        from_name: "fromName",
        sandbox_mode: "sandboxMode",
        test_email_address: "testEmailAddress",
      },
    };

    const mappedKey = keyMapping[category]?.[key] || key;
    if (settings[category] && mappedKey in settings[category]) {
      // Handle special cases
      if (mappedKey === "allowedDomains" && Array.isArray(value)) {
        settings[category][mappedKey] = value;
      } else if (typeof value === "boolean" || typeof value === "number") {
        settings[category][mappedKey] = value;
      } else {
        settings[category][mappedKey] = String(value);
      }
    }
  });

  return settings;
}

/**
 * Transform nested settings object to database key-value structure
 */
function transformSettingsToDatabase(settings: any): any[] {
  const databaseSettings: any[] = [];

  // SMS Settings
  if (settings.sms) {
    databaseSettings.push(
      {
        category: "sms",
        key: "provider",
        value: settings.sms.provider || "twilio",
        description: "SMS provider to use",
        is_encrypted: false,
      },
      {
        category: "sms",
        key: "account_sid",
        value: settings.sms.accountSid || "",
        description: "Twilio Account SID",
        is_encrypted: true,
      },
      {
        category: "sms",
        key: "auth_token",
        value: settings.sms.authToken || "",
        description: "Twilio Auth Token",
        is_encrypted: true,
      },
      {
        category: "sms",
        key: "from_number",
        value: settings.sms.fromNumber || "",
        description: "Default from phone number",
        is_encrypted: false,
      },
      {
        category: "sms",
        key: "rate_limit",
        value: settings.sms.rateLimit || 100,
        description: "Maximum messages per minute",
        is_encrypted: false,
      },
      {
        category: "sms",
        key: "retry_attempts",
        value: settings.sms.retryAttempts || 3,
        description: "Number of retry attempts for failed messages",
        is_encrypted: false,
      },
      {
        category: "sms",
        key: "sandbox_mode",
        value: settings.sms.sandboxMode || false,
        description: "Enable sandbox mode for testing",
        is_encrypted: false,
      },
      {
        category: "sms",
        key: "verified_number",
        value: settings.sms.verifiedNumber || "",
        description: "Verified phone number for sandbox mode",
        is_encrypted: false,
      },
      {
        category: "sms",
        key: "api_key_sid",
        value: settings.sms.apiKeySid || "",
        description: "Twilio API Key SID (optional, starts with SK)",
        is_encrypted: true,
      },
      {
        category: "sms",
        key: "api_key_secret",
        value: settings.sms.apiKeySecret || "",
        description: "Twilio API Key Secret (optional)",
        is_encrypted: true,
      }
    );
  }

  // Email Settings (SendGrid)
  if (settings.email) {
    databaseSettings.push(
      {
        category: "email",
        key: "provider",
        value: settings.email.provider || "sendgrid",
        description: "Email provider to use",
        is_encrypted: false,
      },
      {
        category: "email",
        key: "sendgrid_api_key",
        value: settings.email.sendgridApiKey || "",
        description: "SendGrid API Key",
        is_encrypted: true,
      },
      {
        category: "email",
        key: "from_email",
        value: settings.email.fromEmail || "",
        description: "Default from email address",
        is_encrypted: false,
      },
      {
        category: "email",
        key: "from_name",
        value: settings.email.fromName || "LabsToGo",
        description: "Default from name",
        is_encrypted: false,
      },
      {
        category: "email",
        key: "sandbox_mode",
        value: settings.email.sandboxMode || false,
        description: "Enable email sandbox mode for testing",
        is_encrypted: false,
      },
      {
        category: "email",
        key: "test_email_address",
        value: settings.email.testEmailAddress || "",
        description: "Test email address for sandbox mode",
        is_encrypted: false,
      }
    );
  }

  return databaseSettings;
}

/**
 * Get default settings (fallback when database is unavailable)
 */
function getDefaultSettings(): any {
  return {
    sms: {
      provider: "twilio",
      accountSid: process.env.TWILIO_ACCOUNT_SID || "",
      authToken: process.env.TWILIO_AUTH_TOKEN ? "***hidden***" : "",
      fromNumber: process.env.TWILIO_FROM_NUMBER || "",
      rateLimit: 100,
      retryAttempts: 3,
      sandboxMode: process.env.TWILIO_SANDBOX_MODE === "true",
    },
    email: {
      provider: "sendgrid",
      sendgridApiKey: process.env.SENDGRID_API_KEY ? "***hidden***" : "",
      fromEmail: process.env.SENDGRID_FROM_EMAIL || "",
      fromName: process.env.SENDGRID_FROM_NAME || "LabsToGo",
    },
  };
}

/**
 * Merge database settings with environment variable defaults (for sensitive values)
 */
function mergeWithEnvDefaults(settings: any): any {
  // Keep sensitive values from env if not set in database
  if (process.env.TWILIO_ACCOUNT_SID && !settings.sms.accountSid) {
    settings.sms.accountSid = process.env.TWILIO_ACCOUNT_SID;
  }
  if (process.env.TWILIO_AUTH_TOKEN && !settings.sms.authToken) {
    settings.sms.authToken = "***hidden***"; // Never expose actual token
  }
  if (process.env.TWILIO_FROM_NUMBER && !settings.sms.fromNumber) {
    settings.sms.fromNumber = process.env.TWILIO_FROM_NUMBER;
  }
  if (process.env.TWILIO_SANDBOX_MODE && settings.sms.sandboxMode === false) {
    settings.sms.sandboxMode = process.env.TWILIO_SANDBOX_MODE === "true";
  }

  if (process.env.SENDGRID_API_KEY && !settings.email.sendgridApiKey) {
    settings.email.sendgridApiKey = "***hidden***"; // Never expose actual API key
  }
  if (process.env.SENDGRID_FROM_EMAIL && !settings.email.fromEmail) {
    settings.email.fromEmail = process.env.SENDGRID_FROM_EMAIL;
  }
  if (process.env.SENDGRID_FROM_NAME && !settings.email.fromName) {
    settings.email.fromName = process.env.SENDGRID_FROM_NAME;
  }

  return settings;
}
