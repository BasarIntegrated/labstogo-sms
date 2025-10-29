import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
  try {
    const { error: smsError, count: smsCount } = await supabaseAdmin
      .from("sms_messages")
      .delete({ count: "exact" })
      .eq("status", "pending");

    if (smsError) {
      console.error("Error deleting pending SMS messages:", smsError);
    }

    const { error: emailError, count: emailCount } = await supabaseAdmin
      .from("email_messages")
      .delete({ count: "exact" })
      .eq("status", "pending");

    if (emailError) {
      console.error("Error deleting pending Email messages:", emailError);
    }

    return NextResponse.json({
      success: true,
      cleared: {
        sms: smsCount || 0,
        email: emailCount || 0,
      },
    });
  } catch (error) {
    console.error("Error clearing pending messages:", error);
    return NextResponse.json(
      { error: "Failed to clear pending messages" },
      { status: 500 }
    );
  }
}


