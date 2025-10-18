import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET settings
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase admin client not configured" },
        { status: 500 }
      );
    }

    // In a real app, you'd store settings in a database table
    // For now, we'll return default settings
    const defaultSettings = {
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
        provider: "smtp",
        smtpHost: process.env.SMTP_HOST || "",
        smtpPort: parseInt(process.env.SMTP_PORT || "587"),
        username: process.env.SMTP_USERNAME || "",
        password: process.env.SMTP_PASSWORD ? "***hidden***" : "",
        fromEmail: process.env.SMTP_FROM_EMAIL || "",
      },
      general: {
        appName: "LabsToGo SMS Blaster",
        timezone: "America/New_York",
        dateFormat: "MM/DD/YYYY",
        language: "en",
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        campaignAlerts: true,
        errorAlerts: true,
      },
      security: {
        sessionTimeout: 30,
        requireTwoFactor: false,
        allowedDomains: [],
        maxLoginAttempts: 5,
      },
    };

    return NextResponse.json({
      success: true,
      settings: defaultSettings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST settings
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

    // In a real app, you'd save settings to a database table
    // For now, we'll just validate and return success
    console.log("Settings to save:", settings);

    // Validate required fields
    if (!settings) {
      return NextResponse.json(
        { error: "Settings data is required" },
        { status: 400 }
      );
    }

    // You could save to a settings table here
    // const { data, error } = await supabaseAdmin
    //   .from('system_settings')
    //   .upsert({ id: 1, settings: settings })
    //   .select();

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
