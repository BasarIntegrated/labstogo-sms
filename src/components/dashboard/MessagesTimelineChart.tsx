"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";

interface TimelineData {
  date: string;
  sms: number;
  email: number;
}

/**
 * Messages Timeline Chart Component
 *
 * Displays SMS and Email messages sent over time (last 30 days)
 */
export const MessagesTimelineChart: React.FC = () => {
  const { data, isLoading, error } = useQuery<TimelineData[]>({
    queryKey: ["messages-timeline"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/messages-timeline");
      if (!response.ok) {
        throw new Error("Failed to fetch timeline data");
      }
      const result = await response.json();
      return result.data || [];
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 text-sm">Error loading timeline data</div>
      </div>
    );
  }

  // Toggle mock data for visual verification
  const USE_MOCK = false;
  const mockData: TimelineData[] = [
    { date: new Date().toISOString(), sms: 1, email: 0 },
    {
      date: new Date(Date.now() - 1 * 86400000).toISOString(),
      sms: 7,
      email: 0,
    },
    {
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      sms: 0,
      email: 25,
    },
    {
      date: new Date(Date.now() - 3 * 86400000).toISOString(),
      sms: 3,
      email: 4,
    },
    {
      date: new Date(Date.now() - 4 * 86400000).toISOString(),
      sms: 12,
      email: 6,
    },
  ];
  const rawData = USE_MOCK ? mockData : data || [];
  // Build last 30 days (today inclusive) and fill missing days with zeros
  const toDayKey = (d: Date) => d.toISOString().split("T")[0];
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const dayKeys: string[] = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(end);
    d.setDate(end.getDate() - (29 - i));
    return toDayKey(d);
  });
  const byKey: Record<string, { sms: number; email: number }> = {};
  for (const item of rawData) {
    const key = toDayKey(new Date(item.date));
    const prev = byKey[key] || { sms: 0, email: 0 };
    byKey[key] = {
      sms: prev.sms + (item.sms || 0),
      email: prev.email + (item.email || 0),
    };
  }
  const chartData = dayKeys.map((key) => ({
    date: new Date(key).toISOString(),
    sms: byKey[key]?.sms || 0,
    email: byKey[key]?.email || 0,
  }));
  // Use absolute maximum to preserve proportional differences (e.g., 1 vs 7 vs 25)
  const maxMessages = Math.max(
    ...chartData.map((d) => Math.max(d.sms, d.email)),
    1
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Messages Over Time
        </h3>
        <p className="text-sm text-gray-600">Last 30 days</p>
      </div>

      {/* Chart */}
      <div className="relative mb-8">
        <div className="h-72 flex items-end space-x-0.5 pb-6">
          {chartData.map((item, index) => {
            // Calculate heights with minimum visible height for non-zero values
            const smsRatio = maxMessages > 0 ? item.sms / maxMessages : 0;
            const emailRatio = maxMessages > 0 ? item.email / maxMessages : 0;
            // Linear scaling against absolute max
            const smsHeight = Math.min(100, Math.max(smsRatio * 100, 0));
            const emailHeight = Math.min(100, Math.max(emailRatio * 100, 0));

            return (
              <div
                key={index}
                className="flex-1 h-full flex flex-col items-center relative"
              >
                <div className="w-full h-full flex items-end justify-center space-x-0.5">
                  {/* SMS Bar - Independent hover group */}
                  <div className="flex-1 h-full flex flex-col justify-end items-center group/sms relative">
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer relative"
                      style={{
                        height: `${smsHeight}%`,
                        minHeight: item.sms > 0 ? "4px" : "0px",
                      }}
                      title={`SMS: ${item.sms}`}
                    >
                      <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/sms:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        - SMS: {item.sms}
                      </div>
                    </div>
                  </div>

                  {/* Email Bar - Independent hover group */}
                  <div className="flex-1 h-full flex flex-col justify-end items-center group/email relative">
                    <div
                      className="w-full bg-purple-500 rounded-t hover:bg-purple-600 transition-colors cursor-pointer relative"
                      style={{
                        height: `${emailHeight}%`,
                        minHeight: item.email > 0 ? "4px" : "0px",
                      }}
                      title={`Email: ${item.email}`}
                    >
                      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/email:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        - Email: {item.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Label - Show for all dates */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[9px] text-gray-500 text-center whitespace-nowrap w-full">
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
          <span className="text-sm text-gray-600">SMS</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span className="text-sm text-gray-600">Email</span>
        </div>
      </div>
    </div>
  );
};
