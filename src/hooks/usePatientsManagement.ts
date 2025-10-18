"use client";

import { supabase } from "@/lib/supabase";
import { Patient, PatientFilters, PatientSegment, RenewalData } from "@/types/database";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

// Patient Management Hook
export function usePatientsManagement(filters: PatientFilters = {}) {
  const queryClient = useQueryClient();

  const {
    data: patientsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["patients", filters],
    queryFn: async () => {
      let query = supabase.from("patients").select("*");

      // Apply filters
      if (filters.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
        );
      }

      if (filters.status && filters.status.length > 0) {
        query = query.in("status", filters.status);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps("tags", filters.tags);
      }

      if (filters.created_after) {
        query = query.gte("created_at", filters.created_after);
      }

      if (filters.created_before) {
        query = query.lte("created_at", filters.created_before);
      }

      if (filters.phone_prefix) {
        query = query.like("phone_number", `${filters.phone_prefix}%`);
      }

      if (filters.license_type && filters.license_type.length > 0) {
        query = query.in("license_type", filters.license_type);
      }

      if (filters.specialty && filters.specialty.length > 0) {
        query = query.in("specialty", filters.specialty);
      }

      if (filters.exam_date_after) {
        query = query.gte("exam_date", filters.exam_date_after);
      }

      if (filters.exam_date_before) {
        query = query.lte("exam_date", filters.exam_date_before);
      }

      if (filters.renewal_date_after) {
        query = query.gte("expires", filters.renewal_date_after);
      }

      if (filters.renewal_date_before) {
        query = query.lte("expires", filters.renewal_date_before);
      }

      // Apply pagination
      const from = (filters.page || 0) * (filters.limit || 50);
      const to = from + (filters.limit || 50) - 1;
      query = query.range(from, to);

      // Apply sorting
      const sortBy = filters.sortBy || "created_at";
      const sortOrder = filters.sortOrder || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      const { data, error } = await query;

      if (error) throw error;

      // Get total count for pagination
      const { count } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true });

      return {
        patients: data || [],
        total: count || 0,
        page: filters.page || 0,
        limit: filters.limit || 50,
      };
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Patient>;
    }) => {
      const { data, error } = await supabase
        .from("patients")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  const deletePatientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("patients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  return {
    patients: patientsData?.patients || [],
    total: patientsData?.total || 0,
    isLoading,
    error,
    refetch,
    updatePatient: updatePatientMutation.mutateAsync,
    deletePatient: deletePatientMutation.mutateAsync,
    isUpdating: updatePatientMutation.isPending,
    isDeleting: deletePatientMutation.isPending,
  };
}

