"use client";

import { RenewalData } from "@/types/database";
import {
  AlertTriangle,
  Bell,
  Calendar,
  Edit,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

interface RenewalTrackerProps {
  renewals: RenewalData[];
  dueRenewals: RenewalData[];
  isLoading: boolean;
  onCreateRenewal: (
    renewalData: Omit<RenewalData, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  onUpdateRenewal: (id: string, updates: Partial<RenewalData>) => Promise<void>;
  onSendReminders: (renewalIds: string[]) => Promise<void>;
  onDeleteRenewal: (id: string) => Promise<void>;
  isProcessing: boolean;
}

export default function RenewalTracker({
  renewals,
  dueRenewals,
  isLoading,
  onCreateRenewal,
  onUpdateRenewal,
  onSendReminders,
  onDeleteRenewal,
  isProcessing,
}: RenewalTrackerProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedRenewal, setSelectedRenewal] = useState<RenewalData | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: "",
    license_type: "",
    license_number: "",
    current_expiry_date: "",
    renewal_deadline: "",
    renewal_status: "pending" as
      | "pending"
      | "submitted"
      | "approved"
      | "rejected"
      | "expired",
    exam_date: "",
  });

  const handleOpenModal = (renewal?: RenewalData) => {
    if (renewal) {
      setSelectedRenewal(renewal);
      setIsEditing(true);
      setFormData({
        patient_id: renewal.patient_id,
        license_type: renewal.license_type,
        license_number: renewal.license_number,
        current_expiry_date: renewal.current_expiry_date,
        renewal_deadline: renewal.renewal_deadline,
        renewal_status: renewal.renewal_status,
        exam_date: renewal.exam_date || "",
      });
    } else {
      setSelectedRenewal(null);
      setIsEditing(false);
      setFormData({
        patient_id: "",
        license_type: "",
        license_number: "",
        current_expiry_date: "",
        renewal_deadline: "",
        renewal_status: "pending",
        exam_date: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRenewal(null);
    setIsEditing(false);
    setFormData({
      patient_id: "",
      license_type: "",
      license_number: "",
      current_expiry_date: "",
      renewal_deadline: "",
      renewal_status: "pending",
      exam_date: "",
    });
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && selectedRenewal) {
        await onUpdateRenewal(selectedRenewal.id, formData);
      } else {
        await onCreateRenewal(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save renewal:", error);
    }
  };

  const handleDelete = async (renewalId: string) => {
    if (window.confirm("Are you sure you want to delete this renewal?")) {
      try {
        await onDeleteRenewal(renewalId);
      } catch (error) {
        console.error("Failed to delete renewal:", error);
      }
    }
  };

  const handleSendReminders = async () => {
    const overdueRenewalIds = dueRenewals.map((r) => r.id);
    if (overdueRenewalIds.length > 0) {
      try {
        await onSendReminders(overdueRenewalIds);
      } catch (error) {
        console.error("Failed to send reminders:", error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            Renewal Tracking
          </h2>
          <p className="text-sm text-gray-500">
            Manage patient exam renewals and send reminders
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Renewal
          </button>
          <button
            onClick={handleSendReminders}
            disabled={isProcessing || dueRenewals.length === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Reminders
          </button>
        </div>
      </div>

      {/* Due Renewals Alert */}
      {dueRenewals.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                {dueRenewals.length} Renewal{dueRenewals.length > 1 ? "s" : ""}{" "}
                Due
              </h3>
              <p className="text-sm text-yellow-700">
                {dueRenewals.length} renewal
                {dueRenewals.length > 1 ? "s are" : " is"} past due date and
                require attention.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Renewals Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Renewals</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Renewal Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notifications
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {renewals.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <Calendar className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        No renewals found
                      </p>
                      <p className="text-gray-500">
                        Get started by adding a renewal record.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                renewals.map((renewal) => (
                  <tr key={renewal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Patient #{renewal.patient_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      -
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {renewal.exam_date ? formatDate(renewal.exam_date) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={
                          renewal.renewal_status === "expired"
                            ? "text-red-600"
                            : ""
                        }
                      >
                        {formatDate(renewal.renewal_deadline)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          renewal.renewal_status
                        )}`}
                      >
                        {renewal.renewal_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Bell className="w-4 h-4 mr-1" />0
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal(renewal)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit renewal"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(renewal.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete renewal"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditing ? "Edit Renewal" : "Add Renewal"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    value={formData.patient_id}
                    onChange={(e) =>
                      setFormData({ ...formData, patient_id: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter patient ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    License Type
                  </label>
                  <input
                    type="text"
                    value={formData.license_type}
                    onChange={(e) =>
                      setFormData({ ...formData, license_type: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Medical, Nursing, Pharmacy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    License Number
                  </label>
                  <input
                    type="text"
                    value={formData.license_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        license_number: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter license number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.current_expiry_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_expiry_date: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    value={formData.exam_date}
                    onChange={(e) =>
                      setFormData({ ...formData, exam_date: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Renewal Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.renewal_deadline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        renewal_deadline: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={formData.renewal_status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        renewal_status: e.target.value as
                          | "pending"
                          | "submitted"
                          | "approved"
                          | "rejected"
                          | "expired",
                      })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
