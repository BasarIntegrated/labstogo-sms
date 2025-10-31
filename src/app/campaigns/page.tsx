"use client";

import CampaignComposer from "@/components/campaigns/CampaignComposer";
import CampaignMonitoring from "@/components/campaigns/CampaignMonitoring";
import { Campaign } from "@/types/database";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CheckCircle,
  Clock,
  // Filter,
  Edit,
  Eye,
  MessageSquare,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  Square,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";

// No mock data - using real API calls

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [viewingCampaign, setViewingCampaign] = useState<Campaign | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [monitoringCampaign, setMonitoringCampaign] = useState<Campaign | null>(
    null
  );
  const [showMonitoring, setShowMonitoring] = useState(false);

  // Real API calls
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns", searchTerm, selectedStatus],
    queryFn: async () => {
      try {
        const response = await fetch("/api/campaigns");
        if (!response.ok) {
          throw new Error("Failed to fetch campaigns");
        }
        const data = await response.json();
        return data.campaigns || [];
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        return [];
      }
    },
  });

  const filteredCampaigns = campaigns.filter((campaign: Campaign) => {
    const matchesSearch =
      !searchTerm ||
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || campaign.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Edit className="w-4 h-4" />;
      case "scheduled":
        return <Clock className="w-4 h-4" />;
      case "active":
        return <Play className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowCreateModal(true);
  };

  const handleSaveCampaign = async (campaign: Campaign) => {
    try {
      console.log("Saving campaign:", campaign);

      const url = "/api/campaigns";
      const method = campaign.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaign),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to ${campaign.id ? "update" : "create"} campaign`
        );
      }

      const result = await response.json();
      console.log("Campaign saved successfully:", result);

      // Close modal and refresh campaigns list
      setShowCreateModal(false);
      setEditingCampaign(null);

      // Refresh campaigns data
      window.location.reload(); // Simple refresh for now

      // You could add a toast notification here
      alert(`Campaign ${campaign.id ? "updated" : "created"} successfully!`);
    } catch (error: any) {
      console.error("Error saving campaign:", error);
      alert(
        `Failed to ${campaign.id ? "update" : "create"} campaign: ${
          error.message || "Please try again."
        }`
      );
    }
  };

  const handleViewCampaign = (campaign: Campaign) => {
    setViewingCampaign(campaign);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingCampaign(null);
  };

  const handleMonitorCampaign = (campaign: Campaign) => {
    setMonitoringCampaign(campaign);
    setShowMonitoring(true);
  };

  const handleCloseMonitoring = () => {
    setShowMonitoring(false);
    setMonitoringCampaign(null);
  };

  const handleCancelEdit = () => {
    setShowCreateModal(false);
    setEditingCampaign(null);
  };

  const handleStartCampaign = async (campaignId: string) => {
    try {
      console.log("Starting campaign:", campaignId);

      // Call the campaign start API
      const response = await fetch(`/api/campaigns/${campaignId}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contactIds: [] }), // Empty array for now, will be populated by backend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start campaign");
      }

      const result = await response.json();
      console.log("Campaign started successfully:", result);

      // Refresh campaigns data
      window.location.reload();
      alert(result.message || "Campaign started successfully!");
    } catch (error: any) {
      console.error("Error starting campaign:", error);
      alert(
        `Failed to start campaign: ${error.message || "Please try again."}`
      );
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      console.log("Pausing campaign:", campaignId);

      // Update campaign status to paused
      const response = await fetch(`/api/campaigns/${campaignId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "paused",
          updated_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to pause campaign");
      }

      const result = await response.json();
      console.log("Campaign paused successfully:", result);

      // Refresh campaigns data
      window.location.reload();
      alert("Campaign paused successfully!");
    } catch (error: any) {
      console.error("Error pausing campaign:", error);
      alert(
        `Failed to pause campaign: ${error.message || "Please try again."}`
      );
    }
  };

  const handleStopCampaign = async (campaignId: string) => {
    try {
      console.log("Stopping campaign:", campaignId);

      // Update campaign status to cancelled
      const response = await fetch(`/api/campaigns/${campaignId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "cancelled",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to stop campaign");
      }

      const result = await response.json();
      console.log("Campaign stopped successfully:", result);

      // Refresh campaigns data
      window.location.reload();
      alert("Campaign stopped successfully!");
    } catch (error: any) {
      console.error("Error stopping campaign:", error);
      alert(`Failed to stop campaign: ${error.message || "Please try again."}`);
    }
  };

  const handleResumeCampaign = async (campaignId: string) => {
    try {
      console.log("Resuming campaign:", campaignId);

      // Update campaign status to active
      const response = await fetch(`/api/campaigns/${campaignId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "active",
          updated_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to resume campaign");
      }

      const result = await response.json();
      console.log("Campaign resumed successfully:", result);

      // Refresh campaigns data
      window.location.reload();
      alert("Campaign resumed successfully!");
    } catch (error: any) {
      console.error("Error resuming campaign:", error);
      alert(
        `Failed to resume campaign: ${error.message || "Please try again."}`
      );
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns?id=${campaignId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete campaign");
      }

      console.log("Campaign deleted successfully");
      // Refresh campaigns data
      window.location.reload();
      alert("Campaign deleted successfully!");
    } catch (error) {
      console.error("Error deleting campaign:", error);
      alert("Failed to delete campaign. Please try again.");
    }
  };

  const getDeliveryRate = (campaign: Campaign) => {
    const sent = campaign.sent_count || 0;
    if (sent === 0) return 0;
    // For email campaigns, treat "sent" as delivered (no delivery receipts)
    if (campaign.campaign_type === "email") {
      return 100;
    }
    const delivered = campaign.delivered_count || 0;
    return Math.min(100, Math.round((delivered / sent) * 100));
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="mt-2 text-gray-600">
              Create and manage your SMS and email campaigns
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Campaigns
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Play className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Campaigns
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  campaigns.filter((c: Campaign) => c.status === "active")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Send className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Messages Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.reduce(
                  (total: number, c: Campaign) => total + (c.sent_count || 0),
                  0
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <CheckCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Avg Delivery Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.length > 0
                  ? Math.round(
                      campaigns.reduce(
                        (total: number, c: Campaign) =>
                          total + getDeliveryRate(c),
                        0
                      ) / campaigns.length
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      <div className="animate-pulse">Loading campaigns...</div>
                    </td>
                  </tr>
                ) : filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      <div className="text-gray-500">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p>No campaigns found</p>
                        <p className="text-sm">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((campaign: Campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {campaign.name}
                          </div>
                          <div
                            className="text-sm text-gray-500 max-w-xs truncate"
                            title={campaign.description}
                          >
                            {campaign.description}
                          </div>
                          {campaign.scheduled_at && (
                            <div className="text-xs text-gray-400 flex items-center mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              Scheduled:{" "}
                              {new Date(campaign.scheduled_at).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {campaign.campaign_type || "sms"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            campaign.status
                          )}`}
                        >
                          {getStatusIcon(campaign.status)}
                          <span className="ml-1">{campaign.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-400 mr-1" />
                          {campaign.total_recipients || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.sent_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getDeliveryRate(campaign)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.created_at
                          ? new Date(campaign.created_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-1">
                          {/* Start Campaign Button */}
                          {campaign.status === "draft" && (
                            <button
                              onClick={() =>
                                campaign.id && handleStartCampaign(campaign.id)
                              }
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors"
                              title="Start Campaign"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Start
                            </button>
                          )}

                          {/* Pause Campaign Button */}
                          {campaign.status === "active" && (
                            <button
                              onClick={() =>
                                campaign.id && handlePauseCampaign(campaign.id)
                              }
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200 transition-colors"
                              title="Pause Campaign"
                            >
                              <Pause className="w-3 h-3 mr-1" />
                              Pause
                            </button>
                          )}

                          {/* Resume Campaign Button */}
                          {campaign.status === "paused" && (
                            <button
                              onClick={() =>
                                campaign.id && handleResumeCampaign(campaign.id)
                              }
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors"
                              title="Resume Campaign"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Resume
                            </button>
                          )}

                          {/* Start Cancelled Campaign Button */}
                          {campaign.status === "cancelled" && (
                            <button
                              onClick={() =>
                                campaign.id && handleStartCampaign(campaign.id)
                              }
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors"
                              title="Start Campaign"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Start
                            </button>
                          )}

                          {/* Stop Campaign Button */}
                          {(campaign.status === "active" ||
                            campaign.status === "scheduled" ||
                            campaign.status === "paused") && (
                            <button
                              onClick={() =>
                                campaign.id && handleStopCampaign(campaign.id)
                              }
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                              title="Stop Campaign"
                            >
                              <Square className="w-3 h-3 mr-1" />
                              Stop
                            </button>
                          )}

                          {/* Monitor Campaign Button */}
                          {(campaign.status === "active" ||
                            campaign.status === "paused") && (
                            <button
                              onClick={() => handleMonitorCampaign(campaign)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded hover:bg-purple-200 transition-colors"
                              title="Monitor Campaign"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Monitor
                            </button>
                          )}

                          {/* Edit Campaign Button */}
                          <button
                            onClick={() => handleEdit(campaign)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                            title="Edit Campaign"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </button>

                          {/* View Details Button */}
                          <button
                            onClick={() => handleViewCampaign(campaign)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </button>

                          {/* Delete Campaign Button */}
                          <button
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                            title="Delete Campaign"
                            onClick={() => {
                              if (
                                confirm(
                                  `Are you sure you want to delete "${campaign.name}"?`
                                )
                              ) {
                                campaign.id &&
                                  handleDeleteCampaign(campaign.id);
                              }
                            }}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Campaign Composer Modal */}
      <CampaignComposer
        campaign={editingCampaign || undefined}
        onSave={handleSaveCampaign}
        onCancel={handleCancelEdit}
        isOpen={showCreateModal}
      />

      {/* Campaign View Modal */}
      {showViewModal && viewingCampaign && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Campaign Details
                </h3>
                <button
                  onClick={handleCloseViewModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Campaign Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Campaign Name
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCampaign.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCampaign.description || "No description"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        viewingCampaign.status
                      )}`}
                    >
                      {viewingCampaign.status}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message Template
                    </label>
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {viewingCampaign.message_template ||
                          "No message template"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Campaign Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Campaign Statistics
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Sent:</span>
                      <span className="ml-2 font-medium">
                        {viewingCampaign.sent_count || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Failed:</span>
                      <span className="ml-2 font-medium">
                        {viewingCampaign.failed_count || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Delivered:</span>
                      <span className="ml-2 font-medium">
                        {viewingCampaign.delivered_count || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Delivery Rate:</span>
                      <span className="ml-2 font-medium">
                        {getDeliveryRate(viewingCampaign)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Campaign Dates */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Timeline
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2 font-medium">
                        {viewingCampaign.created_at
                          ? new Date(
                              viewingCampaign.created_at
                            ).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                    {viewingCampaign.updated_at && (
                      <div>
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="ml-2 font-medium">
                          {new Date(
                            viewingCampaign.updated_at
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {viewingCampaign.sent_at && (
                      <div>
                        <span className="text-gray-600">Started:</span>
                        <span className="ml-2 font-medium">
                          {new Date(viewingCampaign.sent_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {viewingCampaign.completed_at && (
                      <div>
                        <span className="text-gray-600">Completed:</span>
                        <span className="ml-2 font-medium">
                          {new Date(
                            viewingCampaign.completed_at
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleCloseViewModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleCloseViewModal();
                    handleEdit(viewingCampaign);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Monitoring Modal */}
      {showMonitoring && monitoringCampaign && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-5 border w-11/12 md:w-5/6 lg:w-4/5 xl:w-3/4 shadow-lg rounded-md bg-white max-h-[95vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Campaign Monitoring: {monitoringCampaign.name}
                </h3>
                <button
                  onClick={handleCloseMonitoring}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <CampaignMonitoring campaignId={monitoringCampaign.id!} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
