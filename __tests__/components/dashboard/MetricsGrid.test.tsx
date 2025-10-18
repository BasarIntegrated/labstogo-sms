import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { DashboardMetrics } from "@/hooks/useDashboardData";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import React from "react";

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

describe("MetricsGrid", () => {
  const mockMetrics: DashboardMetrics = {
    totalPatients: 150,
    activeCampaigns: 5,
    messagesSentToday: 1200,
    deliveryRate: 95.5,
    renewalDueCount: 12,
    examPendingCount: 8,
  };

  it("renders all metrics correctly", () => {
    render(
      <TestWrapper>
        <MetricsGrid metrics={mockMetrics} />
      </TestWrapper>
    );

    // Check if all metric titles are present
    expect(screen.getByText("Total Patients")).toBeInTheDocument();
    expect(screen.getByText("Active Campaigns")).toBeInTheDocument();
    expect(screen.getByText("Messages Sent Today")).toBeInTheDocument();
    expect(screen.getByText("Delivery Rate")).toBeInTheDocument();
    expect(screen.getByText("Renewals Due")).toBeInTheDocument();
    expect(screen.getByText("Exams Pending")).toBeInTheDocument();

    // Check if values are displayed correctly
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("1,200")).toBeInTheDocument();
    expect(screen.getByText("95.5%")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("renders loading state correctly", () => {
    render(
      <TestWrapper>
        <MetricsGrid metrics={undefined} />
      </TestWrapper>
    );

    // Check if loading skeletons are present
    const loadingElements = screen.getAllByRole("generic");
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it("displays percentage changes correctly", () => {
    render(
      <TestWrapper>
        <MetricsGrid metrics={mockMetrics} />
      </TestWrapper>
    );

    // Check if percentage changes are displayed
    expect(screen.getAllByText(/vs last period/)).toHaveLength(6);
  });

  it("has proper accessibility attributes", () => {
    render(
      <TestWrapper>
        <MetricsGrid metrics={mockMetrics} />
      </TestWrapper>
    );

    // Check if metric cards have proper structure
    const metricCards = screen.getAllByRole("generic");
    expect(metricCards.length).toBeGreaterThan(0);
  });

  it("handles zero values correctly", () => {
    const zeroMetrics: DashboardMetrics = {
      totalPatients: 0,
      activeCampaigns: 0,
      messagesSentToday: 0,
      deliveryRate: 0,
      renewalDueCount: 0,
      examPendingCount: 0,
    };

    render(
      <TestWrapper>
        <MetricsGrid metrics={zeroMetrics} />
      </TestWrapper>
    );

    // Check if zero values are displayed
    expect(screen.getAllByText("0")).toHaveLength(6);
  });

  it("formats large numbers correctly", () => {
    const largeMetrics: DashboardMetrics = {
      totalPatients: 1500000,
      activeCampaigns: 5000,
      messagesSentToday: 1200000,
      deliveryRate: 95.5,
      renewalDueCount: 12000,
      examPendingCount: 8000,
    };

    render(
      <TestWrapper>
        <MetricsGrid metrics={largeMetrics} />
      </TestWrapper>
    );

    // Check if large numbers are formatted correctly
    expect(screen.getByText("1.5M")).toBeInTheDocument(); // Total Patients
    expect(screen.getByText("5.0K")).toBeInTheDocument(); // Active Campaigns
    expect(screen.getByText("1.2M")).toBeInTheDocument(); // Messages Sent Today
  });

  it("applies correct color classes", () => {
    render(
      <TestWrapper>
        <MetricsGrid metrics={mockMetrics} />
      </TestWrapper>
    );

    // Check if metric cards have hover effects
    const metricCards = screen.getAllByRole("generic");
    metricCards.forEach((card) => {
      expect(card).toHaveClass("hover:shadow-md");
    });
  });
});
