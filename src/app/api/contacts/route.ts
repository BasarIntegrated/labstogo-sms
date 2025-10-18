import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/contacts - Fetch all contacts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status")?.split(",") || [];
    const tags = searchParams.get("tags")?.split(",") || [];
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    let query = supabaseAdmin.from("contacts").select("*");

    // Apply filters
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone_number.ilike.%${search}%`
      );
    }

    if (status && status.length > 0) {
      query = query.in("status", status);
    }

    if (tags && tags.length > 0) {
      query = query.overlaps("tags", tags);
    }

    const group = searchParams.get("group");
    if (group && group !== "all") {
      query = query.eq("group_id", group);
    }

    const jobType = searchParams.get("job_type");
    if (jobType && jobType !== "all") {
      query = query.eq("job_type", jobType);
    }

    const state = searchParams.get("state");
    if (state && state !== "all") {
      query = query.eq("state", state);
    }

    const city = searchParams.get("city");
    if (city && city !== "all") {
      query = query.eq("city", city);
    }

    const expiresFrom = searchParams.get("expires_from");
    const expiresTo = searchParams.get("expires_to");

    if (expiresFrom) {
      query = query.gte("expires", expiresFrom);
    }

    if (expiresTo) {
      query = query.lte("expires", expiresTo);
    }

    // Apply pagination
    const from = page * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Apply sorting
    query = query.order(sortBy, {
      ascending: sortOrder === "asc",
    });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching contacts:", error);
      return NextResponse.json(
        { error: "Failed to fetch contacts" },
        { status: 500 }
      );
    }

    // Get total count for pagination (with same filters applied)
    let countQuery = supabaseAdmin
      .from("contacts")
      .select("*", { count: "exact", head: true });

    // Apply the same filters to the count query
    if (search) {
      countQuery = countQuery.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone_number.ilike.%${search}%`
      );
    }

    if (status && status.length > 0) {
      countQuery = countQuery.in("status", status);
    }

    if (tags && tags.length > 0) {
      countQuery = countQuery.overlaps("tags", tags);
    }

    if (group && group !== "all") {
      countQuery = countQuery.eq("group_id", group);
    }

    if (jobType && jobType !== "all") {
      countQuery = countQuery.eq("job_type", jobType);
    }

    if (state && state !== "all") {
      countQuery = countQuery.eq("state", state);
    }

    if (city && city !== "all") {
      countQuery = countQuery.eq("city", city);
    }

    if (expiresFrom) {
      countQuery = countQuery.gte("expires", expiresFrom);
    }

    if (expiresTo) {
      countQuery = countQuery.lte("expires", expiresTo);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error("Count error:", countError);
      return NextResponse.json(
        { error: "Failed to get count" },
        { status: 500 }
      );
    }

    // Get count of contacts with email addresses
    const { count: emailCount, error: emailCountError } = await supabaseAdmin
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .not("email", "is", null)
      .neq("email", "");

    if (emailCountError) {
      console.error("Email count error:", emailCountError);
    }

    return NextResponse.json({
      contacts: data || [],
      total: count || 0,
      emailCount: emailCount || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error in contacts GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Create new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.phone_number) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const contactData = {
      phone_number: body.phone_number,
      first_name: body.first_name || null,
      last_name: body.last_name || null,
      email: body.email || null,
      company: body.company || null,
      source: body.source || null,
      status: body.status || "active",
      group_id: body.group_id || null,
      license_expiration_date: body.license_expiration_date || null,
      others: body.others || null,
      preferred_contact_method: body.preferred_contact_method || "sms",
    };

    const { data, error } = await supabaseAdmin
      .from("contacts")
      .insert(contactData)
      .select()
      .single();

    if (error) {
      console.error("Error creating contact:", error);
      return NextResponse.json(
        { error: "Failed to create contact" },
        { status: 500 }
      );
    }

    return NextResponse.json({ contact: data }, { status: 201 });
  } catch (error) {
    console.error("Error in contacts POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
