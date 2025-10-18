"use client";

import { Patient } from "@/types/database";
import {
  BarChart3,
  Calendar,
  CheckCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

interface AnalyticsWidgetsProps {
  patients: Patient[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function AnalyticsWidgets({
  patients,
  isLoading,
  onRefresh,
}: AnalyticsWidgetsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "7d" | "30d" | "90d" | "1y"
  >("30d");

  // Calculate analytics data
  const analytics = {
    totalPatients: patients.length,
    activePatients: patients.filter((p) => p.status === "active").length,
    renewalDue: patients.filter((p) => p.status === "renewal_due").length,
    examPending: patients.filter((p) => p.status === "exam_pending").length,

    // Status distribution
    statusDistribution: {
      active: patients.filter((p) => p.status === "active").length,
      inactive: patients.filter((p) => p.status === "inactive").length,
      renewal_due: patients.filter((p) => p.status === "renewal_due").length,
      exam_pending: patients.filter((p) => p.status === "exam_pending").length,
      unsubscribed: patients.filter((p) => p.status === "unsubscribed").length,
    },

    // License type distribution
    licenseTypeDistribution: patients.reduce((acc, patient) => {
      const type = patient.license_type || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),

    // Recent activity (mock data for now)
    recentActivity: [
      { date: "2024-01-15", count: 5 },
      { date: "2024-01-14", count: 3 },
      { date: "2024-01-13", count: 8 },
      { date: "2024-01-12", count: 2 },
      { date: "2024-01-11", count: 6 },
      { date: "2024-01-10", count: 4 },
      { date: "2024-01-09", count: 7 },
    ],
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    change,
  }: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    change?: string;
  }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {change && (
                  <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                    <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                    <span className="sr-only">Increased by</span>
                    {change}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const ChartCard = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white overflow-hidden shadow rounded-lg animate-pulse"
            >
              <div className="p-5">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Patient Analytics</h2>
        <div className="flex space-x-2">
          {(["7d", "30d", "90d", "1y"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                selectedPeriod === period
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={analytics.totalPatients}
          icon={Users}
          color="text-blue-600"
          change="+12%"
        />
        <StatCard
          title="Active Patients"
          value={analytics.activePatients}
          icon={Users}
          color="text-green-600"
          change="+8%"
        />
        <StatCard
          title="Renewal Due"
          value={analytics.renewalDue}
          icon={Calendar}
          color="text-yellow-600"
          change="+3%"
        />
        <StatCard
          title="Exam Pending"
          value={analytics.examPending}
          icon={BarChart3}
          color="text-purple-600"
          change="+15%"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <ChartCard title="Patient Status Distribution">
          <div className="space-y-3">
            {Object.entries(analytics.statusDistribution).map(
              ([status, count]) => {
                const percentage =
                  analytics.totalPatients > 0
                    ? Math.round((count / analytics.totalPatients) * 100)
                    : 0;
                return (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          status === "active"
                            ? "bg-green-500"
                            : status === "inactive"
                            ? "bg-gray-500"
                            : status === "renewal_due"
                            ? "bg-yellow-500"
                            : status === "exam_pending"
                            ? "bg-blue-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {count} ({percentage}%)
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </ChartCard>

        {/* License Type Distribution */}
        <ChartCard title="License Type Distribution">
          <div className="space-y-3">
            {Object.entries(analytics.licenseTypeDistribution).map(
              ([type, count]) => {
                const percentage =
                  analytics.totalPatients > 0
                    ? Math.round((count / analytics.totalPatients) * 100)
                    : 0;
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {type}
                    </span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-12 text-right">
                        {count} ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </ChartCard>

        {/* Recent Activity */}
        <ChartCard title="Recent Patient Activity">
          <div className="space-y-3">
            {analytics.recentActivity.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((item.count / 10) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Renewal Status Overview */}
        <ChartCard title="Renewal Status Overview">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">
                  Up to Date
                </span>
              </div>
              <span className="text-sm font-medium text-green-800">
                {analytics.activePatients}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800">
                  Renewal Due
                </span>
              </div>
              <span className="text-sm font-medium text-yellow-800">
                {analytics.renewalDue}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">
                  Exam Pending
                </span>
              </div>
              <span className="text-sm font-medium text-blue-800">
                {analytics.examPending}
              </span>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
