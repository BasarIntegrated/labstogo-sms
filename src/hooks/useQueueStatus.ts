import { QueueStatus } from "@/types/queue";
import { useQuery } from "@tanstack/react-query";

export function useQueueStatus() {
  return useQuery<QueueStatus>({
    queryKey: ["queue-status"],
    queryFn: async (): Promise<QueueStatus> => {
      const response = await fetch("/api/queue/status");
      if (!response.ok) {
        throw new Error("Failed to fetch queue status");
      }
      return response.json();
    },
    // Smart refetching - only when window is focused and user is active
    refetchInterval: (data, query) => {
      // Don't refetch if there are no active jobs
      const hasActiveJobs =
        data?.smsQueue?.active > 0 || data?.campaignQueue?.active > 0;
      return hasActiveJobs ? 10000 : 30000; // 10s if active, 30s if idle
    },
    // Keep data fresh for 5 seconds
    staleTime: 5000,
    // Retry on failure
    retry: 2,
    // Only refetch when window is focused
    refetchOnWindowFocus: true,
  });
}
