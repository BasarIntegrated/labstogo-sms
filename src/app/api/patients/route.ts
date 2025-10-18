import { supabase } from "@/lib/supabase";
import { PatientFilters } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log(
      "SUPABASE_SERVICE_ROLE_KEY:",
      process.env.SUPABASE_SERVICE_ROLE_KEY ? "Present" : "Missing"
    );
    console.log(
      "NEXT_PUBLIC_SUPABASE_URL:",
      process.env.NEXT_PUBLIC_SUPABASE_URL
    );

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters: PatientFilters = {
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status")?.split(",") || [],
      tags: searchParams.get("tags")?.split(",") || [],
      license_type: searchParams.get("license_type")?.split(",") || [],
      specialty: searchParams.get("specialty")?.split(",") || [],
      created_after: searchParams.get("created_after") || undefined,
      created_before: searchParams.get("created_before") || undefined,
      phone_prefix: searchParams.get("phone_prefix") || undefined,
      exam_date_after: searchParams.get("exam_date_after") || undefined,
      exam_date_before: searchParams.get("exam_date_before") || undefined,
      renewal_date_after: searchParams.get("renewal_date_after") || undefined,
      renewal_date_before: searchParams.get("renewal_date_before") || undefined,
      page: parseInt(searchParams.get("page") || "0"),
      limit: parseInt(searchParams.get("limit") || "50"),
      sortBy: searchParams.get("sortBy") || "created_at",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    let query = supabase.from("contacts").select("*");

    // Apply filters
    if (filters.search) {
      query = query.or(
        `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%`
      );
    }

    if (filters.status && filters.status.length > 0) {
      query = query.in("status", filters.status);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps("tags", filters.tags);
    }

    if (filters.license_type && filters.license_type.length > 0) {
      query = query.in("license_type", filters.license_type);
    }

    if (filters.specialty && filters.specialty.length > 0) {
      query = query.in("specialty", filters.specialty);
    }

    if (filters.created_after) {
      query = query.gte("created_at", filters.created_after);
    }

    if (filters.created_before) {
      query = query.lte("created_at", filters.created_before);
    }

    if (filters.phone_prefix) {
      query = query.like("phone_number", `${filters.phone_prefix}%`);
    }

    if (filters.exam_date_after) {
      query = query.gte("exam_date", filters.exam_date_after);
    }

    if (filters.exam_date_before) {
      query = query.lte("exam_date", filters.exam_date_before);
    }

    if (filters.renewal_date_after) {
      query = query.gte("expires", filters.renewal_date_after);
    }

    if (filters.renewal_date_before) {
      query = query.lte("expires", filters.renewal_date_before);
    }

    // Apply pagination
    const from = (filters.page || 0) * (filters.limit || 50);
    const to = from + (filters.limit || 50) - 1;
    query = query.range(from, to);

    // Apply sorting
    query = query.order(filters.sortBy || "created_at", {
      ascending: (filters.sortOrder || "desc") === "asc",
    });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching patients:", error);
      return NextResponse.json(
        { error: "Failed to fetch patients" },
        { status: 500 }
      );
    }

    // Process patients data (simplified without campaign data)
    const processedPatients = data || [];

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from("contacts")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Count error:", countError);
      return NextResponse.json(
        { error: "Failed to get count" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      patients: processedPatients,
      total: count || 0,
      page: filters.page || 0,
      limit: filters.limit || 50,
    });
  } catch (error) {
    console.error("Error in patients GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Console log the incoming data for debugging
    console.log(
      "🔍 Patient creation request data:",
      JSON.stringify(body, null, 2)
    );

    // Validate required fields
    if (!body.phone_number) {
      console.log("❌ Validation failed: Phone number is required");
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const leadData = {
      phone_number: body.phone_number,
      first_name: body.first_name || null,
      last_name: body.last_name || null,
      email: body.email || null,
      company: body.company || null,
      source: body.source || null,
      status: body.status || "active",
      metadata: body.metadata || {},
    };

    // Console log the processed data before database insertion
    console.log(
      "📝 Processed patient data for insertion:",
      JSON.stringify(leadData, null, 2)
    );

    const { data, error } = await supabase
      .from("contacts")
      .insert(leadData)
      .select()
      .single();

    if (error) {
      console.error("❌ Database error creating patient:", error);
      console.error("❌ Error details:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: "Failed to create patient" },
        { status: 500 }
      );
    }

    console.log(
      "✅ Successfully created patient:",
      JSON.stringify(data, null, 2)
    );
    return NextResponse.json({ patient: data }, { status: 201 });
  } catch (error) {
    console.error("❌ Unexpected error in patients POST:", error);
    console.error(
      "❌ Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
