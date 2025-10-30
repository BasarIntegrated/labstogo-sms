"use client";

import { PatientEngagementData } from "@/hooks/useDashboardData";
import React from "react";

interface PatientEngagementChartProps {
  data?: PatientEngagementData[];
  timeRange?: {
    start: string;
    end: string;
    period: "7d" | "30d" | "90d" | "1y";
  };
}

/**
 * Patient Engagement Chart Component
 *
 * Displays patient engagement metrics with interactive charts showing
 * new patients, active patients, renewals, and expirations over time.
 */
export const PatientEngagementChart: React.FC<PatientEngagementChartProps> = ({
  data = [],
  timeRange,
}) => {
  const isLoading = !data || data.length === 0;

  // Mock data for demonstration
  const mockData = [
    {
      date: "2024-01-01",
      newPatients: 25,
      activePatients: 150,
      renewedPatients: 8,
      expiredPatients: 3,
    },
    {
      date: "2024-01-02",
      newPatients: 32,
      activePatients: 155,
      renewedPatients: 12,
      expiredPatients: 2,
    },
    {
      date: "2024-01-03",
      newPatients: 18,
      activePatients: 148,
      renewedPatients: 6,
      expiredPatients: 5,
    },
    {
      date: "2024-01-04",
      newPatients: 28,
      activePatients: 162,
      renewedPatients: 15,
      expiredPatients: 1,
    },
    {
      date: "2024-01-05",
      newPatients: 35,
      activePatients: 168,
      renewedPatients: 9,
      expiredPatients: 4,
    },
    {
      date: "2024-01-06",
      newPatients: 22,
      activePatients: 165,
      renewedPatients: 11,
      expiredPatients: 2,
    },
    {
      date: "2024-01-07",
      newPatients: 29,
      activePatients: 172,
      renewedPatients: 7,
      expiredPatients: 3,
    },
  ];

  const chartData = isLoading ? mockData : data;

  const maxPatients = Math.max(
    ...chartData.map((d) =>
      Math.max(
        d.newPatients,
        d.activePatients,
        d.renewedPatients,
        d.expiredPatients
      )
    )
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900text-white">
            Patient Engagement
          </h3>
          <p className="text-sm text-gray-600">
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
          <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
            New Patients
          </button>
          <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
            Renewals
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <div className="h-64 flex items-end space-x-1">
          {chartData.map((item, index) => {
            const newPatientsHeight = (item.newPatients / maxPatients) * 100;
            const activePatientsHeight =
              (item.activePatients / maxPatients) * 100;
            const renewedPatientsHeight =
              (item.renewedPatients / maxPatients) * 100;
            const expiredPatientsHeight =
              (item.expiredPatients / maxPatients) * 100;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group"
              >
                <div className="w-full flex flex-col items-end space-y-0.5">
                  {/* New Patients */}
                  <div
                    className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors cursor-pointer relative"
                    style={{ height: `${newPatientsHeight}%` }}
                    title={`${item.newPatients} new patients`}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.newPatients} new
                    </div>
                  </div>

                  {/* Active Patients */}
                  <div
                    className="w-full bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer relative"
                    style={{ height: `${activePatientsHeight}%` }}
                    title={`${item.activePatients} active patients`}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.activePatients} active
                    </div>
                  </div>

                  {/* Renewed Patients */}
                  <div
                    className="w-full bg-purple-500 hover:bg-purple-600 transition-colors cursor-pointer relative"
                    style={{ height: `${renewedPatientsHeight}%` }}
                    title={`${item.renewedPatients} renewed patients`}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.renewedPatients} renewed
                    </div>
                  </div>

                  {/* Expired Patients */}
                  <div
                    className="w-full bg-red-500 rounded-b hover:bg-red-600 transition-colors cursor-pointer relative"
                    style={{ height: `${expiredPatientsHeight}%` }}
                    title={`${item.expiredPatients} expired patients`}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.expiredPatients} expired
                    </div>
                  </div>
                </div>

                {/* Date Label */}
                <div className="mt-2 text-xs text-gray-600 text-center">
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
      <div className="mt-6 flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">
            New Patients
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600">Active</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span className="text-sm text-gray-600">Renewed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-600">Expired</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900text-white">
            {chartData.reduce((sum, item) => sum + item.newPatients, 0)}
          </div>
          <div className="text-sm text-gray-600">
            Total New Patients
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-900text-white">
            {chartData.reduce((sum, item) => sum + item.renewedPatients, 0)}
          </div>
          <div className="text-sm text-gray-600">
            Total Renewals
          </div>
        </div>
      </div>
    </div>
  );
};
