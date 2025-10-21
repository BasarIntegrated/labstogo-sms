"use client";

import { SMSMessage } from "@/types/database";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  MessageSquare,
  Phone,
  RefreshCw,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export default function MessageHistoryPage() {
  const [filters, setFilters] = useState({
    status: "",
    campaign_id: "",
    phone_number: "",
    page: 0,
    limit: 50,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [retryingMessages, setRetryingMessages] = useState<Set<string>>(
    new Set()
  );

  // Fetch SMS messages
  const {
    data: messageData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["sms-messages", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.campaign_id)
        params.append("campaign_id", filters.campaign_id);
      if (filters.phone_number)
        params.append("phone_number", filters.phone_number);
      params.append("page", filters.page.toString());
      params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/sms-messages?${params}`);
      if (!response.ok) throw new Error("Failed to fetch SMS messages");
      return response.json();
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 0, // Reset to first page when filters change
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      campaign_id: "",
      phone_number: "",
      page: 0,
      limit: 50,
    });
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
          retryReason: "Manual retry from Message History",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to retry message");
      }

      // Refresh the data to show updated status
      await refetch();

      // Show success message (you could add a toast notification here)
      console.log("Message queued for retry successfully");
    } catch (error) {
      console.error("Error retrying message:", error);
      // Show error message (you could add a toast notification here)
    } finally {
      setRetryingMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading message history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading message history
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {error instanceof Error
                ? error.message
                : "Unknown error occurred"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const messages = messageData?.messages || [];
  const total = messageData?.total || 0;
  const totalPages = Math.ceil(total / filters.limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Message History</h1>
          <p className="text-gray-600">
            View all SMS messages sent through campaigns
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={filters.phone_number}
                onChange={(e) =>
                  handleFilterChange("phone_number", e.target.value)
                }
                placeholder="Search by phone number..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">
                Total Messages
              </p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  messages.filter(
                    (m: SMSMessage) =>
                      m.status === "sent" || m.status === "delivered"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  messages.filter((m: SMSMessage) => m.status === "failed")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  messages.filter((m: SMSMessage) => m.status === "pending")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent At
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
                {messages.map((message: SMSMessage) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {message.campaigns?.name || "Unknown Campaign"}
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
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate" title={message.message}>
                        {message.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {message.sent_at ? formatDateTime(message.sent_at) : "-"}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {filters.page * filters.limit + 1} to{" "}
                {Math.min((filters.page + 1) * filters.limit, total)} of {total}{" "}
                messages
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: Math.max(0, prev.page - 1),
                    }))
                  }
                  disabled={filters.page === 0}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: Math.min(totalPages - 1, prev.page + 1),
                    }))
                  }
                  disabled={filters.page >= totalPages - 1}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
