"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
} from "@/components/ui";
import {
  AlertTriangle,
  Bell,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Settings,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface RenewalDashboardProps {
  contactsCount: number;
  renewalDueCount: number;
  campaignsActive: number;
  messagesSentToday: number;
  upcomingRenewals: RenewalData[];
  recentCampaigns: Campaign[];
  renewalStats: RenewalStats;
}

interface RenewalData {
  id: string;
  contact_name: string;
  license_type: string;
  license_number: string;
  renewal_deadline: string;
  days_until_renewal: number;
  renewal_status: string;
}

interface Campaign {
  id: string;
  name: string;
  campaign_type: string;
  status: string;
  total_contacts: number;
  sent_count: number;
  delivered_count: number;
  created_at: string;
}

interface RenewalStats {
  totalRenewals: number;
  pendingRenewals: number;
  completedRenewals: number;
  overdueRenewals: number;
  renewalRate: number;
  avgDaysToRenewal: number;
}

const mockRenewalData: RenewalData[] = [
  {
    id: "1",
    contact_name: "Dr. John Smith",
    license_type: "Medical",
    license_number: "MD123456",
    renewal_deadline: "2024-02-15",
    days_until_renewal: 7,
    renewal_status: "pending",
  },
  {
    id: "2",
    contact_name: "Jane Doe, RN",
    license_type: "Nursing",
    license_number: "RN789012",
    renewal_deadline: "2024-02-20",
    days_until_renewal: 12,
    renewal_status: "pending",
  },
  {
    id: "3",
    contact_name: "Dr. Mike Johnson",
    license_type: "Medical",
    license_number: "MD456789",
    renewal_deadline: "2024-01-30",
    days_until_renewal: -2,
    renewal_status: "overdue",
  },
];

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Q1 Medical License Renewals",
    campaign_type: "renewal_reminder",
    status: "running",
    total_contacts: 150,
    sent_count: 120,
    delivered_count: 115,
    created_at: "2024-01-15",
  },
  {
    id: "2",
    name: "Urgent License Expirations",
    campaign_type: "renewal_reminder",
    status: "completed",
    total_contacts: 25,
    sent_count: 25,
    delivered_count: 23,
    created_at: "2024-01-10",
  },
];

const mockStats: RenewalStats = {
  totalRenewals: 500,
  pendingRenewals: 150,
  completedRenewals: 300,
  overdueRenewals: 50,
  renewalRate: 85.5,
  avgDaysToRenewal: 45,
};

export default function RenewalDashboard({
  contactsCount = 1250,
  renewalDueCount = 150,
  campaignsActive = 3,
  messagesSentToday = 45,
  upcomingRenewals = mockRenewalData,
  recentCampaigns = mockCampaigns,
  renewalStats = mockStats,
}: RenewalDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "campaigns"
  >("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (days: number) => {
    if (days < 0) return "text-red-600";
    if (days <= 7) return "text-orange-600";
    if (days <= 30) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Renewal Management
          </h1>
          <p className="text-gray-600">
            Track license renewals and manage SMS campaigns
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button>
            <MessageSquare className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contacts
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contactsCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignsActive}</div>
            <p className="text-xs text-muted-foreground">Running now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Messages Today
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messagesSentToday}</div>
            <p className="text-xs text-muted-foreground">+8% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      {/* Renewal Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Renewal Statistics</span>
            </CardTitle>
            <CardDescription>
              Overview of renewal status and performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {renewalStats.completedRenewals}
                </div>
                <div className="text-sm text-green-700">Completed</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {renewalStats.pendingRenewals}
                </div>
                <div className="text-sm text-yellow-700">Pending</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {renewalStats.overdueRenewals}
                </div>
                <div className="text-sm text-red-700">Overdue</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {renewalStats.renewalRate}%
                </div>
                <div className="text-sm text-blue-700">Success Rate</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Renewal Completion Rate</span>
                <span>{renewalStats.renewalRate}%</span>
              </div>
              <Progress value={renewalStats.renewalRate} className="h-2" />
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-700">
                Average Days to Renewal: {renewalStats.avgDaysToRenewal}
              </div>
              <div className="text-sm text-gray-600">
                Based on completed renewals this quarter
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Urgent Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Overdue Renewals
                </span>
              </div>
              <div className="text-lg font-bold text-red-600 mt-1">
                {renewalStats.overdueRenewals}
              </div>
              <div className="text-xs text-red-700">
                Require immediate attention
              </div>
            </div>

            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  Due This Week
                </span>
              </div>
              <div className="text-lg font-bold text-orange-600 mt-1">12</div>
              <div className="text-xs text-orange-700">
                Renewals expiring soon
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Campaigns Running
                </span>
              </div>
              <div className="text-lg font-bold text-blue-600 mt-1">
                {campaignsActive}
              </div>
              <div className="text-xs text-blue-700">
                Active renewal campaigns
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", label: "Overview", icon: FileText },
            { id: "campaigns", label: "Recent Campaigns", icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest renewal and campaign activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  action: "Campaign completed",
                  details: "Q1 Medical License Renewals",
                  time: "2 hours ago",
                  type: "success",
                },
                {
                  action: "Renewal reminder sent",
                  details: "Dr. John Smith - MD123456",
                  time: "4 hours ago",
                  type: "info",
                },
                {
                  action: "New campaign started",
                  details: "Urgent License Expirations",
                  time: "1 day ago",
                  type: "info",
                },
                {
                  action: "Renewal completed",
                  details: "Jane Doe, RN - RN789012",
                  time: "2 days ago",
                  type: "success",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "success"
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{activity.action}</div>
                    <div className="text-xs text-gray-600">
                      {activity.details}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common renewal management tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Create Renewal Campaign
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Renewal Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Campaign Templates
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "campaigns" && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Latest renewal reminder campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCampaigns.map((campaign) => (
                <div key={campaign.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-gray-600">
                        {campaign.campaign_type.replace("_", " ")} • Created{" "}
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Target</div>
                      <div className="font-medium">
                        {campaign.total_contacts}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Sent</div>
                      <div className="font-medium">{campaign.sent_count}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Delivered</div>
                      <div className="font-medium">
                        {campaign.delivered_count}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Delivery Rate</span>
                      <span>
                        {Math.round(
                          (campaign.delivered_count / campaign.sent_count) * 100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (campaign.delivered_count / campaign.sent_count) * 100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
