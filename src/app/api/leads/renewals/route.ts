import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const due = searchParams.get("due");

    let query = supabase
      .from("renewal_data")
      .select(
        `
        *,
        leads (
          id,
          first_name,
          last_name,
          phone_number,
          email
        )
      `
      )
      .order("renewal_date", { ascending: true });

    if (due === "true") {
      const today = new Date().toISOString().split("T")[0];
      query = query.lte("renewal_date", today).eq("status", "pending");
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: unknown) {
    console.error("Get renewals error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch renewals",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead_id, exam_type, exam_date, renewal_date, status } = body;

    if (!lead_id || !exam_type || !exam_date || !renewal_date) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: lead_id, exam_type, exam_date, renewal_date",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("renewal_data")
      .insert({
        lead_id,
        exam_type,
        exam_date,
        renewal_date,
        status: status || "pending",
        notifications_sent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error("Create renewal error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create renewal",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Renewal ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("renewal_data")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error("Update renewal error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update renewal",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Renewal ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("renewal_data").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Renewal deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete renewal error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete renewal",
      },
      { status: 500 }
    );
  }
}
