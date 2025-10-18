// API route to get queue status (connects to Render backend)
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://sms-backend-xxxx.onrender.com";

export async function GET(request: NextRequest) {
  try {
    // Forward request to Render backend
    const response = await fetch(`${BACKEND_URL}/queue/status`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.BACKEND_API_KEY || "dev-key"}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Queue status error:", error);
    return NextResponse.json(
      { error: "Failed to get queue status" },
      { status: 500 }
    );
  }
}