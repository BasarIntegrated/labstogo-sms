import {
  deleteImportSession,
  getImportSession,
  setImportSession,
} from "@/lib/importProgress";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  const session = getImportSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({
    sessionId,
    progress: session.progress,
    current: session.current,
    total: session.total,
    message: session.message,
    status: session.status,
    errors: session.errors,
    result: session.result,
  });
}

export async function POST(request: NextRequest) {
  const {
    sessionId,
    progress,
    current,
    total,
    message,
    status,
    errors,
    result,
  } = await request.json();

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  setImportSession(sessionId, {
    progress: progress || 0,
    current: current || 0,
    total: total || 0,
    message: message || "",
    status: status || "processing",
    errors: errors || [],
    result,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (sessionId) {
    deleteImportSession(sessionId);
  }

  return NextResponse.json({ success: true });
}
