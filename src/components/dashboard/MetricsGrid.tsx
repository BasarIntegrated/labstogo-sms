"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import { EnhancedMetricCard } from "./EnhancedMetricCard";

/**
 * Metrics Grid Component
 *
 * Displays key performance indicators using real API data
 * with 30-second auto-refresh
 */
export const MetricsGrid: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 60000, // 1 minute
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Messages Sent Today */}
      <EnhancedMetricCard
        title="Messages Sent Today"
        value={data?.messagesToday?.total || 0}
        trend={
          data?.messagesToday?.change
            ? {
                value: Math.abs(data.messagesToday.change),
                direction:
                  data.messagesToday.change > 0
                    ? "up"
                    : data.messagesToday.change < 0
                    ? "down"
                    : "neutral",
              }
            : undefined
        }
        subtitle={`${data?.messagesToday?.sms || 0} SMS, ${
          data?.messagesToday?.email || 0
        } Email`}
        color="blue"
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        }
        loading={isLoading}
      />

      {/* Delivery Rate */}
      <EnhancedMetricCard
        title="Delivery Rate"
        value={`${(data?.deliveryRate?.overall || 0).toFixed(1)}%`}
        trend={
          data?.deliveryRate?.change !== undefined
            ? {
                value: Math.abs(data.deliveryRate.change),
                direction:
                  data.deliveryRate.change > 0
                    ? "up"
                    : data.deliveryRate.change < 0
                    ? "down"
                    : "neutral",
              }
            : undefined
        }
        subtitle="Last 7 days"
        color={
          (data?.deliveryRate?.overall || 0) >= 95
            ? "green"
            : (data?.deliveryRate?.overall || 0) >= 90
            ? "yellow"
            : "red"
        }
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        loading={isLoading}
      />

      {/* Active Campaigns */}
      <EnhancedMetricCard
        title="Active Campaigns"
        value={data?.activeCampaigns?.active || 0}
        subtitle={`${data?.activeCampaigns?.scheduled || 0} scheduled`}
        color="purple"
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.999 3.999 0 01-1.564-.317z"
            />
          </svg>
        }
        loading={isLoading}
      />

      {/* Total Contacts */}
      <EnhancedMetricCard
        title="Total Contacts"
        value={data?.contacts?.total || 0}
        subtitle={`${data?.contacts?.withEmail || 0} with email, ${
          data?.contacts?.withPhone || 0
        } with phone`}
        color="orange"
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        }
        loading={isLoading}
      />
    </div>
  );
};
