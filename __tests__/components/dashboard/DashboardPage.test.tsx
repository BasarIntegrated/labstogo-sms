import DashboardPage from "@/app/dashboard/page";
import { useDashboardData } from "@/hooks/useDashboardData";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

// Mock the dashboard hook
jest.mock("@/hooks/useDashboardData");
const mockUseDashboardData = useDashboardData as jest.MockedFunction<
  typeof useDashboardData
>;

// Mock data
const mockDashboardData = {
  metrics: {
    totalPatients: 150,
    activeCampaigns: 5,
    messagesSentToday: 1200,
    deliveryRate: 95.5,
    renewalDueCount: 12,
    examPendingCount: 8,
  },
  campaignPerformance: [
    {
      date: "2024-01-01",
      campaigns: 3,
      messagesSent: 800,
      deliveryRate: 96,
      engagementRate: 15,
    },
    {
      date: "2024-01-02",
      campaigns: 5,
      messagesSent: 1200,
      deliveryRate: 94,
      engagementRate: 18,
    },
  ],
  leadEngagement: [
    {
      date: "2024-01-01",
      newLeads: 25,
      activeLeads: 120,
      renewedLeads: 8,
      expiredLeads: 3,
    },
    {
      date: "2024-01-02",
      newLeads: 30,
      activeLeads: 125,
      renewedLeads: 12,
      expiredLeads: 2,
    },
  ],
  recentActivity: [
    {
      id: "1",
      type: "campaign",
      title: "Test Campaign Started",
      description: "Campaign launched successfully",
      timestamp: new Date().toISOString(),
      status: "success",
      metadata: { campaignId: "test-1" },
    },
  ],
  timeRange: {
    start: "2024-01-01",
    end: "2024-01-02",
    period: "7d" as const,
  },
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state correctly", () => {
    mockUseDashboardData.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
      updateFilters: jest.fn(),
      lastUpdated: null,
      isFetching: false,
      filters: { timeRange: "30d" },
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    expect(screen.getByText("Loading dashboard data...")).toBeInTheDocument();
  });

  it("renders error state correctly", () => {
    const mockError = new Error("Failed to fetch data");
    const mockRefetch = jest.fn();

    mockUseDashboardData.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: mockRefetch,
      updateFilters: jest.fn(),
      lastUpdated: null,
      isFetching: false,
      filters: { timeRange: "30d" },
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    expect(screen.getByText("Dashboard Error")).toBeInTheDocument();
    expect(
      screen.getByText("Unable to load dashboard data. Please try again.")
    ).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("renders dashboard with data correctly", async () => {
    const mockRefetch = jest.fn();
    const mockLastUpdated = new Date();

    mockUseDashboardData.mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      updateFilters: jest.fn(),
      lastUpdated: mockLastUpdated,
      isFetching: false,
      filters: { timeRange: "30d" },
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    // Check if main elements are rendered
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Total Patients")).toBeInTheDocument();
    expect(screen.getByText("Active Campaigns")).toBeInTheDocument();
    expect(screen.getByText("Campaign Performance")).toBeInTheDocument();
    expect(screen.getByText("Lead Engagement")).toBeInTheDocument();
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();

    // Check if metrics are displayed
    expect(screen.getByText("150")).toBeInTheDocument(); // Total Patients
    expect(screen.getByText("5")).toBeInTheDocument(); // Active Campaigns
    expect(screen.getByText("1,200")).toBeInTheDocument(); // Messages Sent Today
  });

  it("handles refresh button click", async () => {
    const mockRefetch = jest.fn();
    const mockLastUpdated = new Date();

    mockUseDashboardData.mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      updateFilters: jest.fn(),
      lastUpdated: mockLastUpdated,
      isFetching: false,
      filters: { timeRange: "30d" },
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    const refreshButton = screen.getByText("Refresh");
    fireEvent.click(refreshButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("displays last updated time correctly", () => {
    const mockRefetch = jest.fn();
    const mockLastUpdated = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago

    mockUseDashboardData.mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      updateFilters: jest.fn(),
      lastUpdated: mockLastUpdated,
      isFetching: false,
      filters: { timeRange: "30d" },
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    expect(screen.getByText("Last updated:")).toBeInTheDocument();
    expect(screen.getByText("5m ago")).toBeInTheDocument();
  });

  it("handles quick action clicks", async () => {
    const mockRefetch = jest.fn();
    const mockLastUpdated = new Date();

    mockUseDashboardData.mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      updateFilters: jest.fn(),
      lastUpdated: mockLastUpdated,
      isFetching: false,
      filters: { timeRange: "30d" },
    });

    // Mock console.log to test action clicks
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    const createCampaignButton = screen.getByText("Create Campaign");
    fireEvent.click(createCampaignButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Quick action clicked:",
      "create-campaign"
    );

    consoleSpy.mockRestore();
  });

  it("handles activity clicks", async () => {
    const mockRefetch = jest.fn();
    const mockLastUpdated = new Date();

    mockUseDashboardData.mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      updateFilters: jest.fn(),
      lastUpdated: mockLastUpdated,
      isFetching: false,
      filters: { timeRange: "30d" },
    });

    // Mock console.log to test activity clicks
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    const activityItem = screen.getByText("Test Campaign Started");
    fireEvent.click(activityItem);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Activity clicked:",
      expect.any(Object)
    );

    consoleSpy.mockRestore();
  });

  it("shows loading state when fetching", () => {
    const mockRefetch = jest.fn();
    const mockLastUpdated = new Date();

    mockUseDashboardData.mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      updateFilters: jest.fn(),
      lastUpdated: mockLastUpdated,
      isFetching: true,
      filters: { timeRange: "30d" },
    });

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    );

    expect(screen.getByText("Refreshing...")).toBeInTheDocument();
  });
});
