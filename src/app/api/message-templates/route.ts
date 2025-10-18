import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/message-templates - Fetch all message templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const type = searchParams.get("type") || undefined;
    const isActive = searchParams.get("is_active");
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabaseAdmin
      .from("message_templates")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,content.ilike.%${search}%`
      );
    }

    if (type) {
      query = query.eq("type", type);
    }

    if (isActive !== null && isActive !== undefined) {
      query = query.eq("is_active", isActive === "true");
    }

    // Apply pagination
    const from = page * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: templates, error } = await query;

    if (error) {
      console.error("Error fetching message templates:", error);
      return NextResponse.json(
        { error: "Failed to fetch message templates" },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count, error: countError } = await supabaseAdmin
      .from("message_templates")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Count error:", countError);
      return NextResponse.json(
        { error: "Failed to get count" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      templates: templates || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error in message templates GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/message-templates - Create new message template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, content, type = "sms" } = body;

    if (!name || !content) {
      return NextResponse.json(
        { error: "Name and content are required" },
        { status: 400 }
      );
    }

    // For now, use a mock user ID - this should come from authentication
    const mockUserId = "00000000-0000-0000-0000-000000000000";

    // Calculate character count and parts estimate for SMS
    const characterCount = content.length;
    let partsEstimate = 1;

    if (type === "sms") {
      // SMS parts calculation (160 chars per part for standard SMS)
      partsEstimate = Math.ceil(characterCount / 160);
    }

    // Extract merge tags from content
    const mergeTags = extractMergeTags(content);

    const templateData = {
      name: name.trim(),
      description: description?.trim() || null,
      content: content.trim(),
      type,
      character_count: characterCount,
      parts_estimate: partsEstimate,
      merge_tags: mergeTags,
      is_active: true,
      created_by: mockUserId,
    };

    const { data: template, error } = await supabaseAdmin
      .from("message_templates")
      .insert(templateData)
      .select()
      .single();

    if (error) {
      console.error("Error creating message template:", error);
      return NextResponse.json(
        { error: "Failed to create message template" },
        { status: 500 }
      );
    }

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error in message templates POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to extract merge tags from content
function extractMergeTags(content: string): string[] {
  const mergeTagRegex = /\{\{(\w+)\}\}/g;
  const tags: string[] = [];
  let match;

  while ((match = mergeTagRegex.exec(content)) !== null) {
    const tag = match[1];
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }

  return tags;
}
