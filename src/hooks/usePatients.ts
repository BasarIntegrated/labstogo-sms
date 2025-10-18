import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface PatientsFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export function usePatients(filters: PatientsFilters = {}) {
  return useQuery({
    queryKey: ["patients", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.status) params.append("status", filters.status);

      const response = await fetch(`/api/patients?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }
      return response.json();
    },
    staleTime: 30000, // 30 seconds
  });
}

export function useUploadPatients() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      strategy,
    }: {
      file: File;
      strategy: string;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("strategy", strategy);

      const response = await fetch("/api/patients/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload patients");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch patients data
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
