"use client";

import { CampaignPerformanceChart } from "@/components/dashboard/CampaignPerformanceChart";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ErrorBoundary } from "@/components/dashboard/ErrorBoundary";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { PatientEngagementChart } from "@/components/dashboard/PatientEngagementChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useDashboardData } from "@/hooks/useDashboardData";

/**
 * Main Dashboard Page Component
 *
 * Provides comprehensive analytics and insights for SMS campaigns,
 * patient management, and platform usage with real-time data updates.
 */
export default function DashboardPage() {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
    lastUpdated,
  } = useDashboardData();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorBoundary
        error={error}
        onRetry={refetch}
        title="Dashboard Error"
        message="Unable to load dashboard data. Please try again."
      />
    );
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <DashboardHeader
        lastUpdated={lastUpdated}
        onRefresh={refetch}
        isLoading={isLoading}
      />

      {/* Main Dashboard Content */}
      <div className="space-y-6">
        {/* Key Metrics Grid */}
        <MetricsGrid metrics={dashboardData?.metrics} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaign Performance Chart */}
          <div className="bg-white rounded-lg shadow">
            <CampaignPerformanceChart
              data={dashboardData?.campaignPerformance}
              timeRange={dashboardData?.timeRange}
            />
          </div>

          {/* Patient Engagement Chart */}
          <div className="bg-white rounded-lg shadow">
            <PatientEngagementChart
              data={dashboardData?.patientEngagement}
              timeRange={dashboardData?.timeRange}
            />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity
              activities={dashboardData?.recentActivity}
              onActivityClick={(activity) => {
                // Handle activity click navigation
                console.log("Activity clicked:", activity);
              }}
            />
          </div>

          {/* Quick Actions */}
          <div>
            <QuickActions
              onActionClick={(action) => {
                // Handle quick action clicks
                console.log("Quick action clicked:", action);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
