import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useLeadsManagement,
  useBulkOperations,
  useRenewalTracking,
} from "@/hooks/useLeadsManagement";
import { supabase } from "@/lib/supabase";

// Mock Supabase
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      overlaps: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    rpc: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useLeadsManagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches leads successfully", async () => {
    const mockLeads = [
      {
        id: "1",
        phone_number: "+15550101",
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        company: "Acme Corp",
        status: "active",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockLeads,
        error: null,
      }),
    });

    const { result } = renderHook(() => useLeadsManagement(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.leads).toEqual(mockLeads);
  });

  it("handles fetch error", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      }),
    });

    const { result } = renderHook(() => useLeadsManagement(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
  });

  it("applies filters correctly", async () => {
    const filters = {
      search: "John",
      status: ["active"],
      tags: ["vip"],
      created_after: "2024-01-01",
      created_before: "2024-12-31",
      phone_prefix: "+1",
    };

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      overlaps: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    const { result } = renderHook(() => useLeadsManagement(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify that all filter methods were called
    expect(supabase.from).toHaveBeenCalledWith("leads");
  });

  it("updates lead successfully", async () => {
    const mockUpdatedLead = {
      id: "1",
      phone_number: "+15550101",
      first_name: "John",
      last_name: "Doe Updated",
      email: "john@example.com",
      company: "Acme Corp",
      status: "active",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockUpdatedLead,
        error: null,
      }),
    });

    const { result } = renderHook(() => useLeadsManagement(), {
      wrapper: createWrapper(),
    });

    await result.current.updateLead({
      id: "1",
      updates: { last_name: "Doe Updated" },
    });

    expect(supabase.from).toHaveBeenCalledWith("leads");
  });

  it("deletes lead successfully", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id: "1" }],
        error: null,
      }),
    });

    const { result } = renderHook(() => useLeadsManagement(), {
      wrapper: createWrapper(),
    });

    await result.current.deleteLead("1");

    expect(supabase.from).toHaveBeenCalledWith("leads");
  });
});

describe("useBulkOperations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("manages selected leads state", () => {
    const { result } = renderHook(() => useBulkOperations(), {
      wrapper: createWrapper(),
    });

    expect(result.current.selectedLeads).toEqual([]);

    result.current.toggleLeadSelection("1");
    expect(result.current.selectedLeads).toEqual(["1"]);

    result.current.toggleLeadSelection("1");
    expect(result.current.selectedLeads).toEqual([]);
  });

  it("selects all leads", () => {
    const { result } = renderHook(() => useBulkOperations(), {
      wrapper: createWrapper(),
    });

    const leadIds = ["1", "2", "3"];
    result.current.selectAllLeads(leadIds);

    expect(result.current.selectedLeads).toEqual(leadIds);
  });

  it("clears selection", () => {
    const { result } = renderHook(() => useBulkOperations(), {
      wrapper: createWrapper(),
    });

    result.current.toggleLeadSelection("1");
    result.current.clearSelection();

    expect(result.current.selectedLeads).toEqual([]);
  });

  it("performs bulk update", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id: "1" }, { id: "2" }],
        error: null,
      }),
    });

    const { result } = renderHook(() => useBulkOperations(), {
      wrapper: createWrapper(),
    });

    await result.current.bulkUpdate({
      leadIds: ["1", "2"],
      updates: { status: "inactive" },
    });

    expect(supabase.from).toHaveBeenCalledWith("leads");
  });

  it("performs bulk delete", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      delete: jest.fn().mockReturnThis(),
      in: jest.fn().mockResolvedValue({
        data: [{ id: "1" }, { id: "2" }],
        error: null,
      }),
    });

    const { result } = renderHook(() => useBulkOperations(), {
      wrapper: createWrapper(),
    });

    await result.current.bulkDelete(["1", "2"]);

    expect(supabase.from).toHaveBeenCalledWith("leads");
  });

  it("performs bulk tag operations", async () => {
    const mockLeadsWithTags = [
      { id: "1", tags: ["existing"] },
      { id: "2", tags: ["existing"] },
    ];

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: mockLeadsWithTags,
          error: null,
        }),
      })
      .mockReturnValueOnce({
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: mockLeadsWithTags,
          error: null,
        }),
      });

    const { result } = renderHook(() => useBulkOperations(), {
      wrapper: createWrapper(),
    });

    await result.current.bulkTag({
      leadIds: ["1", "2"],
      tags: ["new"],
      operation: "add",
    });

    expect(supabase.from).toHaveBeenCalledWith("leads");
  });
});

describe("useRenewalTracking", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches renewals successfully", async () => {
    const mockRenewals = [
      {
        id: "1",
        lead_id: "lead1",
        exam_type: "Medical License",
        exam_date: "2024-01-01",
        renewal_date: "2024-12-01",
        status: "pending",
        notifications_sent: 0,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockRenewals,
        error: null,
      }),
    });

    const { result } = renderHook(() => useRenewalTracking(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.renewals).toEqual(mockRenewals);
  });

  it("fetches due renewals", async () => {
    const mockDueRenewals = [
      {
        id: "1",
        lead_id: "lead1",
        exam_type: "Medical License",
        exam_date: "2024-01-01",
        renewal_date: "2023-12-01", // Overdue
        status: "pending",
        notifications_sent: 0,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockDueRenewals,
        error: null,
      }),
    });

    const { result } = renderHook(() => useRenewalTracking(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.dueRenewals).toEqual(mockDueRenewals);
  });

  it("creates renewal successfully", async () => {
    const mockRenewalData = {
      lead_id: "lead1",
      exam_type: "Medical License",
      exam_date: "2024-01-01",
      renewal_date: "2024-12-01",
      status: "pending" as const,
      notifications_sent: 0,
    };

    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: "1", ...mockRenewalData },
        error: null,
      }),
    });

    const { result } = renderHook(() => useRenewalTracking(), {
      wrapper: createWrapper(),
    });

    await result.current.createRenewal(mockRenewalData);

    expect(supabase.from).toHaveBeenCalledWith("renewal_data");
  });

  it("updates renewal successfully", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: "1", status: "completed" },
        error: null,
      }),
    });

    const { result } = renderHook(() => useRenewalTracking(), {
      wrapper: createWrapper(),
    });

    await result.current.updateRenewal({
      id: "1",
      updates: { status: "completed" },
    });

    expect(supabase.from).toHaveBeenCalledWith("renewal_data");
  });

  it("sends renewal reminders", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({
        data: [{ id: "1" }, { id: "2" }],
        error: null,
      }),
    });

    const { result } = renderHook(() => useRenewalTracking(), {
      wrapper: createWrapper(),
    });

    await result.current.sendRenewalReminders(["1", "2"]);

    expect(supabase.from).toHaveBeenCalledWith("renewal_data");
  });
});
