import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/message-templates/[id] - Get specific message template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: template, error } = await supabaseAdmin
      .from("message_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching message template:", error);
      return NextResponse.json(
        { error: "Message template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error in message template GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/message-templates/[id] - Update message template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, content, type, is_active } = body;

    const updateData: Record<string, string | boolean | number | string[]> = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || null;
    if (content !== undefined) {
      updateData.content = content.trim();
      // Recalculate character count and parts estimate
      const characterCount = content.length;
      updateData.character_count = characterCount;

      if (type === "sms" || !type) {
        updateData.parts_estimate = Math.ceil(characterCount / 160);
      }

      // Extract merge tags from content
      updateData.merge_tags = extractMergeTags(content);
    }
    if (type !== undefined) updateData.type = type;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: template, error } = await supabaseAdmin
      .from("message_templates")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating message template:", error);
      return NextResponse.json(
        { error: "Failed to update message template" },
        { status: 500 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error in message template PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/message-templates/[id] - Delete message template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("message_templates")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting message template:", error);
      return NextResponse.json(
        { error: "Failed to delete message template" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in message template DELETE:", error);
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
