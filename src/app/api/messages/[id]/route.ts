import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// DELETE a specific message (SMS or Email)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // Try to delete from SMS messages first
    const { error: smsError, count: smsCount } = await supabaseAdmin
      .from("sms_messages")
      .delete({ count: "exact" })
      .eq("id", id);

    if (smsError) {
      console.error("Error deleting SMS message:", smsError);
      // Don't return here, try email messages
    }

    // If SMS message was found and deleted, return success
    if (smsCount && smsCount > 0) {
      return NextResponse.json({
        success: true,
        message: "SMS message deleted successfully",
        type: "sms",
      });
    }

    // Try to delete from Email messages
    const { error: emailError, count: emailCount } = await supabaseAdmin
      .from("email_messages")
      .delete({ count: "exact" })
      .eq("id", id);

    if (emailError) {
      console.error("Error deleting Email message:", emailError);
      return NextResponse.json(
        { error: "Failed to delete message" },
        { status: 500 }
      );
    }

    if (emailCount && emailCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Email message deleted successfully",
        type: "email",
      });
    }

    // Message not found in either table
    return NextResponse.json(
      { error: "Message not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}

