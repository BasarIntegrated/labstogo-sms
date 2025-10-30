"use client";

import React from "react";

/**
 * Loading Spinner Component
 *
 * Provides a centered loading spinner with accessibility features
 * and consistent styling across the dashboard.
 */
export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-sm text-gray-600">Loading dashboard data...</p>
      </div>
    </div>
  );
};
