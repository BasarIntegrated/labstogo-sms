"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import {
  CheckCircle,
  MessageSquare,
  Plus,
  Send,
  Upload,
  Users,
} from "lucide-react";

export default function Dashboard() {
  // const [showCreateModal, setShowCreateModal] = useState(false);

  // Use React Query hooks
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useDashboardData();

  if (dashboardLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading dashboard
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {dashboardError.message}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: "Total Contacts",
      value: dashboardData?.totalContacts || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: undefined,
      changeType: undefined,
    },
    {
      name: "Active Campaigns",
      value: dashboardData?.activeCampaigns || 0,
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: undefined,
      changeType: undefined,
    },
    {
      name: "Messages Sent Today",
      value: dashboardData?.messagesSentToday || 0,
      icon: Send,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: undefined,
      changeType: undefined,
    },
    {
      name: "Delivery Rate",
      value: `${dashboardData?.deliveryRate || 0}%`,
      icon: CheckCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: undefined,
      changeType: undefined,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your Message Blasting App dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.change && (
                  <p
                    className={`text-xs ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change} from last month
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-4">
            <a
              href="/contacts"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Contacts
            </a>
            <a
              href="/campaigns"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </a>
            <a
              href="/templates"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Create Template
            </a>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Message Performance (Last 7 Days)
          </h3>
          {dashboardData?.performanceData &&
          dashboardData.performanceData.length > 0 ? (
            <div className="h-64 flex items-end justify-between space-x-2">
              {dashboardData.performanceData.map((data: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-end space-y-1 mb-2">
                    <div
                      className="w-full bg-red-200 rounded-t"
                      style={{
                        height: `${
                          (data.failed / Math.max(data.sent, 1)) * 100
                        }%`,
                      }}
                      title={`Failed: ${data.failed}`}
                    />
                    <div
                      className="w-full bg-green-200"
                      style={{
                        height: `${
                          (data.delivered / Math.max(data.sent, 1)) * 100
                        }%`,
                      }}
                      title={`Delivered: ${data.delivered}`}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{data.day}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No performance data available</p>
            </div>
          )}
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-200 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Delivered</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-200 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Failed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs & Workers Status */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Jobs & Workers Status
            </h3>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Campaigns
          </h3>
          {dashboardData?.campaigns && dashboardData.campaigns.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.campaigns
                    .slice(0, 5)
                    .map(
                      (campaign: {
                        id: string;
                        name: string;
                        description?: string;
                        status: string;
                        total_contacts?: number;
                        sent_count?: number;
                        created_at: string;
                      }) => (
                        <tr key={campaign.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {campaign.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {campaign.description}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                campaign.status === "running"
                                  ? "bg-green-100 text-green-800"
                                  : campaign.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : campaign.status === "paused"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {campaign.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.total_contacts || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.sent_count || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(campaign.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No campaigns
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new campaign.
              </p>
              <div className="mt-6">
                <a
                  href="/campaigns"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
