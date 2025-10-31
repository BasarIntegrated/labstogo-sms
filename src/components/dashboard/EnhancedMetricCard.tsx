"use client";

import React from "react";

interface EnhancedMetricCardProps {
  title: string;
  value: number | string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  subtitle?: string;
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "orange";
  icon?: React.ReactNode;
  loading?: boolean;
}

/**
 * Enhanced Metric Card Component
 *
 * Displays a metric with trend indicator and optional subtitle
 */
export const EnhancedMetricCard: React.FC<EnhancedMetricCardProps> = ({
  title,
  value,
  trend,
  subtitle,
  color = "blue",
  icon,
  loading = false,
}) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
            <div className="ml-4 flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        )}
        <div className={icon ? "ml-4" : ""}>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div className="flex items-center mt-1">
              <span
                className={`text-xs font-medium ${
                  trend.direction === "up"
                    ? "text-green-600"
                    : trend.direction === "down"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {trend.direction === "up"
                  ? "↑"
                  : trend.direction === "down"
                  ? "↓"
                  : "→"}{" "}
                {Math.abs(trend.value).toFixed(1)}%
              </span>
            </div>
          )}
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};
