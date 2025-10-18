"use client";

import { AlertTriangle, Download, Loader, Tag, Trash2, X } from "lucide-react";
import { useState } from "react";

interface BulkOperationsProps {
  selectedPatients: string[];
  onBulkUpdate: (
    patientIds: string[],
    updates: Record<string, unknown>
  ) => Promise<void>;
  onBulkDelete: (patientIds: string[]) => Promise<void>;
  onBulkTag: (
    patientIds: string[],
    tags: string[],
    operation: "add" | "remove" | "replace"
  ) => Promise<void>;
  onExport: (patientIds: string[]) => void;
  onClearSelection: () => void;
  isProcessing: boolean;
}

export default function BulkOperations({
  selectedPatients,
  onBulkUpdate,
  onBulkDelete,
  onBulkTag,
  onExport,
  onClearSelection,
  isProcessing,
}: BulkOperationsProps) {
  const [showModal, setShowModal] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!showModal) return;

    setIsSubmitting(true);
    try {
      switch (showModal) {
        case "update":
          await onBulkUpdate(selectedPatients, formData);
          break;
        case "delete":
          await onBulkDelete(selectedPatients);
          break;
        case "tag":
          const tags =
            (formData.tags as string)?.split(",").map((t) => t.trim()) || [];
          const operation = formData.operation as "add" | "remove" | "replace";
          await onBulkTag(selectedPatients, tags, operation);
          break;
        case "export":
          onExport(selectedPatients);
          break;
      }
      setShowModal(null);
      setFormData({});
    } catch (error) {
      console.error("Bulk operation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowModal(null);
    setFormData({});
  };

  if (selectedPatients.length === 0) return null;

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-800">
              {selectedPatients.length} patients selected
            </span>
            <button
              onClick={onClearSelection}
              className="text-blue-600 hover:text-blue-800"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowModal("update")}
              disabled={isProcessing}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Update Status
            </button>
            <button
              onClick={() => setShowModal("tag")}
              disabled={isProcessing}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Tag className="w-4 h-4 mr-1" />
              Add Tags
            </button>
            <button
              onClick={() => setShowModal("tag")}
              disabled={isProcessing}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Tag className="w-4 h-4 mr-1" />
              Remove Tags
            </button>
            <button
              onClick={() => setShowModal("export")}
              disabled={isProcessing}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
            <button
              onClick={() => setShowModal("delete")}
              disabled={isProcessing}
              className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium bg-white text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Bulk Operation
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {showModal === "update" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={(formData.status as string) || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="renewal_due">Renewal Due</option>
                      <option value="exam_pending">Exam Pending</option>
                      <option value="unsubscribed">Unsubscribed</option>
                    </select>
                  </div>
                </div>
              )}

              {showModal === "tag" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tags
                    </label>
                    <input
                      type="text"
                      placeholder="Enter tags separated by commas (e.g., vip, premium, new)"
                      value={(formData.tags as string) || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Operation
                    </label>
                    <select
                      value={(formData.operation as string) || "add"}
                      onChange={(e) =>
                        setFormData({ ...formData, operation: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="add">Add Tags</option>
                      <option value="remove">Remove Tags</option>
                      <option value="replace">Replace Tags</option>
                    </select>
                  </div>
                </div>
              )}

              {showModal === "delete" && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-gray-600">
                      Are you sure you want to delete {selectedPatients.length}{" "}
                      patients? This action cannot be undone.
                    </p>
                  </div>
                </div>
              )}

              {showModal === "export" && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Export {selectedPatients.length} patients to CSV format.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {isSubmitting && (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Execute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
