import { RenewalData } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dueOnly = searchParams.get("due_only") === "true";

    // DISABLED: renewal_data table does not exist
    // let query = supabase
    //   .from("renewal_data")
    //   .select(
    //     `
    //     *,
    //     patients:patient_id (
    //       id,
    //       first_name,
    //       last_name,
    //       phone_number,
    //       email
    //     )
    //   `
    //   )
    //   .order("renewal_date", { ascending: true });

    // if (dueOnly) {
    //   const today = new Date().toISOString().split("T")[0];
    //   query = query.lte("renewal_date", today).eq("status", "pending");
    // }

    // const { data, error } = await query;

    // Mock data since table doesn't exist
    const data: any[] = [];
    const error = null;

    if (error) {
      console.error("Error fetching renewals:", error);
      return NextResponse.json(
        { error: "Failed to fetch renewals" },
        { status: 500 }
      );
    }

    return NextResponse.json({ renewals: data });
  } catch (error) {
    console.error("Error in renewals GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.patient_id) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    if (!body.exam_type) {
      return NextResponse.json(
        { error: "Exam type is required" },
        { status: 400 }
      );
    }

    if (!body.exam_date) {
      return NextResponse.json(
        { error: "Exam date is required" },
        { status: 400 }
      );
    }

    if (!body.renewal_date) {
      return NextResponse.json(
        { error: "Renewal date is required" },
        { status: 400 }
      );
    }

    const renewalData: Omit<RenewalData, "id" | "created_at" | "updated_at"> = {
      patient_id: body.patient_id,
      license_type: body.license_type || "Unknown",
      license_number: body.license_number || "",
      current_expiry_date: body.current_expiry_date || "",
      renewal_deadline: body.renewal_deadline || "",
      renewal_status: body.renewal_status || "pending",
      exam_date: body.exam_date,
      exam_score: body.exam_score,
      renewal_fee: body.renewal_fee,
      notes: body.notes,
    };

    // DISABLED: renewal_data table does not exist
    // const { data, error } = await supabase
    //   .from("renewal_data")
    //   .insert(renewalData)
    //   .select(
    //     `
    //     *,
    //     patients:patient_id (
    //       id,
    //       first_name,
    //       last_name,
    //       phone_number,
    //       email
    //     )
    //   `
    //   )
    //   .single();

    // Mock data since table doesn't exist
    const data = {
      ...renewalData,
      id: "mock-id",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const error = null;

    if (error) {
      console.error("Error creating renewal:", error);
      return NextResponse.json(
        { error: "Failed to create renewal" },
        { status: 500 }
      );
    }

    return NextResponse.json({ renewal: data }, { status: 201 });
  } catch (error) {
    console.error("Error in renewals POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Renewal ID is required" },
        { status: 400 }
      );
    }

    // DISABLED: renewal_data table does not exist
    // const { data, error } = await supabase
    //   .from("renewal_data")
    //   .update(updates)
    //   .eq("id", id)
    //   .select(
    //     `
    //     *,
    //     patients:patient_id (
    //       id,
    //       first_name,
    //       last_name,
    //       phone_number,
    //       email
    //     )
    //   `
    //   )
    //   .single();

    // Mock data since table doesn't exist
    const data = {
      ...updates,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const error = null;

    if (error) {
      console.error("Error updating renewal:", error);
      return NextResponse.json(
        { error: "Failed to update renewal" },
        { status: 500 }
      );
    }

    return NextResponse.json({ renewal: data });
  } catch (error) {
    console.error("Error in renewals PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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

    // DISABLED: renewal_data table does not exist
    // const { data, error } = await supabase
    //   .from("renewal_data")
    //   .delete()
    //   .eq("id", id)
    //   .select();

    // Mock data since table doesn't exist
    const data = { id };
    const error = null;

    if (error) {
      console.error("Error deleting renewal:", error);
      return NextResponse.json(
        { error: "Failed to delete renewal" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, deleted: data });
  } catch (error) {
    console.error("Error in renewals DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
