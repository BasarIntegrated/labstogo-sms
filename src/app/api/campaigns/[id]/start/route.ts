// API route to start campaigns (connects to Render backend)
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "https://bumpy-field-production.up.railway.app";

export async function POST(request: NextRequest) {
  try {
    const { campaignId, patientIds } = await request.json();

    // Forward request to Render backend
    const response = await fetch(
      `${BACKEND_URL}/api/campaigns/${campaignId}/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BACKEND_API_KEY || "dev-key"}`,
        },
        body: JSON.stringify({ patientIds }),
      }
    );

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Campaign start error:", error);
    return NextResponse.json(
      { error: "Failed to start campaign" },
      { status: 500 }
    );
  }
}
