"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DeliveryStatusChart } from "@/components/dashboard/DeliveryStatusChart";
import { MessagesTimelineChart } from "@/components/dashboard/MessagesTimelineChart";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { RecentCampaignsTable } from "@/components/dashboard/RecentCampaignsTable";
import { RecentMessagesTable } from "@/components/dashboard/RecentMessagesTable";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Main Dashboard Page Component
 *
 * Provides comprehensive analytics and insights with real-time data updates.
 * Features 4 metric cards, 2 charts, and 2 activity tables with 30-second auto-refresh.
 */
export default function DashboardPage() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    // Invalidate all dashboard queries to refetch data
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    queryClient.invalidateQueries({ queryKey: ["messages-timeline"] });
    queryClient.invalidateQueries({ queryKey: ["delivery-status"] });
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["recent-messages"] });
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <DashboardHeader
        lastUpdated={new Date()}
        onRefresh={handleRefresh}
        isLoading={false}
      />

      {/* Main Dashboard Content */}
      <div className="space-y-6">
        {/* 4 Metric Cards */}
        <MetricsGrid />

        {/* 2 Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Messages Timeline Chart - 75% */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow">
            <MessagesTimelineChart />
          </div>

          {/* Delivery Status Chart - 25% */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow">
            <DeliveryStatusChart />
          </div>
        </div>

        {/* 2 Activity Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Campaigns Table */}
          <div>
            <RecentCampaignsTable />
          </div>

          {/* Recent Messages Table */}
          <div>
            <RecentMessagesTable />
          </div>
        </div>
      </div>
    </div>
  );
}
