"use client";

import { SMSMessage } from "@/types/database";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  Phone,
  RefreshCw,
  RotateCcw,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface CampaignMonitoringProps {
  campaignId: string;
}

export default function CampaignMonitoring({
  campaignId,
}: CampaignMonitoringProps) {
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  const [showDetails, setShowDetails] = useState(false);
  const [retryingMessages, setRetryingMessages] = useState<Set<string>>(
    new Set()
  );

  // Fetch campaign details
  const {
    data: campaign,
    isLoading: campaignLoading,
    error: campaignError,
  } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Campaign not found
        }
        throw new Error("Failed to fetch campaign");
      }
      return response.json();
    },
    refetchInterval: refreshInterval,
  });

  // Fetch campaign recipients
  const { data: recipients, isLoading: recipientsLoading } = useQuery({
    queryKey: ["campaign-recipients", campaignId],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}/recipients`);
      if (!response.ok) throw new Error("Failed to fetch recipients");
      return response.json();
    },
    refetchInterval: refreshInterval,
  });

  // Fetch SMS messages (conditional based on campaign type)
  const { data: smsMessages, isLoading: smsLoading } = useQuery({
    queryKey: ["sms-messages", campaignId],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}/sms-messages`);
      if (!response.ok) throw new Error("Failed to fetch SMS messages");
      return response.json();
    },
    refetchInterval: refreshInterval,
    enabled: !campaignLoading && campaign?.campaign_type !== "email", // Only fetch if not email campaign
  });

  // Fetch Email messages (conditional based on campaign type)
  const { data: emailMessages, isLoading: emailLoading } = useQuery({
    queryKey: ["email-messages", campaignId],
    queryFn: async () => {
      const response = await fetch(
        `/api/campaigns/${campaignId}/email-messages`
      );
      if (!response.ok) throw new Error("Failed to fetch email messages");
      return response.json();
    },
    refetchInterval: refreshInterval,
    enabled: !campaignLoading && campaign?.campaign_type === "email", // Only fetch if email campaign
  });

  if (campaignLoading || recipientsLoading || smsLoading || emailLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading campaign data...</span>
      </div>
    );
  }

  if (campaignError) {
    return (
      <div className="text-center p-8">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error Loading Campaign
        </h3>
        <p className="text-gray-600">
          Failed to load campaign data. Please try again.
        </p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center p-8">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Campaign Not Found
        </h3>
        <p className="text-gray-600">
          The requested campaign could not be found.
        </p>
      </div>
    );
  }

  // Ensure campaign has required properties
  const safeCampaign = {
    ...campaign,
    status: campaign.status || "draft",
    sent_at: campaign.sent_at || null,
    name: campaign.name || "Unnamed Campaign",
  };

  // Use the appropriate messages based on campaign type
  const messages =
    campaign?.campaign_type === "email"
      ? emailMessages || []
      : smsMessages || [];

  const totalRecipients = recipients?.length || 0;
  const sentCount =
    messages?.filter((msg: SMSMessage) => msg.status === "sent").length || 0;
  const deliveredCount =
    messages?.filter((msg: SMSMessage) => msg.status === "delivered").length ||
    0;
  const failedCount =
    messages?.filter((msg: SMSMessage) => msg.status === "failed").length || 0;
  const pendingCount = totalRecipients - sentCount - failedCount;

  // Safe division to avoid NaN
  const deliveryRate =
    sentCount > 0 ? Math.round((deliveredCount / sentCount) * 100) : 0;
  const overallProgress =
    totalRecipients > 0
      ? Math.round(((sentCount + failedCount) / totalRecipients) * 100)
      : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-100";
      case "sent":
        return "text-blue-600 bg-blue-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "sent":
        return <MessageSquare className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleRetryMessage = async (messageId: string) => {
    setRetryingMessages((prev) => new Set(prev).add(messageId));

    try {
      const response = await fetch(`/api/sms-messages/${messageId}/retry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          retryReason: "Manual retry from Campaign Monitoring",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to retry message");
      }

      // Refresh the data to show updated status
      // The useQuery will automatically refetch due to the refetchInterval
      console.log("Message queued for retry successfully");
    } catch (error) {
      console.error("Error retrying message:", error);
    } finally {
      setRetryingMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {safeCampaign.name}
          </h1>
          <p className="text-gray-600 mt-1">Campaign Monitoring Dashboard</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Auto-refresh: {refreshInterval / 1000}s
            </span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Eye className="w-4 h-4 mr-2" />
            {showDetails ? "Hide Details" : "Show Details"}
          </button>
        </div>
      </div>

      {/* Campaign Status */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Campaign Status
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Started:{" "}
              {safeCampaign.sent_at
                ? new Date(safeCampaign.sent_at).toLocaleString()
                : "Not started"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                safeCampaign.status
              )}`}
            >
              {safeCampaign.status.toUpperCase()}
            </div>
            {safeCampaign.status === "active" && (
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium">Live</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Recipients */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Total Recipients
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalRecipients}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Sent */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="w-8 h-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Messages Sent</p>
              <p className="text-2xl font-semibold text-gray-900">
                {sentCount}
              </p>
            </div>
          </div>
        </div>

        {/* Delivered */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Delivered</p>
              <p className="text-2xl font-semibold text-gray-900">
                {deliveredCount}
              </p>
            </div>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {failedCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Campaign Progress
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Overall Progress</span>
              <span>{overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Delivery Rate</span>
              <span>{deliveryRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${deliveryRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Message Details
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivered At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retry Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages?.map((message: SMSMessage) => (
                  <tr key={message.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {message.contacts?.first_name &&
                      message.contacts?.last_name
                        ? `${message.contacts.first_name} ${message.contacts.last_name}`
                        : message.contacts?.first_name ||
                          message.contacts?.last_name
                        ? `${message.contacts.first_name || ""} ${
                            message.contacts.last_name || ""
                          }`.trim()
                        : message.contact_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {message.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          message.status
                        )}`}
                      >
                        {getStatusIcon(message.status)}
                        <span className="ml-1">{message.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {message.sent_at
                        ? new Date(message.sent_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {message.delivered_at
                        ? new Date(message.delivered_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      {message.status === "failed" &&
                      message.provider_response ? (
                        <div className="space-y-1">
                          {message.provider_response.error && (
                            <div className="text-red-600 text-xs">
                              <strong>Error:</strong>{" "}
                              {message.provider_response.error}
                            </div>
                          )}
                          {message.provider_response.code && (
                            <div className="text-gray-600 text-xs">
                              <strong>Code:</strong>{" "}
                              {message.provider_response.code}
                            </div>
                          )}
                          {message.provider_response.moreInfo && (
                            <div className="text-gray-600 text-xs">
                              <strong>Info:</strong>{" "}
                              {message.provider_response.moreInfo}
                            </div>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            (message.retry_count || 0) === 0
                              ? "bg-gray-100 text-gray-800"
                              : (message.retry_count || 0) <= 2
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {message.retry_count || 0}
                        </span>
                        {message.last_retry_at && (
                          <span className="ml-2 text-xs text-gray-500">
                            Last:{" "}
                            {new Date(message.last_retry_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {message.status === "failed" ? (
                        <button
                          onClick={() => handleRetryMessage(message.id)}
                          disabled={retryingMessages.has(message.id)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {retryingMessages.has(message.id) ? (
                            <>
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Retrying...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Retry
                            </>
                          )}
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
