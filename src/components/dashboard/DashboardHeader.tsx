"use client";

import React from "react";

interface DashboardHeaderProps {
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  isLoading?: boolean;
}

/**
 * Dashboard Header Component
 *
 * Provides dashboard title, last updated timestamp, and refresh controls
 * with responsive design and accessibility features.
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  lastUpdated,
  onRefresh,
  isLoading = false,
}) => {
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return "Never updated";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening with your SMS campaigns.
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          {/* Last Updated */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">Last updated:</span>{" "}
            <span className="text-gray-700 dark:text-gray-300">
              {formatLastUpdated(lastUpdated ?? null)}
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>
    </div>
  );
};
