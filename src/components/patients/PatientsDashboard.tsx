"use client";

import { Patient } from "@/types/database";
import { usePatientsManagement } from "@/hooks/usePatientsManagement";
import { useState } from "react";
import AnalyticsWidgets from "./AnalyticsWidgets";
import BulkOperations from "./BulkOperations";
import PatientsTable from "./PatientsTable";
import RenewalTracker from "./RenewalTracker";

interface PatientsDashboardProps {
  patients: Patient[];
  total?: number;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function PatientsDashboard({
  patients: initialPatients,
  total: initialTotal,
  isLoading: initialIsLoading,
  onRefresh,
}: PatientsDashboardProps) {
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "table" | "renewals" | "analytics"
  >("table");
  const [filters, setFilters] = useState({
    search: "",
    status: [],
    tags: [],
    license_type: [],
    specialty: [],
    created_after: "",
    created_before: "",
    phone_prefix: "",
    exam_date_after: "",
    exam_date_before: "",
    renewal_date_after: "",
    renewal_date_before: "",
    page: 0,
    limit: 50,
    sortBy: "created_at",
    sortOrder: "desc" as "asc" | "desc",
  });

  // Use the patients management hook for filtered data
  const {
    patients,
    total,
    isLoading,
    refetch,
  } = usePatientsManagement(filters);

  const handleToggleSelection = (patientId: string) => {
    setSelectedPatients((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = (patientIds: string[]) => {
    setSelectedPatients(patientIds);
  };

  const handleClearSelection = () => {
    setSelectedPatients([]);
  };

  const handleEditPatient = (patient: Patient) => {
    // TODO: Implement edit patient functionality
    console.log("Edit patient:", patient);
  };

  const handleViewPatient = (patient: Patient) => {
    // TODO: Implement view patient functionality
    console.log("View patient:", patient);
  };

  const handleDeletePatient = (patientId: string) => {
    // TODO: Implement delete patient functionality
    console.log("Delete patient:", patientId);
  };

  const handleUpdateStatus = (patientId: string, status: string) => {
    // TODO: Implement update status functionality
    console.log("Update patient status:", patientId, status);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // The usePatientsManagement hook will automatically refetch with new filters
  };

  const handleBulkUpdate = async (
    patientIds: string[],
    updates: Record<string, unknown>
  ) => {
    try {
      const response = await fetch("/api/patients/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientIds,
          operation: "update_status",
          parameters: updates,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update patients");
      }

      const result = await response.json();
      console.log("Bulk update successful:", result);

      // Refresh the data
      onRefresh();

      // Clear selection
      setSelectedPatients([]);

      // Show success message
      alert(`Successfully updated ${result.affectedCount} patients`);
    } catch (error) {
      console.error("Bulk update failed:", error);
      alert("Failed to update patients. Please try again.");
    }
  };

  const handleBulkDelete = async (patientIds: string[]) => {
    try {
      const response = await fetch("/api/patients/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientIds,
          operation: "delete",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete patients");
      }

      const result = await response.json();
      console.log("Bulk delete successful:", result);

      // Refresh the data
      onRefresh();

      // Clear selection
      setSelectedPatients([]);

      // Show success message (you could add a toast notification here)
      alert(`Successfully deleted ${result.affectedCount} patients`);
    } catch (error) {
      console.error("Bulk delete failed:", error);
      alert("Failed to delete patients. Please try again.");
    }
  };

  const handleBulkTag = async (
    patientIds: string[],
    tags: string[],
    operation: "add" | "remove"
  ) => {
    try {
      const response = await fetch("/api/patients/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientIds,
          operation: operation === "add" ? "add_tags" : "remove_tags",
          parameters: { tags },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update patient tags");
      }

      const result = await response.json();
      console.log("Bulk tag operation successful:", result);

      // Refresh the data
      onRefresh();

      // Clear selection
      setSelectedPatients([]);

      // Show success message
      alert(
        `Successfully ${
          operation === "add" ? "added tags to" : "removed tags from"
        } ${result.affectedCount} patients`
      );
    } catch (error) {
      console.error("Bulk tag operation failed:", error);
      alert("Failed to update patient tags. Please try again.");
    }
  };

  const handleExport = (patientIds: string[]) => {
    // TODO: Implement export functionality
    console.log("Export patients:", patientIds);
  };

  const handleCreateRenewal = (renewalData: Record<string, unknown>) => {
    // TODO: Implement create renewal functionality
    console.log("Create renewal:", renewalData);
  };

  const handleUpdateRenewal = (
    renewalId: string,
    updates: Record<string, unknown>
  ) => {
    // TODO: Implement update renewal functionality
    console.log("Update renewal:", renewalId, updates);
  };

  const handleSendReminders = (patientIds: string[]) => {
    // TODO: Implement send reminders functionality
    console.log("Send reminders to patients:", patientIds);
  };

  const handleDeleteRenewal = (renewalId: string) => {
    // TODO: Implement delete renewal functionality
    console.log("Delete renewal:", renewalId);
  };

  const tabs = [
    { id: "table", name: "Patients Table", count: patients?.length || 0 },
    { id: "renewals", name: "Renewal Tracking", count: 0 },
    { id: "analytics", name: "Analytics", count: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Patient Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage patient records, track renewals, and monitor exam schedules
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPatientModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg
                className="w-4 h-4 mr-2"
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
              Add Patient
            </button>
            <a
              href="/patients/import"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Import CSV
            </a>
            <button
              onClick={onRefresh}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Operations */}
      {selectedPatients.length > 0 && (
        <BulkOperations
          selectedPatients={selectedPatients}
          onBulkUpdate={handleBulkUpdate}
          onBulkDelete={handleBulkDelete}
          onBulkTag={handleBulkTag}
          onExport={handleExport}
          onClearSelection={handleClearSelection}
          isProcessing={false}
        />
      )}

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "table" && (
            <PatientsTable
              patients={patients || []}
              isLoading={isLoading}
              selectedPatients={selectedPatients}
              onToggleSelection={handleToggleSelection}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              onEditPatient={handleEditPatient}
              onViewPatient={handleViewPatient}
              onDeletePatient={handleDeletePatient}
              onUpdateStatus={handleUpdateStatus}
              filters={{ ...filters, total }}
              onFiltersChange={handleFiltersChange}
            />
          )}

          {activeTab === "renewals" && (
            <RenewalTracker
              renewals={[]}
              dueRenewals={[]}
              isLoading={false}
              onCreateRenewal={handleCreateRenewal}
              onUpdateRenewal={handleUpdateRenewal}
              onSendReminders={handleSendReminders}
              onDeleteRenewal={handleDeleteRenewal}
              isProcessing={false}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsWidgets
              patients={patients || []}
              isLoading={isLoading}
              onRefresh={refetch}
            />
          )}
        </div>
      </div>
    </div>
  );
}
