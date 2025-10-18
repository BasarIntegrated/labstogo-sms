import { getSandboxInfo, personalizeMessage, sendSMS } from "@/lib/sms";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message, patient } = await request.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: "Phone number and message are required" },
        { status: 400 }
      );
    }

    // Personalize message if patient data is provided
    const finalMessage = patient
      ? personalizeMessage(message, patient)
      : message;

    // Send SMS
    const result = await sendSMS(phoneNumber, finalMessage);

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        sandbox: getSandboxInfo(),
        personalizedMessage: finalMessage,
      });
    } else {
      return NextResponse.json(
        {
          error: result.error,
          sandbox: getSandboxInfo(),
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Test SMS error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
