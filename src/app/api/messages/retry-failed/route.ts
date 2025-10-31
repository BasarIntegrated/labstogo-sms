import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Retry failed SMS: set to pending and bump retry_count/last_retry_at
    const { data: failedSMS } = await supabaseAdmin
      .from("sms_messages")
      .select("id, retry_count")
      .eq("status", "failed");

    if (failedSMS && failedSMS.length > 0) {
      // Update each SMS message individually to increment retry_count
      for (const sms of failedSMS) {
        const { error } = await supabaseAdmin
          .from("sms_messages")
          .update({
            status: "pending",
            retry_count: (sms.retry_count || 0) + 1,
            last_retry_at: new Date().toISOString(),
          })
          .eq("id", sms.id);
        if (error) throw error;
      }
    }

    // Retry failed EMAIL: set to pending and bump retry_count/last_retry_at
    const { data: failedEmail } = await supabaseAdmin
      .from("email_messages")
      .select("id, retry_count")
      .eq("status", "failed");

    if (failedEmail && failedEmail.length > 0) {
      // Update each Email message individually to increment retry_count
      for (const email of failedEmail) {
        const { error } = await supabaseAdmin
          .from("email_messages")
          .update({
            status: "pending",
            retry_count: (email.retry_count || 0) + 1,
            last_retry_at: new Date().toISOString(),
          })
          .eq("id", email.id);
        if (error) throw error;
      }
    }

    return NextResponse.json({
      success: true,
      retriedSms: failedSMS?.length || 0,
      retriedEmail: failedEmail?.length || 0,
    });
  } catch (error: any) {
    console.error("Error retrying failed messages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retry failed messages" },
      { status: 500 }
    );
  }
}
