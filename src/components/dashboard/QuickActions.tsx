"use client";

import React from "react";

interface QuickActionsProps {
  onActionClick?: (action: string) => void;
}

interface ActionButtonProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "yellow";
  onClick?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  description,
  icon,
  color,
  onClick,
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30",
    green:
      "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30",
    purple:
      "bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30",
    yellow:
      "bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md ${colorClasses[color]}`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">{icon}</div>
        <div className="text-left">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
};

/**
 * Quick Actions Component
 *
 * Provides quick access to common actions and workflows
 * with responsive design and accessibility features.
 */
export const QuickActions: React.FC<QuickActionsProps> = ({
  onActionClick,
}) => {
  const actions = [
    {
      title: "Create Campaign",
      description: "Start a new SMS campaign",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
      color: "blue" as const,
      action: "create-campaign",
    },
    {
      title: "Add Patient",
      description: "Register a new patient",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      ),
      color: "green" as const,
      action: "add-patient",
    },
    {
      title: "Send Test SMS",
      description: "Test SMS functionality",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      color: "purple" as const,
      action: "test-sms",
    },
    {
      title: "View Reports",
      description: "Generate analytics reports",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      color: "yellow" as const,
      action: "view-reports",
    },
  ];

  const handleActionClick = (action: string) => {
    if (onActionClick) {
      onActionClick(action);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Common tasks and workflows
        </p>
      </div>

      {/* Actions Grid */}
      <div className="p-6 space-y-3">
        {actions.map((action, index) => (
          <ActionButton
            key={index}
            title={action.title}
            description={action.description}
            icon={action.icon}
            color={action.color}
            onClick={() => handleActionClick(action.action)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full text-center text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium">
          View All Actions
        </button>
      </div>
    </div>
  );
};
