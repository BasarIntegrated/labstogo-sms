import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/groups - Fetch all contact groups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Calculate pagination
    const from = page * limit;
    const to = from + limit - 1;

    // Fetch groups with contact count
    const { data, error } = await supabaseAdmin
      .from("contact_groups")
      .select("*")
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching groups:", error);
      return NextResponse.json(
        { error: "Failed to fetch groups" },
        { status: 500 }
      );
    }

    // Get total count
    const { count, error: countError } = await supabaseAdmin
      .from("contact_groups")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Count error:", countError);
    }

    // Update contact counts for each group
    const groupsWithCounts = await Promise.all(
      (data || []).map(async (group) => {
        const { count: contactCount } = await supabaseAdmin
          .from("contacts")
          .select("*", { count: "exact", head: true })
          .eq("group_id", group.id);

        return {
          ...group,
          contact_count: contactCount || 0,
        };
      })
    );

    return NextResponse.json({
      groups: groupsWithCounts,
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error in groups GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create new contact group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      );
    }

    // Get the admin user ID
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (adminError || !adminUser) {
      console.error("Error fetching admin user:", adminError);
      return NextResponse.json(
        { error: "Failed to find admin user" },
        { status: 500 }
      );
    }

    const groupData = {
      name: body.name,
      description: body.description || null,
      color: body.color || "#3B82F6",
      created_by: adminUser.id,
    };

    console.log("Creating group with data:", groupData);

    const { data, error } = await supabaseAdmin
      .from("contact_groups")
      .insert(groupData)
      .select()
      .single();

    if (error) {
      console.error("Error creating group:", error);
      return NextResponse.json(
        { error: "Failed to create group", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ group: data }, { status: 201 });
  } catch (error) {
    console.error("Error in groups POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/groups - Update existing group
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description || null;
    if (body.color !== undefined) updateData.color = body.color;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("contact_groups")
      .update(updateData)
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating group:", error);
      return NextResponse.json(
        { error: "Failed to update group" },
        { status: 500 }
      );
    }

    return NextResponse.json({ group: data }, { status: 200 });
  } catch (error) {
    console.error("Error in groups PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/groups - Delete group
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    // Check if group has contacts
    const { count: contactCount } = await supabaseAdmin
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("group_id", id);

    if (contactCount && contactCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete group with contacts. Please reassign or remove contacts first.",
          contactCount,
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("contact_groups")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting group:", error);
      return NextResponse.json(
        { error: "Failed to delete group" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in groups DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