// Bulk Operations Hook
export function useBulkOperations() {
  const queryClient = useQueryClient();
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({
      patientIds,
      updates,
    }: {
      patientIds: string[];
      updates: Partial<Patient>;
    }) => {
      const { data, error } = await supabase
        .from("patients")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .in("id", patientIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setSelectedPatients([]);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (patientIds: string[]) => {
      const { error } = await supabase
        .from("patients")
        .delete()
        .in("id", patientIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setSelectedPatients([]);
    },
  });

  const bulkTagMutation = useMutation({
    mutationFn: async ({
      patientIds,
      tags,
      operation,
    }: {
      patientIds: string[];
      tags: string[];
      operation: "add" | "remove" | "replace";
    }) => {
      // Get current patients with tags
      const { data: currentPatients, error: fetchError } = await supabase
        .from("patients")
        .select("id, tags")
        .in("id", patientIds);

      if (fetchError) throw fetchError;

      // Update tags based on operation
      const updates = currentPatients?.map((patient) => {
        let newTags = patient.tags || [];

        switch (operation) {
          case "add":
            newTags = [...new Set([...newTags, ...tags])];
            break;
          case "remove":
            newTags = newTags.filter((tag) => !tags.includes(tag));
            break;
          case "replace":
            newTags = tags;
            break;
        }

        return {
          id: patient.id,
          tags: newTags,
          updated_at: new Date().toISOString(),
        };
      });

      if (!updates) return [];

      const { data, error } = await supabase
        .from("patients")
        .upsert(updates)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setSelectedPatients([]);
    },
  });

  const togglePatientSelection = useCallback((patientId: string) => {
    setSelectedPatients((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  }, []);

  const selectAllPatients = useCallback((patientIds: string[]) => {
    setSelectedPatients(patientIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPatients([]);
  }, []);

  return {
    selectedPatients,
    togglePatientSelection,
    selectAllPatients,
    clearSelection,
    bulkUpdate: bulkUpdateMutation.mutateAsync,
    bulkDelete: bulkDeleteMutation.mutateAsync,
    bulkTag: bulkTagMutation.mutateAsync,
    isBulkUpdating: bulkUpdateMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isBulkTagging: bulkTagMutation.isPending,
  };
}

// Renewal Tracking Hook
export function useRenewalTracking() {
  const queryClient = useQueryClient();

  const {
    data: renewalsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["renewals"],
    queryFn: async () => {
      const { data, error } = await supabase
        // .from("renewal_data") // DISABLED: Table does not exist
        .select(
          `
          *,
          leads (
            id,
            first_name,
            last_name,
            phone_number,
            email
          )
        `
        )
        .order("renewal_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: dueRenewals } = useQuery({
    queryKey: ["renewals", "due"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        // .from("renewal_data") // DISABLED: Table does not exist
        .select(
          `
          *,
          leads (
            id,
            first_name,
            last_name,
            phone_number,
            email
          )
        `
        )
        .lte("renewal_date", today)
        .eq("status", "pending")
        .order("renewal_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const createRenewalMutation = useMutation({
    mutationFn: async (
      renewalData: Omit<RenewalData, "id" | "created_at" | "updated_at">
    ) => {
      const { data, error } = await supabase
        // .from("renewal_data") // DISABLED: Table does not exist
        .insert(renewalData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renewals"] });
    },
  });

  const updateRenewalMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<RenewalData>;
    }) => {
      const { data, error } = await supabase
        // .from("renewal_data") // DISABLED: Table does not exist
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renewals"] });
    },
  });

  const sendRenewalRemindersMutation = useMutation({
    mutationFn: async (renewalIds: string[]) => {
      // This would integrate with your SMS service
      // For now, we'll just update the last_reminder timestamp
      const { data, error } = await supabase
        // .from("renewal_data") // DISABLED: Table does not exist
        .update({
          last_reminder: new Date().toISOString(),
          notifications_sent: supabase.rpc("increment_notifications_sent"),
        })
        .in("id", renewalIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renewals"] });
    },
  });

  return {
    renewals: renewalsData || [],
    dueRenewals: dueRenewals || [],
    isLoading,
    error,
    createRenewal: createRenewalMutation.mutateAsync,
    updateRenewal: updateRenewalMutation.mutateAsync,
    sendRenewalReminders: sendRenewalRemindersMutation.mutateAsync,
    isCreating: createRenewalMutation.isPending,
    isUpdating: updateRenewalMutation.isPending,
    isSendingReminders: sendRenewalRemindersMutation.isPending,
  };
}

// Patient Segmentation Hook
export function usePatientSegmentation() {
  const queryClient = useQueryClient();

  const {
    data: segments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["segments"],
    queryFn: async () => {
      const { data, error } = await supabase
        // .from("patient_segments") // DISABLED: Table does not exist
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const createSegmentMutation = useMutation({
    mutationFn: async (
      segment: Omit<PatientSegment, "id" | "created_at" | "updated_at">
    ) => {
      const { data, error } = await supabase
        // .from("patient_segments") // DISABLED: Table does not exist
        .insert(segment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
    },
  });

  const updateSegmentMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<PatientSegment>;
    }) => {
      const { data, error } = await supabase
        // .from("patient_segments") // DISABLED: Table does not exist
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
    },
  });

  const deleteSegmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        // .from("patient_segments") // DISABLED: Table does not exist
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
    },
  });

  return {
    segments: segments || [],
    isLoading,
    error,
    createSegment: createSegmentMutation.mutateAsync,
    updateSegment: updateSegmentMutation.mutateAsync,
    deleteSegment: deleteSegmentMutation.mutateAsync,
    isCreating: createSegmentMutation.isPending,
    isUpdating: updateSegmentMutation.isPending,
    isDeleting: deleteSegmentMutation.isPending,
  };
}

// Patient Analytics Hook
export function usePatientAnalytics() {
  const {
    data: analyticsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["patients", "analytics"],
    queryFn: async () => {
      // Get patient counts by status
      const { data: statusCounts, error: statusError } = await supabase
        .from("patients")
        .select("status")
        .then(({ data }) => {
          const counts = data?.reduce((acc, patient) => {
            acc[patient.status] = (acc[patient.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return { data: counts, error: null };
        });

      if (statusError) throw statusError;

      // Get patients created over time (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: timeSeriesData, error: timeError } = await supabase
        .from("patients")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (timeError) throw timeError;

      // Process time series data
      const dailyCounts = timeSeriesData?.reduce((acc, patient) => {
        const date = patient.created_at.split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get renewal analytics
      const { data: renewalData, error: renewalError } = await supabase
        // .from("renewal_data") // DISABLED: Table does not exist
        .select("status, renewal_date");

      if (renewalError) throw renewalError;

      const renewalCounts = renewalData?.reduce((acc, renewal) => {
        acc[renewal.status] = (acc[renewal.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        statusCounts: statusCounts || {},
        dailyCounts: dailyCounts || {},
        renewalCounts: renewalCounts || {},
        totalPatients: timeSeriesData?.length || 0,
      };
    },
  });

  return {
    analytics: analyticsData,
    isLoading,
    error,
  };
}

// Note: PatientFilters type is imported from @/types/database
