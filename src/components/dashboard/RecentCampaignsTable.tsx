"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";

interface Campaign {
  id: string;
  name: string;
  campaign_type: "sms" | "email";
  status: string;
  sent_count?: number;
  recipient_contacts?: string[];
}

/**
 * Recent Campaigns Table Component
 *
 * Displays top 5 campaigns sorted by delivery rate
 */
export const RecentCampaignsTable: React.FC = () => {
  const {
    data: campaigns,
    isLoading,
    error,
  } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const response = await fetch("/api/campaigns");
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }
      const result = await response.json();
      return result.campaigns || [];
    },
    staleTime: 60000, // 1 minute
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
        <div className="text-red-600 text-sm">Error loading campaigns</div>
      </div>
    );
  }

  // Sort by sent_count (as proxy for delivery rate) and take top 5
  const topCampaigns =
    campaigns
      ?.sort((a, b) => (b.sent_count || 0) - (a.sent_count || 0))
      .slice(0, 5) || [];

  // Calculate delivery rate (simplified - using sent_count vs recipient count)
  const getDeliveryRate = (campaign: Campaign) => {
    const recipients = campaign.recipient_contacts?.length || 0;
    const sent = campaign.sent_count || 0;
    return recipients > 0 ? Math.round((sent / recipients) * 100) : 0;
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Recent Campaigns
        </h3>
        <p className="text-sm text-gray-600">Top 5 by messages sent</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Messages
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delivery Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {topCampaigns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No campaigns found
                </td>
              </tr>
            ) : (
              topCampaigns.map((campaign) => {
                const deliveryRate = getDeliveryRate(campaign);
                return (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {campaign.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.campaign_type === "sms"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {campaign.campaign_type?.toUpperCase() || "SMS"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.sent_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={
                          deliveryRate >= 95
                            ? "text-green-600 font-medium"
                            : deliveryRate >= 90
                            ? "text-yellow-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {deliveryRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.status === "active"
                            ? "bg-green-100 text-green-800"
                            : campaign.status === "completed"
                            ? "bg-gray-100 text-gray-800"
                            : campaign.status === "scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
