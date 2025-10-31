"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";

interface DeliveryStatusData {
  delivered: number;
  failed: number;
  pending: number;
  total: number;
}

/**
 * Delivery Status Chart Component
 *
 * Displays message delivery status breakdown as a donut chart
 */
export const DeliveryStatusChart: React.FC = () => {
  const { data, isLoading, error } = useQuery<DeliveryStatusData>({
    queryKey: ["delivery-status"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/delivery-status");
      if (!response.ok) {
        throw new Error("Failed to fetch delivery status");
      }
      const result = await response.json();
      return result.data || { delivered: 0, failed: 0, pending: 0, total: 0 };
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-full w-64 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 text-sm">
          Error loading delivery status
        </div>
      </div>
    );
  }

  const { delivered, failed, pending, total } = data || {
    delivered: 0,
    failed: 0,
    pending: 0,
    total: 0,
  };

  // Calculate percentages
  const deliveredPct = total > 0 ? (delivered / total) * 100 : 0;
  const failedPct = total > 0 ? (failed / total) * 100 : 0;
  const pendingPct = total > 0 ? (pending / total) * 100 : 0;

  // Calculate angles for donut chart (using SVG approach)
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  // For SVG donut chart:
  // strokeDasharray="dash-length gap-length" creates a pattern
  // strokeDashoffset rotates the pattern
  const deliveredDash = (deliveredPct / 100) * circumference;
  const failedDash = (failedPct / 100) * circumference;
  const pendingDash = (pendingPct / 100) * circumference;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Delivery Status</h3>
        <p className="text-sm text-gray-600">Overall breakdown</p>
      </div>

      {/* Donut Chart */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="20"
            />
            {/* Delivered - Green, first segment from top (0% to deliveredPct%) */}
            {deliveredPct > 0 && (
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#10b981"
                strokeWidth="20"
                strokeDasharray={`${deliveredDash} ${
                  circumference - deliveredDash
                }`}
                strokeDashoffset={0}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            )}
            {/* Failed - Red, second segment after delivered */}
            {failedPct > 0 && (
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#ef4444"
                strokeWidth="20"
                strokeDasharray={`${failedDash} ${circumference - failedDash}`}
                strokeDashoffset={-deliveredDash}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            )}
            {/* Pending - Yellow, last segment */}
            {pendingPct > 0 && (
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="20"
                strokeDasharray={`${pendingDash} ${
                  circumference - pendingDash
                }`}
                strokeDashoffset={-(deliveredDash + failedDash)}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            )}
          </svg>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-gray-900">
              {total.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-xs text-gray-500 mt-1">
              {deliveredPct.toFixed(1)}% delivered
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Delivered</span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {delivered.toLocaleString()} ({deliveredPct.toFixed(1)}%)
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Failed</span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {failed.toLocaleString()} ({failedPct.toFixed(1)}%)
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {pending.toLocaleString()} ({pendingPct.toFixed(1)}%)
          </div>
        </div>
      </div>
    </div>
  );
};
