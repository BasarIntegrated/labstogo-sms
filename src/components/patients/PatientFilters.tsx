"use client";

import { DateRangePickerShadcn } from "@/components/ui/date-range-picker-shadcn";
import { PatientFilters as PatientFiltersType } from "@/types/database";
import { useEffect, useState } from "react";

interface PatientFiltersProps {
  filters: PatientFiltersType;
  onFiltersChange: (filters: PatientFiltersType) => void;
}

export function PatientFilters({
  filters,
  onFiltersChange,
}: PatientFiltersProps) {
  const [pendingFilters, setPendingFilters] = useState<PatientFiltersType>(
    () => {
      // Load from localStorage on initialization
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("patient-filters");
        if (saved) {
          try {
            return { ...filters, ...JSON.parse(saved) };
          } catch (e) {
            console.warn("Failed to parse saved filters:", e);
          }
        }
      }
      return filters;
    }
  );

  // Sync pendingFilters with filters prop when it changes
  useEffect(() => {
    setPendingFilters(filters);
  }, [filters]);

  // Save to localStorage whenever pendingFilters change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("patient-filters", JSON.stringify(pendingFilters));
    }
  }, [pendingFilters]);

  const handleClearAll = () => {
    const clearedFilters: PatientFiltersType = {
      search: "",
      status: [],
      tags: [],
      license_type: [],
      specialty: [],
      created_after: "",
      created_before: "",
      phone_prefix: "",
      exam_date_after: "",
      exam_date_before: "",
      renewal_date_after: "",
      renewal_date_before: "",
      page: 0,
      limit: 50,
      sortBy: "created_at",
      sortOrder: "desc" as const,
    };
    setPendingFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange({ ...pendingFilters });
  };

  const activeFiltersCount = [
    pendingFilters.search,
    pendingFilters.renewal_date_after,
    pendingFilters.renewal_date_before,
  ].filter((value) => value && value !== "").length;

  return (
    <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search patients..."
            value={pendingFilters.search || ""}
            onChange={(e) =>
              setPendingFilters({
                ...pendingFilters,
                search: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Expiry Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date Range
          </label>
          <DateRangePickerShadcn
            startDate={pendingFilters.renewal_date_after || ""}
            endDate={pendingFilters.renewal_date_before || ""}
            onStartDateChange={(date) =>
              setPendingFilters({
                ...pendingFilters,
                renewal_date_after: date,
              })
            }
            onEndDateChange={(date) =>
              setPendingFilters({
                ...pendingFilters,
                renewal_date_before: date,
              })
            }
            placeholder="Select expiry date range"
          />
        </div>
      </div>

      {/* Filter Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear All
          </button>
          <span className="text-sm text-gray-500">
            {activeFiltersCount} filters active
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
