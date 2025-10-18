import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/contact-groups - Fetch all contact groups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabaseAdmin
      .from("contact_groups")
      .select(
        `
        *,
        contacts(count)
      `
      )
      .order("created_at", { ascending: false });

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply pagination
    const from = page * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: groups, error } = await query;

    if (error) {
      console.error("Error fetching contact groups:", error);
      return NextResponse.json(
        { error: "Failed to fetch contact groups" },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count, error: countError } = await supabaseAdmin
      .from("contact_groups")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Count error:", countError);
      return NextResponse.json(
        { error: "Failed to get count" },
        { status: 500 }
      );
    }

    // Process groups to include contact count
    const processedGroups =
      groups?.map((group) => ({
        ...group,
        contact_count: group.contacts?.[0]?.count || 0,
      })) || [];

    return NextResponse.json({
      groups: processedGroups,
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error in contact groups GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/contact-groups - Create new contact group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      );
    }

    // For now, use a mock user ID - this should come from authentication
    const mockUserId = "00000000-0000-0000-0000-000000000000";

    const groupData = {
      name: name.trim(),
      description: description?.trim() || null,
      color: color || "#3B82F6",
      created_by: mockUserId,
    };

    const { data: group, error } = await supabaseAdmin
      .from("contact_groups")
      .insert(groupData)
      .select()
      .single();

    if (error) {
      console.error("Error creating contact group:", error);
      return NextResponse.json(
        { error: "Failed to create contact group" },
        { status: 500 }
      );
    }

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error("Error in contact groups POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
