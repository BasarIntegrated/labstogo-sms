"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";

interface Message {
  id: string;
  kind: "sms" | "email";
  status: string;
  phone_number?: string;
  email?: string;
  sent_at?: string;
  contacts?: {
    first_name?: string;
    last_name?: string;
  };
}

/**
 * Recent Messages Table Component
 *
 * Displays last 50 messages with status, auto-refreshes every 30 seconds
 */
export const RecentMessagesTable: React.FC = () => {
  const {
    data: messages,
    isLoading,
    error,
  } = useQuery<Message[]>({
    queryKey: ["recent-messages"],
    queryFn: async () => {
      const response = await fetch("/api/messages?limit=50");
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const result = await response.json();
      return result.messages || [];
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 30000, // 30 seconds
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-red-600 text-sm">Error loading messages</div>
      </div>
    );
  }

  const displayMessages = messages?.slice(0, 50) || [];

  const getContactName = (message: Message) => {
    if (message.contacts) {
      const { first_name, last_name } = message.contacts;
      if (first_name || last_name) {
        return `${first_name || ""} ${last_name || ""}`.trim();
      }
    }
    return "Unknown";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Messages
            </h3>
            <p className="text-sm text-gray-600">
              Last 50 messages (auto-refresh)
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sent At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayMessages.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No messages found
                </td>
              </tr>
            ) : (
              displayMessages.map((message) => (
                <tr key={message.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getContactName(message)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        message.kind === "sms"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {message.kind?.toUpperCase() || "SMS"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        message.status === "delivered" ||
                        message.status === "sent"
                          ? "bg-green-100 text-green-800"
                          : message.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {message.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(message.sent_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
