import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://bumpy-field-production.up.railway.app";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Forward query parameters to backend
    const limit = searchParams.get("limit") || "50";
    const since = searchParams.get("since");

    const backendResponse = await fetch(
      `${BACKEND_URL}/logs?limit=${limit}${since ? `&since=${since}` : ""}`
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("Backend error response:", errorText);
      throw new Error(
        `Failed to fetch logs from backend: ${backendResponse.status} ${errorText}`
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs", details: error.message },
      { status: 500 }
    );
  }
}
