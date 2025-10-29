"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  MessageSquare,
  RefreshCw,
  Server,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface QueueStatus {
  smsQueue: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  };
  campaignQueue: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  };
}

interface BackendHealth {
  status: string;
  timestamp: string;
  workers: {
    sms: boolean;
    email?: boolean;
    campaign: boolean;
  };
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
}

interface LogsResponse {
  logs: LogEntry[];
  totalEntries: number;
  returnedEntries: number;
}

export default function QueueDashboard() {
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds

  // Fetch queue status from backend
  const {
    data: queueStatus,
    isLoading: queueLoading,
    error: queueError,
  } = useQuery({
    queryKey: ["queue-status"],
    queryFn: async (): Promise<QueueStatus> => {
      const response = await fetch("/api/queue/status");
      if (!response.ok) throw new Error("Failed to fetch queue status");
      return response.json();
    },
    refetchInterval: refreshInterval,
  });

  // Fetch backend health
  const {
    data: backendHealth,
    isLoading: healthLoading,
    error: healthError,
  } = useQuery({
    queryKey: ["backend-health"],
    queryFn: async (): Promise<BackendHealth> => {
      const response = await fetch("/api/backend/health");
      if (!response.ok) throw new Error("Failed to fetch backend health");
      return response.json();
    },
    refetchInterval: refreshInterval,
  });

  // Fetch logs from backend
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ["backend-logs"],
    queryFn: async (): Promise<LogsResponse> => {
      const response = await fetch("/api/backend/logs?limit=50");
      if (!response.ok) throw new Error("Failed to fetch logs");
      return response.json();
    },
    refetchInterval: refreshInterval,
  });

  const getQueueStatusColor = (count: number) => {
    if (count === 0) return "text-green-600 bg-green-100";
    if (count < 10) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getWorkerStatusColor = (isRunning: boolean) => {
    return isRunning
      ? "text-green-600 bg-green-100"
      : "text-red-600 bg-red-100";
  };

  const getWorkerStatusIcon = (isRunning: boolean) => {
    return isRunning ? (
      <CheckCircle className="w-4 h-4" />
    ) : (
      <XCircle className="w-4 h-4" />
    );
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-600 bg-red-100";
      case "warn":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (queueLoading || healthLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading queue data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Queue Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring of SMS and Campaign queues
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Auto-refresh: {refreshInterval / 1000}s
            </span>
          </div>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded-md px-2 py-1"
          >
            <option value={1000}>1s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
          </select>
        </div>
      </div>

      {/* Backend Health Status */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Backend Service Health
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Last updated:{" "}
              {backendHealth?.timestamp
                ? new Date(backendHealth.timestamp).toLocaleString()
                : "Unknown"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getWorkerStatusColor(
                backendHealth?.status === "healthy"
              )}`}
            >
              {backendHealth?.status === "healthy" ? (
                <>
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  HEALTHY
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 inline mr-1" />
                  UNHEALTHY
                </>
              )}
            </div>
          </div>
        </div>

        {/* Worker Status */}
        {backendHealth?.workers && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Server className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                SMS Worker:
              </span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getWorkerStatusColor(
                  backendHealth.workers.sms
                )}`}
              >
                {getWorkerStatusIcon(backendHealth.workers.sms)}
                <span className="ml-1">
                  {backendHealth.workers.sms ? "Running" : "Stopped"}
                </span>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">
                Campaign Worker:
              </span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getWorkerStatusColor(
                  backendHealth.workers.campaign
                )}`}
              >
                {getWorkerStatusIcon(backendHealth.workers.campaign)}
                <span className="ml-1">
                  {backendHealth.workers.campaign ? "Running" : "Stopped"}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Queue Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* SMS Queue */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">SMS Queue</h3>
            <MessageSquare className="w-6 h-6 text-blue-500" />
          </div>

          {queueError ? (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600">
                Failed to load SMS queue data
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {queueStatus?.smsQueue &&
                Object.entries(queueStatus.smsQueue).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {status}:
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getQueueStatusColor(
                        count
                      )}`}
                    >
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Campaign Queue */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Campaign Queue
            </h3>
            <Activity className="w-6 h-6 text-purple-500" />
          </div>

          {queueError ? (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600">
                Failed to load campaign queue data
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {queueStatus?.campaignQueue &&
                Object.entries(queueStatus.campaignQueue).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {status}:
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getQueueStatusColor(
                          count
                        )}`}
                      >
                        {count}
                      </span>
                    </div>
                  )
                )}
            </div>
          )}
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          System Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Database</p>
              <p className="text-sm text-gray-500">Supabase PostgreSQL</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Server className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Queue System</p>
              <p className="text-sm text-gray-500">BullMQ with Redis</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">SMS Provider</p>
              <p className="text-sm text-gray-500">Twilio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Viewer */}
      <div className="bg-white shadow rounded-lg p-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <RefreshCw 
              className={`w-5 h-5 text-gray-600 ${logsLoading ? 'animate-spin' : ''}`}
            />
            <h3 className="text-lg font-medium text-gray-900">
              Real-time Logs
            </h3>
            <span className="text-xs text-gray-400">
              (Auto-refresh: {refreshInterval / 1000}s)
            </span>
          </div>
          {logsData && (
            <span className="text-sm text-gray-500">
              {logsData.totalEntries} entries in buffer
            </span>
          )}
        </div>

        {logsLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
            {logsData?.logs.length === 0 ? (
              <p className="text-gray-400">No logs available</p>
            ) : (
              <div className="space-y-1">
                {logsData?.logs
                  .slice()
                  .reverse()
                  .map((log, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-gray-500 min-w-[85px]">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold min-w-[50px] ${getLogLevelColor(
                          log.level
                        )}`}
                      >
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-gray-300 flex-1 break-all">
                        {log.message}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
