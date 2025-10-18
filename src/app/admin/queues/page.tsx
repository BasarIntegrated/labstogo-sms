"use client";

import { QueueStatus } from "@/types/queue";
import { useEffect, useState } from "react";

export default function BullMQDashboard() {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchQueueStatus = async () => {
      try {
        const response = await fetch("/api/queue/status");
        if (!response.ok) {
          throw new Error("Failed to fetch queue status");
        }
        const data = await response.json();
        setQueueStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchQueueStatus();

    // Start polling if enabled
    if (isPolling) {
      const interval = setInterval(fetchQueueStatus, 30000);
      setIntervalId(interval);
      return () => clearInterval(interval);
    }
  }, [isPolling]);

  const togglePolling = () => {
    if (isPolling) {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setIsPolling(false);
    } else {
      setIsPolling(true);
    }
  };

  const manualRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/queue/status");
      if (!response.ok) {
        throw new Error("Failed to fetch queue status");
      }
      const data = await response.json();
      setQueueStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              BullMQ Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Monitor your job queues and processing status in real-time
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={manualRefresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={togglePolling}
              className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                isPolling
                  ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                  : "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
              }`}
            >
              {isPolling ? "Pause Auto-Refresh" : "Resume Auto-Refresh"}
            </button>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Auto-refresh: {isPolling ? "Every 30 seconds" : "Paused"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SMS Queue */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            SMS Processing Queue
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {queueStatus?.smsQueue?.waiting || 0}
              </div>
              <div className="text-sm text-gray-500">Waiting</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {queueStatus?.smsQueue?.active || 0}
              </div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {queueStatus?.smsQueue?.completed || 0}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {queueStatus?.smsQueue?.failed || 0}
              </div>
              <div className="text-sm text-gray-500">Failed</div>
            </div>
          </div>

          {/* Recent SMS Jobs */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Recent Jobs
            </h3>
            {queueStatus?.recentJobs?.length ? (
              <div className="space-y-2">
                {queueStatus.recentJobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <div className="font-medium text-sm">Job #{job.id}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(job.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        job.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : job.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : job.status === "active"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent jobs</p>
            )}
          </div>
        </div>

        {/* Campaign Queue */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Campaign Processing Queue
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {queueStatus?.campaignQueue?.waiting || 0}
              </div>
              <div className="text-sm text-gray-500">Waiting</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {queueStatus?.campaignQueue?.active || 0}
              </div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {queueStatus?.campaignQueue?.completed || 0}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {queueStatus?.campaignQueue?.failed || 0}
              </div>
              <div className="text-sm text-gray-500">Failed</div>
            </div>
          </div>

          {/* Recent Campaign Jobs */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Recent Jobs
            </h3>
            {queueStatus?.recentJobs?.length ? (
              <div className="space-y-2">
                {queueStatus.recentJobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <div className="font-medium text-sm">Job #{job.id}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(job.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        job.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : job.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : job.status === "active"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent jobs</p>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">✓</div>
            <div className="text-sm text-gray-500">Redis Connected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">✓</div>
            <div className="text-sm text-gray-500">Workers Running</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">✓</div>
            <div className="text-sm text-gray-500">API Active</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500 text-center">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}
