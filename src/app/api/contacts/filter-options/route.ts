import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/contacts/filter-options - Get unique values for filter dropdowns
export async function GET(request: NextRequest) {
  try {
    // Get unique job types
    const { data: jobTypes, error: jobTypesError } = await supabaseAdmin
      .from("contacts")
      .select("job_type")
      .not("job_type", "is", null)
      .neq("job_type", "");

    if (jobTypesError) {
      console.error("Error fetching job types:", jobTypesError);
    }

    // Get unique states
    const { data: states, error: statesError } = await supabaseAdmin
      .from("contacts")
      .select("state")
      .not("state", "is", null)
      .neq("state", "");

    if (statesError) {
      console.error("Error fetching states:", statesError);
    }

    // Get unique cities
    const { data: cities, error: citiesError } = await supabaseAdmin
      .from("contacts")
      .select("city")
      .not("city", "is", null)
      .neq("city", "");

    if (citiesError) {
      console.error("Error fetching cities:", citiesError);
    }

    // Process and deduplicate the results
    const uniqueJobTypes = [
      ...new Set(jobTypes?.map((item) => item.job_type).filter(Boolean) || []),
    ];
    const uniqueStates = [
      ...new Set(states?.map((item) => item.state).filter(Boolean) || []),
    ];
    const uniqueCities = [
      ...new Set(cities?.map((item) => item.city).filter(Boolean) || []),
    ];

    return NextResponse.json({
      jobTypes: uniqueJobTypes.sort(),
      states: uniqueStates.sort(),
      cities: uniqueCities.sort(),
    });
  } catch (error) {
    console.error("Error in contacts filter-options GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
