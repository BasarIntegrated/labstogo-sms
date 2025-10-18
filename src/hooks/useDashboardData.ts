"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

// Types for dashboard data
export interface DashboardMetrics {
  totalPatients: number;
  activeCampaigns: number;
  messagesSentToday: number;
  deliveryRate: number;
  renewalDueCount: number;
  examPendingCount: number;
  totalRevenue?: number;
  conversionRate?: number;
}

export interface CampaignPerformanceData {
  date: string;
  campaigns: number;
  messagesSent: number;
  deliveryRate: number;
  engagementRate: number;
}

export interface PatientEngagementData {
  date: string;
  newPatients: number;
  activePatients: number;
  renewedPatients: number;
  expiredPatients: number;
}

export interface RecentActivity {
  id: string;
  type: "campaign" | "patient" | "renewal" | "system";
  title: string;
  description: string;
  timestamp: string;
  status: "success" | "warning" | "error" | "info";
  metadata?: Record<string, any>;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  campaignPerformance: CampaignPerformanceData[];
  patientEngagement: PatientEngagementData[];
  recentActivity: RecentActivity[];
  timeRange: {
    start: string;
    end: string;
    period: "7d" | "30d" | "90d" | "1y";
  };
  totalContacts: number;
  activeCampaigns: number;
  messagesSentToday: number;
  deliveryRate: number;
  performanceData: Array<{
    day: string;
    sent: number;
    delivered: number;
    failed: number;
  }>;
  campaigns: Array<{
    id: string;
    name: string;
    description?: string;
    status: string;
    total_patients?: number;
    sent_count?: number;
    created_at: string;
  }>;
}

export interface DashboardFilters {
  timeRange: "7d" | "30d" | "90d" | "1y";
  campaignType?: string;
  licenseType?: string;
  specialty?: string;
}

/**
 * Custom hook for managing dashboard data
 *
 * Provides real-time dashboard analytics with caching, error handling,
 * and automatic refresh capabilities.
 */
export const useDashboardData = (filters?: DashboardFilters) => {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Default filters
  const defaultFilters: DashboardFilters = {
    timeRange: "30d",
    ...filters,
  };

  // Fetch dashboard data
  const { data, isLoading, error, refetch, isFetching } =
    useQuery<DashboardData>({
      queryKey: ["dashboard", defaultFilters],
      queryFn: async () => {
        const response = await fetch("/api/dashboard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(defaultFilters),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch dashboard data: ${response.statusText}`
          );
        }

        const result = await response.json();
        setLastUpdated(new Date());
        return result.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 2 * 60 * 1000, // 2 minutes
      refetchIntervalInBackground: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

  // Manual refresh function
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Update filters and refetch
  const updateFilters = useCallback(
    async (newFilters: Partial<DashboardFilters>) => {
      const updatedFilters = { ...defaultFilters, ...newFilters };

      // Invalidate and refetch with new filters
      await queryClient.invalidateQueries({
        queryKey: ["dashboard", updatedFilters],
      });
    },
    [defaultFilters, queryClient]
  );

  // Prefetch related data
  useEffect(() => {
    // Prefetch campaign data
    queryClient.prefetchQuery({
      queryKey: ["campaigns"],
      queryFn: async () => {
        const response = await fetch("/api/campaigns");
        return response.json();
      },
    });

    // Prefetch patients data
    queryClient.prefetchQuery({
      queryKey: ["patients"],
      queryFn: async () => {
        const response = await fetch("/api/patients");
        return response.json();
      },
    });
  }, [queryClient]);

  // Real-time updates via WebSocket (if available)
  useEffect(() => {
    // This would connect to a WebSocket for real-time updates
    // For now, we'll use polling via the refetch interval
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refresh]);

  return {
    data,
    isLoading,
    error,
    refetch: refresh,
    updateFilters,
    lastUpdated,
    isFetching,
    filters: defaultFilters,
  };
};

/**
 * Hook for dashboard metrics with caching
 */
export const useDashboardMetrics = () => {
  return useQuery<DashboardMetrics>({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/metrics");
      if (!response.ok) {
        throw new Error("Failed to fetch metrics");
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for campaign performance data
 */
export const useCampaignPerformance = (timeRange: string = "30d") => {
  return useQuery<CampaignPerformanceData[]>({
    queryKey: ["campaign-performance", timeRange],
    queryFn: async () => {
      const response = await fetch(
        `/api/dashboard/campaign-performance?timeRange=${timeRange}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch campaign performance");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for patient engagement data
 */
export const usePatientEngagement = (timeRange: string = "30d") => {
  return useQuery<PatientEngagementData[]>({
    queryKey: ["patient-engagement", timeRange],
    queryFn: async () => {
      const response = await fetch(
        `/api/dashboard/patient-engagement?timeRange=${timeRange}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch patient engagement");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for recent activity
 */
export const useRecentActivity = (limit: number = 10) => {
  return useQuery<RecentActivity[]>({
    queryKey: ["recent-activity", limit],
    queryFn: async () => {
      const response = await fetch(
        `/api/dashboard/recent-activity?limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch recent activity");
      }
      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // 30 seconds
  });
};
