"use client";

import { RecentActivity } from "@/hooks/useDashboardData";
import React from "react";

interface RecentActivityProps {
  activities?: RecentActivity[];
  onActivityClick?: (activity: RecentActivity) => void;
}

interface ActivityItemProps {
  activity: RecentActivity;
  onClick?: (activity: RecentActivity) => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onClick }) => {
  const statusColors = {
    success:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    error: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  };

  const typeIcons = {
    campaign: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
        />
      </svg>
    ),
    patient: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
        />
      </svg>
    ),
    renewal: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    system: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  };

  const handleClick = () => {
    if (onClick) {
      onClick(activity);
    }
  };

  return (
    <div
      className="flex items-start space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
      onClick={handleClick}
    >
      <div className="flex-shrink-0">
        <div className={`p-2 rounded-lg ${statusColors[activity.status]}`}>
          {typeIcons[activity.type]}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {activity.title}
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(activity.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
          {activity.description}
        </p>

        {activity.metadata && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(activity.metadata)
              .slice(0, 3)
              .map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                >
                  {key}: {String(value)}
                </span>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Recent Activity Component
 *
 * Displays a list of recent activities with real-time updates,
 * filtering options, and interactive elements.
 */
export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities = [],
  onActivityClick,
}) => {
  const isLoading = activities.length === 0;

  // Mock data for demonstration
  const mockActivities: RecentActivity[] = [
    {
      id: "1",
      type: "campaign",
      title: "Renewal Reminder Campaign Started",
      description:
        "Campaign 'Q1 2024 Renewals' has been launched to 150 patients",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: "success",
      metadata: { campaignId: "camp_001", patientCount: 150 },
    },
    {
      id: "2",
      type: "patient",
      title: "New Patient Registration",
      description: "Dr. Sarah Johnson has been added to the system",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: "info",
      metadata: { patientId: "pat_001", licenseType: "Medical" },
    },
    {
      id: "3",
      type: "renewal",
      title: "Renewal Deadline Approaching",
      description: "5 patients have renewals due within 7 days",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: "warning",
      metadata: { count: 5, daysUntilRenewal: 7 },
    },
    {
      id: "4",
      type: "system",
      title: "SMS Delivery Rate Alert",
      description: "Delivery rate dropped below 95% threshold",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      status: "error",
      metadata: { deliveryRate: 94.2, threshold: 95 },
    },
    {
      id: "5",
      type: "campaign",
      title: "Exam Notification Sent",
      description: "Exam reminders sent to 25 nursing professionals",
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      status: "success",
      metadata: { campaignId: "camp_002", patientCount: 25 },
    },
  ];

  const displayActivities = isLoading ? mockActivities : activities;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Latest updates and notifications
            </p>
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
              All
            </button>
            <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
              Campaigns
            </button>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {displayActivities.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            onClick={onActivityClick}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
          View All Activity
        </button>
      </div>
    </div>
  );
};
