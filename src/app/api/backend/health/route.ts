import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://bumpy-field-production.up.railway.app";

export async function GET(request: NextRequest) {
  try {
    // Forward request to backend health endpoint
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.BACKEND_API_KEY || "dev-key"}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get backend health");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching backend health:", error);
    return NextResponse.json({ error: "Failed to get backend health" }, { status: 500 });
  }
}
