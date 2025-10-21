import {
  CampaignPerformanceData,
  DashboardMetrics,
  PatientEngagementData,
  RecentActivity,
} from "@/hooks/useDashboardData";

/**
 * Dashboard Utility Functions
 *
 * Provides data processing, formatting, and calculation utilities
 * for dashboard analytics and insights.
 */

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 100) / 100;
}

/**
 * Format large numbers with appropriate suffixes
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format currency values
 */
export function formatCurrency(
  value: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Format date ranges for display
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startStr = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const endStr = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startStr} - ${endStr}`;
}

/**
 * Calculate trend direction and strength
 */
export function calculateTrend(
  current: number,
  previous: number
): {
  direction: "up" | "down" | "stable";
  strength: "weak" | "moderate" | "strong";
  percentage: number;
} {
  const percentage = calculatePercentageChange(current, previous);
  const absPercentage = Math.abs(percentage);

  let direction: "up" | "down" | "stable";
  if (percentage > 5) direction = "up";
  else if (percentage < -5) direction = "down";
  else direction = "stable";

  let strength: "weak" | "moderate" | "strong";
  if (absPercentage < 10) strength = "weak";
  else if (absPercentage < 25) strength = "moderate";
  else strength = "strong";

  return { direction, strength, percentage };
}

/**
 * Process campaign performance data for charts
 */
export function processCampaignPerformanceData(
  data: CampaignPerformanceData[]
): {
  chartData: any[];
  summary: {
    totalCampaigns: number;
    totalMessages: number;
    averageDeliveryRate: number;
    averageEngagementRate: number;
  };
} {
  const chartData = data.map((item) => ({
    date: item.date,
    campaigns: item.campaigns,
    messagesSent: item.messagesSent,
    deliveryRate: item.deliveryRate,
    engagementRate: item.engagementRate,
  }));

  const summary = {
    totalCampaigns: data.reduce((sum, item) => sum + item.campaigns, 0),
    totalMessages: data.reduce((sum, item) => sum + item.messagesSent, 0),
    averageDeliveryRate:
      data.length > 0
        ? data.reduce((sum, item) => sum + item.deliveryRate, 0) / data.length
        : 0,
    averageEngagementRate:
      data.length > 0
        ? data.reduce((sum, item) => sum + item.engagementRate, 0) / data.length
        : 0,
  };

  return { chartData, summary };
}

/**
 * Process patient engagement data for charts
 */
export function processPatientEngagementData(data: PatientEngagementData[]): {
  chartData: any[];
  summary: {
    totalNewPatients: number;
    totalActivePatients: number;
    totalRenewedPatients: number;
    totalExpiredPatients: number;
    conversionRate: number;
  };
} {
  const chartData = data.map((item) => ({
    date: item.date,
    newPatients: item.newPatients,
    activePatients: item.activePatients,
    renewedPatients: item.renewedPatients,
    expiredPatients: item.expiredPatients,
  }));

  const totalNewPatients = data.reduce(
    (sum, item) => sum + item.newPatients,
    0
  );
  const totalRenewedPatients = data.reduce(
    (sum, item) => sum + item.renewedPatients,
    0
  );
  const totalActivePatients = data.reduce(
    (sum, item) => sum + item.activePatients,
    0
  );
  const totalExpiredPatients = data.reduce(
    (sum, item) => sum + item.expiredPatients,
    0
  );

  const summary = {
    totalNewPatients,
    totalActivePatients,
    totalRenewedPatients,
    totalExpiredPatients,
    conversionRate:
      totalNewPatients > 0
        ? (totalRenewedPatients / totalNewPatients) * 100
        : 0,
  };

  return { chartData, summary };
}

/**
 * Process dashboard metrics for display
 */
export function processDashboardMetrics(metrics: DashboardMetrics): {
  displayMetrics: Array<{
    label: string;
    value: string;
    change?: {
      value: number;
      type: "increase" | "decrease" | "neutral";
    };
    trend: ReturnType<typeof calculateTrend>;
  }>;
  insights: string[];
} {
  const displayMetrics = [
    {
      label: "Total Patients",
      value: formatNumber(metrics.totalPatients),
      trend: calculateTrend(metrics.totalPatients, metrics.totalPatients * 0.9), // Mock previous value
    },
    {
      label: "Active Campaigns",
      value: formatNumber(metrics.activeCampaigns),
      trend: calculateTrend(
        metrics.activeCampaigns,
        metrics.activeCampaigns * 0.85
      ),
    },
    {
      label: "Messages Sent Today",
      value: formatNumber(metrics.messagesSentToday),
      trend: calculateTrend(
        metrics.messagesSentToday,
        metrics.messagesSentToday * 0.8
      ),
    },
    {
      label: "Delivery Rate",
      value: formatPercentage(metrics.deliveryRate),
      trend: calculateTrend(metrics.deliveryRate, metrics.deliveryRate * 0.98),
    },
  ].map((metric) => ({
    ...metric,
    change: {
      value: Math.abs(metric.trend.percentage),
      type:
        metric.trend.direction === "up"
          ? ("increase" as const)
          : metric.trend.direction === "down"
          ? ("decrease" as const)
          : ("neutral" as const),
    },
  }));

  // Generate insights based on metrics
  const insights: string[] = [];

  if (metrics.deliveryRate > 95) {
    insights.push(
      "Excellent delivery rate! Your SMS campaigns are performing well."
    );
  } else if (metrics.deliveryRate < 90) {
    insights.push(
      "Delivery rate is below optimal. Consider reviewing your phone number lists."
    );
  }

  if (metrics.renewalDueCount > 10) {
    insights.push(
      `${metrics.renewalDueCount} renewals are due. Consider launching a renewal campaign.`
    );
  }

  if (metrics.activeCampaigns === 0) {
    insights.push(
      "No active campaigns. Create a new campaign to engage your patients."
    );
  }

  if (metrics.messagesSentToday > 100) {
    insights.push("High message volume today. Monitor delivery rates closely.");
  }

  return { displayMetrics, insights };
}

/**
 * Filter and sort recent activity
 */
export function processRecentActivity(
  activities: RecentActivity[],
  filters?: {
    type?: string;
    limit?: number;
    sortBy?: "timestamp" | "type" | "status";
  }
): RecentActivity[] {
  let filtered = [...activities];

  // Filter by type
  if (filters?.type) {
    filtered = filtered.filter((activity) => activity.type === filters.type);
  }

  // Sort
  if (filters?.sortBy === "timestamp") {
    filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } else if (filters?.sortBy === "type") {
    filtered.sort((a, b) => a.type.localeCompare(b.type));
  } else if (filters?.sortBy === "status") {
    filtered.sort((a, b) => a.status.localeCompare(b.status));
  }

  // Limit results
  if (filters?.limit) {
    filtered = filtered.slice(0, filters.limit);
  }

  return filtered;
}

/**
 * Calculate time-based aggregations
 */
export function aggregateDataByTimeframe(
  data: any[],
  timeframe: "hour" | "day" | "week" | "month",
  dateField: string = "created_at"
): any[] {
  const grouped: { [key: string]: any[] } = {};

  data.forEach((item) => {
    const date = new Date(item[dateField]);
    let key: string;

    switch (timeframe) {
      case "hour":
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
        break;
      case "day":
        key = date.toISOString().split("T")[0];
        break;
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        break;
      default:
        key = date.toISOString().split("T")[0];
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });

  return Object.entries(grouped).map(([key, items]) => ({
    timeframe: key,
    count: items.length,
    items,
  }));
}

/**
 * Validate dashboard filters
 */
export function validateDashboardFilters(filters: any): {
  isValid: boolean;
  errors: string[];
  validatedFilters: any;
} {
  const errors: string[] = [];
  const validatedFilters: any = {};

  // Validate timeRange
  const validTimeRanges = ["7d", "30d", "90d", "1y"];
  if (filters.timeRange && !validTimeRanges.includes(filters.timeRange)) {
    errors.push("Invalid time range. Must be one of: 7d, 30d, 90d, 1y");
  } else {
    validatedFilters.timeRange = filters.timeRange || "30d";
  }

  // Validate campaignType
  if (filters.campaignType && typeof filters.campaignType !== "string") {
    errors.push("Campaign type must be a string");
  } else if (filters.campaignType) {
    validatedFilters.campaignType = filters.campaignType;
  }

  // Validate licenseType
  if (filters.licenseType && typeof filters.licenseType !== "string") {
    errors.push("License type must be a string");
  } else if (filters.licenseType) {
    validatedFilters.licenseType = filters.licenseType;
  }

  // Validate specialty
  if (filters.specialty && typeof filters.specialty !== "string") {
    errors.push("Specialty must be a string");
  } else if (filters.specialty) {
    validatedFilters.specialty = filters.specialty;
  }

  return {
    isValid: errors.length === 0,
    errors,
    validatedFilters,
  };
}

/**
 * Generate dashboard export data
 */
export function generateDashboardExport(
  metrics: DashboardMetrics,
  campaignPerformance: CampaignPerformanceData[],
  patientEngagement: PatientEngagementData[],
  recentActivity: RecentActivity[]
): {
  csv: string;
  json: any;
} {
  // Generate CSV data
  const csvRows: string[] = [];

  // Metrics CSV
  csvRows.push("Metric,Value");
  csvRows.push(`Total Patients,${metrics.totalPatients}`);
  csvRows.push(`Active Campaigns,${metrics.activeCampaigns}`);
  csvRows.push(`Messages Sent Today,${metrics.messagesSentToday}`);
  csvRows.push(`Delivery Rate,${metrics.deliveryRate}%`);

  // Campaign Performance CSV
  csvRows.push("\nDate,Campaigns,Messages Sent,Delivery Rate,Engagement Rate");
  campaignPerformance.forEach((item) => {
    csvRows.push(
      `${item.date},${item.campaigns},${item.messagesSent},${item.deliveryRate}%,${item.engagementRate}%`
    );
  });

  // Patient Engagement CSV
  csvRows.push(
    "\nDate,New Patients,Active Patients,Renewed Patients,Expired Patients"
  );
  patientEngagement.forEach((item) => {
    csvRows.push(
      `${item.date},${item.newPatients},${item.activePatients},${item.renewedPatients},${item.expiredPatients}`
    );
  });

  const csv = csvRows.join("\n");

  // Generate JSON data
  const json = {
    exportDate: new Date().toISOString(),
    metrics,
    campaignPerformance,
    patientEngagement,
    recentActivity,
  };

  return { csv, json };
}
