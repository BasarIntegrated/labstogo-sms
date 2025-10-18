"use client";

import { Patient } from "@/types/database";
import { ChevronDown, ChevronUp, Edit, Eye, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { PatientCampaignDetails } from "./PatientCampaignDetails";
import { PatientFilters } from "./PatientFilters";

interface PatientsTableProps {
  patients: Patient[];
  isLoading: boolean;
  selectedPatients: string[];
  onToggleSelection: (patientId: string) => void;
  onSelectAll: (patientIds: string[]) => void;
  onClearSelection: () => void;
  onEditPatient: (patient: Patient) => void;
  onViewPatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
  onUpdateStatus?: (patientId: string, status: string) => void;
  filters: PatientFilters;
  onFiltersChange: (filters: PatientFilters) => void;
}

interface PatientFilters {
  search?: string;
  status?: string[];
  tags?: string[];
  license_type?: string[];
  specialty?: string[];
  created_after?: string;
  created_before?: string;
  phone_prefix?: string;
  exam_date_after?: string;
  exam_date_before?: string;
  renewal_date_after?: string;
  renewal_date_before?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  segment?: string;
  total?: number;
}

export default function PatientsTable({
  patients,
  isLoading,
  selectedPatients,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onEditPatient,
  onViewPatient,
  onDeletePatient,
  onUpdateStatus,
  filters,
  onFiltersChange,
}: PatientsTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "created_at",
    direction: "desc",
  });

  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [selectedPatientForCampaigns, setSelectedPatientForCampaigns] =
    useState<{
      id: string;
      name: string;
    } | null>(null);

  const sortedPatients = useMemo(() => {
    if (!patients) return [];

    return [...patients].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Patient];
      const bValue = b[sortConfig.key as keyof Patient];

      // Handle null/undefined values for proper sorting
      const aSortValue =
        aValue === null || aValue === undefined ? "" : String(aValue);
      const bSortValue =
        bValue === null || bValue === undefined ? "" : String(bValue);

      if (aSortValue < bSortValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aSortValue > bSortValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [patients, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleViewCampaignDetails = (patient: Patient) => {
    setSelectedPatientForCampaigns({
      id: patient.id,
      name: `${patient.first_name} ${patient.last_name}`,
    });
    setShowCampaignDetails(true);
  };

  const handleCloseCampaignDetails = () => {
    setShowCampaignDetails(false);
    setSelectedPatientForCampaigns(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "renewal_due":
        return "bg-yellow-100 text-yellow-800";
      case "exam_pending":
        return "bg-blue-100 text-blue-800";
      case "unsubscribed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPhoneNumber = (phone: string | undefined) => {
    // Simple phone number formatting
    if (!phone) return "No phone";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }
    return phone;
  };

  const calculateDaysUntilExpiry = (expiryDate: string | undefined) => {
    if (!expiryDate) return undefined;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isAllSelected =
    patients.length > 0 && selectedPatients.length === patients.length;
  const isIndeterminate =
    selectedPatients.length > 0 && selectedPatients.length < patients.length;

  // Don't return early for loading - show filters and loading state

  // Don't return early for empty patients - show the full table structure

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      {/* Patient Filters Component */}
      <PatientFilters filters={filters} onFiltersChange={onFiltersChange} />

      {/* Patient Selection Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) input.indeterminate = isIndeterminate;
              }}
              onChange={() => {
                if (isAllSelected) {
                  onClearSelection();
                } else {
                  onSelectAll(patients.map((p) => p.id));
                }
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              {selectedPatients.length > 0
                ? `${selectedPatients.length} patients selected`
                : `${patients.length} patients`}
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading patients...</p>
        </div>
      )}

      {/* Table Content */}
      {!isLoading && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Checkbox column */}
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={() => {
                      if (isAllSelected) {
                        onClearSelection();
                      } else {
                        onSelectAll(patients.map((p) => p.id));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>

                {/* Core columns - always visible */}
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("first_name")}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>First</span>
                    {sortConfig.key === "first_name" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("last_name")}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Last</span>
                    {sortConfig.key === "last_name" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("company")}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Company</span>
                    {sortConfig.key === "company" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("phone_number")}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Phone</span>
                    {sortConfig.key === "phone_number" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("email")}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Email</span>
                    {sortConfig.key === "email" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </button>
                </th>

                {/* Renewal/Expiry columns */}
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("expires")}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Expires</span>
                    {sortConfig.key === "expires" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("days_until_expiry")}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Days</span>
                    {sortConfig.key === "days_until_expiry" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </button>
                </th>

                {/* Additional info columns */}
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("date_of_birth")}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>DOB</span>
                    {sortConfig.key === "date_of_birth" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("job_type")}
                    className="flex items-center space-x-1 hover:text-gray-700"
                  >
                    <span>Job Type</span>
                    {sortConfig.key === "job_type" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </button>
                </th>

                {/* Actions column */}
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPatients.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center">
                    <p className="text-sm text-gray-500">No patients found</p>
                  </td>
                </tr>
              ) : (
                sortedPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className={`hover:bg-gray-50 ${
                      selectedPatients.includes(patient.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-2 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedPatients.includes(patient.id)}
                        onChange={() => onToggleSelection(patient.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>

                    {/* First Name */}
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {patient.first_name || "-"}
                    </td>

                    {/* Last Name */}
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {patient.last_name || "-"}
                    </td>

                    {/* Company */}
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {patient.company || "-"}
                    </td>

                    {/* Phone */}
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatPhoneNumber(patient.phone_number)}
                    </td>

                    {/* Email */}
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {patient.email || "-"}
                    </td>

                    {/* Expires */}
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {patient.expires ? formatDate(patient.expires) : "-"}
                    </td>

                    {/* Days Until Expiry */}
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {(() => {
                        const daysUntilExpiry = calculateDaysUntilExpiry(
                          patient.expires || patient.renewal_date
                        );
                        return daysUntilExpiry !== undefined ? (
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              daysUntilExpiry < 30
                                ? "bg-red-100 text-red-800"
                                : daysUntilExpiry < 90
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {daysUntilExpiry} days
                          </span>
                        ) : (
                          "-"
                        );
                      })()}
                    </td>

                    {/* DOB */}
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {patient.date_of_birth
                        ? formatDate(patient.date_of_birth)
                        : "-"}
                    </td>

                    {/* Job Type */}
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {patient.job_type || "-"}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onViewPatient(patient)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View patient details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditPatient(patient)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Edit patient"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeletePatient(patient.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete patient"
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
      )}

      {/* Pagination Controls */}
      {!isLoading && filters.total && filters.total > (filters.limit || 50) && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  page: Math.max(0, (filters.page || 0) - 1),
                })
              }
              disabled={!filters.page || filters.page === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() =>
                onFiltersChange({ ...filters, page: (filters.page || 0) + 1 })
              }
              disabled={
                !filters.total ||
                (filters.page || 0) * (filters.limit || 50) +
                  (filters.limit || 50) >=
                  filters.total
              }
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(filters.page || 0) * (filters.limit || 50) + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    (filters.page || 0) * (filters.limit || 50) +
                      (filters.limit || 50),
                    filters.total
                  )}
                </span>{" "}
                of <span className="font-medium">{filters.total}</span> results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      page: Math.max(0, (filters.page || 0) - 1),
                    })
                  }
                  disabled={!filters.page || filters.page === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronUp className="h-5 w-5" aria-hidden="true" />
                </button>

                {/* Page numbers */}
                {Array.from(
                  {
                    length: Math.min(
                      5,
                      Math.ceil(filters.total / (filters.limit || 50))
                    ),
                  },
                  (_, i) => {
                    const totalPages = Math.ceil(
                      (filters.total || 0) / (filters.limit || 50)
                    );
                    const currentPage = filters.page || 0;
                    let pageNumber;

                    if (totalPages <= 5) {
                      pageNumber = i;
                    } else if (currentPage < 3) {
                      pageNumber = i;
                    } else if (currentPage >= totalPages - 3) {
                      pageNumber = totalPages - 5 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    if (pageNumber >= totalPages) return null;

                    return (
                      <button
                        key={pageNumber}
                        onClick={() =>
                          onFiltersChange({ ...filters, page: pageNumber })
                        }
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNumber === currentPage
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber + 1}
                      </button>
                    );
                  }
                )}

                <button
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      page: (filters.page || 0) + 1,
                    })
                  }
                  disabled={
                    !filters.total ||
                    (filters.page || 0) * (filters.limit || 50) +
                      (filters.limit || 50) >=
                      filters.total
                  }
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronDown className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Details Modal */}
      {selectedPatientForCampaigns && (
        <PatientCampaignDetails
          patientId={selectedPatientForCampaigns.id}
          patientName={selectedPatientForCampaigns.name}
          isOpen={showCampaignDetails}
          onClose={handleCloseCampaignDetails}
        />
      )}
    </div>
  );
}
