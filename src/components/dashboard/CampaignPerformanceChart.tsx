"use client";

import { CampaignPerformanceData } from "@/hooks/useDashboardData";
import React from "react";

interface CampaignPerformanceChartProps {
  data?: CampaignPerformanceData[];
  timeRange?: {
    start: string;
    end: string;
    period: "7d" | "30d" | "90d" | "1y";
  };
}

/**
 * Campaign Performance Chart Component
 *
 * Displays campaign performance metrics over time with interactive charts
 * and responsive design for all screen sizes.
 */
export const CampaignPerformanceChart: React.FC<
  CampaignPerformanceChartProps
> = ({ data = [], timeRange }) => {
  const isLoading = !data || data.length === 0;

  // Mock data for demonstration
  const mockData = [
    {
      date: "2024-01-01",
      campaigns: 5,
      messagesSent: 1200,
      deliveryRate: 95,
      engagementRate: 12,
    },
    {
      date: "2024-01-02",
      campaigns: 7,
      messagesSent: 1800,
      deliveryRate: 97,
      engagementRate: 15,
    },
    {
      date: "2024-01-03",
      campaigns: 4,
      messagesSent: 900,
      deliveryRate: 94,
      engagementRate: 11,
    },
    {
      date: "2024-01-04",
      campaigns: 8,
      messagesSent: 2100,
      deliveryRate: 96,
      engagementRate: 18,
    },
    {
      date: "2024-01-05",
      campaigns: 6,
      messagesSent: 1500,
      deliveryRate: 95,
      engagementRate: 14,
    },
    {
      date: "2024-01-06",
      campaigns: 9,
      messagesSent: 2400,
      deliveryRate: 98,
      engagementRate: 20,
    },
    {
      date: "2024-01-07",
      campaigns: 3,
      messagesSent: 800,
      deliveryRate: 93,
      engagementRate: 9,
    },
  ];

  const chartData = isLoading ? mockData : data;

  const maxMessages = Math.max(...chartData.map((d) => d.messagesSent));
  const maxCampaigns = Math.max(...chartData.map((d) => d.campaigns));

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Campaign Performance
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {timeRange?.period === "7d"
              ? "Last 7 days"
              : timeRange?.period === "30d"
              ? "Last 30 days"
              : timeRange?.period === "90d"
              ? "Last 90 days"
              : "Last year"}
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
            Messages Sent
          </button>
          <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
            Delivery Rate
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <div className="h-64 flex items-end space-x-2">
          {chartData.map((item, index) => {
            const height = (item.messagesSent / maxMessages) * 100;
            const campaignHeight = (item.campaigns / maxCampaigns) * 60;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group"
              >
                {/* Messages Sent Bar */}
                <div className="w-full flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer relative"
                    style={{ height: `${height}%` }}
                    title={`${item.messagesSent} messages sent`}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.messagesSent} messages
                    </div>
                  </div>

                  {/* Campaign Count Indicator */}
                  <div
                    className="w-full bg-green-500 rounded-b hover:bg-green-600 transition-colors cursor-pointer"
                    style={{ height: `${campaignHeight}%` }}
                    title={`${item.campaigns} campaigns`}
                  >
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.campaigns} campaigns
                    </div>
                  </div>
                </div>

                {/* Date Label */}
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 text-center">
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Messages Sent
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Active Campaigns
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
            {chartData
              .reduce((sum, item) => sum + item.messagesSent, 0)
              .toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Messages
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
            {(
              chartData.reduce((sum, item) => sum + item.deliveryRate, 0) /
              chartData.length
            ).toFixed(1)}
            %
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Avg Delivery Rate
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
            {(
              chartData.reduce((sum, item) => sum + item.engagementRate, 0) /
              chartData.length
            ).toFixed(1)}
            %
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Avg Engagement
          </div>
        </div>
      </div>
    </div>
  );
};
