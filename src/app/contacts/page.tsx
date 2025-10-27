"use client";

import { AddContactModal } from "@/components/contacts/AddContactModal";
import { ContactImport } from "@/components/contacts/ContactImport";
import { EditContactModal } from "@/components/contacts/EditContactModal";
import { GroupsManagementModal } from "@/components/contacts/GroupsManagementModal";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Mail,
  Plus,
  Search,
  // Calendar,
  Tag,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Contact {
  id: string;
  phone_number: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  date_of_birth?: string;
  job_type?: string;
  expires?: string;
  last_reminder?: string;
  status: string;
  group_id?: string;
  license_expiration_date?: string;
  others?: string;
  preferred_contact_method: string;
  created_at: string;
  updated_at: string;
}

// Mock data for development
// No mock data - using real API calls

export default function ContactsPage() {
  console.log("ContactsPage component rendering...");

  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [expiresFrom, setExpiresFrom] = useState("");
  const [expiresTo, setExpiresTo] = useState("");
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showAssignGroupModal, setShowAssignGroupModal] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10); // Show 10 contacts per page
  const [previousContacts, setPreviousContacts] = useState<any[]>([]);
  // const [showCreateModal, setShowCreateModal] = useState(false);
  // const [showUploadModal, setShowUploadModal] = useState(false);
  // const [showGroupModal, setShowGroupModal] = useState(false);

  // Mock API calls - replace with actual API calls
  const {
    data: contactsData,
    isLoading,
    isFetching,
    error: queryError,
    refetch: refetchContacts,
  } = useQuery({
    queryKey: [
      "contacts",
      searchTerm,
      selectedStatus,
      selectedGroup,
      expiresFrom,
      expiresTo,
      sortBy,
      sortOrder,
      currentPage,
      pageSize,
    ],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: pageSize.toString(),
        });

        if (searchTerm) params.append("search", searchTerm);
        if (selectedStatus !== "all") params.append("status", selectedStatus);
        if (selectedGroup !== "all") params.append("group", selectedGroup);
        if (expiresFrom) params.append("expires_from", expiresFrom);
        if (expiresTo) params.append("expires_to", expiresTo);
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);

        const response = await fetch(`/api/contacts?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch contacts");
        }
        const data = await response.json();
        return data; // Return the full response object
      } catch (error) {
        console.error("Error fetching contacts:", error);
        return { contacts: [], total: 0, emailCount: 0 };
      }
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Debug logging
  console.log("Contacts Query State:", {
    isLoading,
    isFetching,
    hasData: !!contactsData,
    dataLength: contactsData?.contacts?.length || 0,
    total: contactsData?.total || 0,
    error: queryError,
  });

  // Get available groups for filter
  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/groups?limit=1000");
        if (!response.ok) {
          throw new Error("Failed to fetch groups");
        }
        const data = await response.json();
        setGroups(data.groups || []);
        return data.groups || [];
      } catch (error) {
        console.error("Error fetching groups:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get available campaigns for assignment
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/campaigns");
        if (!response.ok) {
          throw new Error("Failed to fetch campaigns");
        }
        const data = await response.json();
        return Array.isArray(data.campaigns) ? data.campaigns : [];
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update previous contacts when new data arrives
  useEffect(() => {
    if (contactsData?.contacts && contactsData.contacts.length > 0) {
      setPreviousContacts(contactsData.contacts);
    }
  }, [contactsData]);

  // Global error handler for unhandled errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      console.error("Error details:", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  // Show error state if query fails
  if (queryError) {
    console.error("Query error:", queryError);
    return (
      <div className="w-full py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading contacts
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {queryError.message || "Failed to load contacts"}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    console.log("Showing loading state...");
    return (
      <div className="w-full py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Preserve current data while fetching new data
  const contacts =
    isFetching &&
    (!contactsData?.contacts || contactsData.contacts.length === 0)
      ? previousContacts // Show previous contacts while fetching
      : contactsData?.contacts || [];
  const totalContacts = contactsData?.total || 0;
  const emailCount = contactsData?.emailCount || 0;
  const totalPages = Math.ceil(totalContacts / pageSize) || 1;
  const startIndex = Math.max(1, currentPage * pageSize + 1);
  const endIndex = Math.min(
    (currentPage + 1) * pageSize,
    Math.max(totalContacts, 0)
  );

  // Reset to first page when filters change
  const handleFilterChange = (
    newSearchTerm: string,
    newStatus: string,
    newExpiresFrom: string = expiresFrom,
    newExpiresTo: string = expiresTo
  ) => {
    setSearchTerm(newSearchTerm);
    setSelectedStatus(newStatus);
    setExpiresFrom(newExpiresFrom);
    setExpiresTo(newExpiresTo);
    setCurrentPage(0); // Reset to first page
  };

  // Handle column sorting
  const handleSort = (column: string) => {
    try {
      if (sortBy === column) {
        // Toggle sort order if same column
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        // Set new column and default to ascending
        setSortBy(column);
        setSortOrder("asc");
      }
      setCurrentPage(0); // Reset to first page when sorting
    } catch (error) {
      console.error("Error in handleSort:", error);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowEditModal(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts?id=${contactId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }

      // Refresh the contacts list
      if (refetchContacts) {
        refetchContacts();
      }

      setShowDeleteConfirm(false);
      setContactToDelete(null);
    } catch (error) {
      console.error("Error deleting contact:", error);
      alert("Failed to delete contact. Please try again.");
    }
  };

  const openDeleteConfirm = (contactId: string) => {
    setContactToDelete(contactId);
    setShowDeleteConfirm(true);
  };

  // Fetch groups for assignment
  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups");
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  // Handle contact selection toggle
  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  // Select all contacts on current page
  const selectAllContacts = () => {
    const allIds = filteredContacts.map((contact) => contact.id);
    setSelectedContacts(allIds);
  };

  // Deselect all contacts
  const deselectAllContacts = () => {
    setSelectedContacts([]);
  };

  // Handle bulk assign to group
  const handleAssignToGroup = async () => {
    if (!selectedCampaignId || selectedContacts.length === 0) {
      return;
    }

    setIsAssigning(true);
    try {
      const response = await fetch("/api/contacts/bulk-assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactIds: selectedContacts,
          groupId: selectedCampaignId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign contacts to group");
      }

      // Refresh contacts and clear selection
      if (refetchContacts) {
        refetchContacts();
      }
      setSelectedContacts([]);
      setShowAssignGroupModal(false);
      setSelectedCampaignId("");
    } catch (error) {
      console.error("Error assigning contacts to group:", error);
      alert("Failed to assign contacts to group");
    } finally {
      setIsAssigning(false);
    }
  };

  // Open assign group modal
  const openAssignGroupModal = () => {
    fetchGroups();
    setShowAssignGroupModal(true);
  };

  const handleAssignToCampaign = async () => {
    if (!selectedCampaignId) {
      alert("Please select a campaign first");
      return;
    }

    setIsAssigning(true);

    try {
      // Fetch ALL contacts that match current filters (not just paginated ones)
      const params = new URLSearchParams();
      params.append("limit", "10000"); // Large limit to get all contacts
      params.append("page", "0"); // Start from first page

      if (searchTerm) params.append("search", searchTerm);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (expiresFrom) params.append("expires_from", expiresFrom);
      if (expiresTo) params.append("expires_to", expiresTo);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      console.log("Fetching all filtered contacts for assignment...");
      const allContactsResponse = await fetch(`/api/contacts?${params}`);

      if (!allContactsResponse.ok) {
        throw new Error("Failed to fetch all contacts for assignment");
      }

      const allContactsData = await allContactsResponse.json();
      const allFilteredContacts = allContactsData.contacts || [];
      const contactIds = allFilteredContacts.map((contact: any) => contact.id);

      console.log(
        `Assigning ${contactIds.length} contacts to campaign ${selectedCampaignId}`
      );
      console.log("Selected campaign ID:", selectedCampaignId);
      console.log("Total filtered contacts:", allFilteredContacts.length);
      console.log(
        "Available campaigns:",
        campaigns.map((c: any) => ({ id: c.id, name: c.name }))
      );

      // Call API to assign contacts to campaign
      const response = await fetch(
        `/api/campaigns/${selectedCampaignId}/assign-contacts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contactIds,
            replaceExisting: false, // Add to existing recipients
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to assign contacts to campaign"
        );
      }

      const result = await response.json();
      console.log("Campaign assignment successful:", result);

      // Show success message
      alert(`Successfully assigned ${contactIds.length} contacts to campaign!`);

      // Close modal and reset state
      setShowCampaignModal(false);
      setSelectedCampaignId("");
    } catch (error: any) {
      console.error("Error assigning contacts to campaign:", error);
      alert(
        `Failed to assign contacts: ${error.message || "Please try again."}`
      );
    } finally {
      setIsAssigning(false);
    }
  };

  // Helper function to render sortable header
  const renderSortableHeader = (column: string, label: string) => {
    const isActive = sortBy === column;
    return (
      <th
        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100"
        onClick={() => handleSort(column)}
      >
        <div className="flex items-center space-x-1">
          <span>{label}</span>
          <div className="flex flex-col">
            <ChevronUp
              className={`w-3 h-3 ${
                isActive && sortOrder === "asc"
                  ? "text-blue-600"
                  : "text-gray-400"
              }`}
            />
            <ChevronDown
              className={`w-3 h-3 ${
                isActive && sortOrder === "desc"
                  ? "text-blue-600"
                  : "text-gray-400"
              }`}
            />
          </div>
        </div>
      </th>
    );
  };

  // Helper functions for date calculations
  const calculateDaysUntilExpiry = (
    expiresDate: string | null | undefined
  ): number | null => {
    if (!expiresDate) return null;
    const expiry = new Date(expiresDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const formatShortDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
    });
  };

  // No need for client-side filtering since API handles it
  const filteredContacts = contacts;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "unsubscribed":
        return "bg-red-100 text-red-800";
      case "bounced":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
            <p className="mt-2 text-gray-600">
              Manage your contact database and view detailed information
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Contacts
            </button>
            <button
              onClick={() => setShowGroupModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Tag className="w-4 h-4 mr-2" />
              Manage Groups
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </button>
            <button
              onClick={() => setShowCampaignModal(true)}
              disabled={campaignsLoading || campaigns.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Users className="w-4 h-4 mr-2" />
              {campaignsLoading ? "Loading..." : "Assign All to Campaign"}
            </button>
            <button
              onClick={openAssignGroupModal}
              disabled={selectedContacts.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Tag className="w-4 h-4 mr-2" />
              Assign Group ({selectedContacts.length})
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Contacts
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalContacts}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Contacts
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalContacts}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100">
              <Mail className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">With Email</p>
              <p className="text-2xl font-bold text-gray-900">{emailCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Filters & Search
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Contacts
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or company..."
                  value={searchTerm}
                  onChange={(e) =>
                    handleFilterChange(e.target.value, selectedStatus)
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Group Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => {
                  setSelectedGroup(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Groups</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => handleFilterChange(searchTerm, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="unsubscribed">Unsubscribed</option>
                <option value="bounced">Bounced</option>
              </select>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Expiration Date Range
            </label>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={expiresFrom}
                  onChange={(e) =>
                    handleFilterChange(
                      searchTerm,
                      selectedStatus,
                      e.target.value,
                      expiresTo
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={expiresTo}
                  onChange={(e) =>
                    handleFilterChange(
                      searchTerm,
                      selectedStatus,
                      expiresFrom,
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() =>
                    handleFilterChange(searchTerm, selectedStatus, "", "")
                  }
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear Dates
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white shadow rounded-lg relative">
        {/* Loading Overlay - only show when fetching (not initial load) */}
        {isFetching && !isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">
                Updating contacts...
              </span>
            </div>
          </div>
        )}

        <div className="py-5 sm:py-6">
          <div className="overflow-x-auto">
            <table className="min-w-max divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={
                        filteredContacts.length > 0 &&
                        selectedContacts.length === filteredContacts.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          selectAllContacts();
                        } else {
                          deselectAllContacts();
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  {renderSortableHeader("first_name", "First Name")}
                  {renderSortableHeader("last_name", "Last Name")}
                  {renderSortableHeader("company", "Company")}
                  {renderSortableHeader("phone_number", "Phone")}
                  {renderSortableHeader("email", "Email")}
                  {renderSortableHeader("group", "Group")}
                  {renderSortableHeader("job_type", "Job Type")}
                  {renderSortableHeader("expires", "Expires")}
                  {renderSortableHeader("address", "Address")}
                  {renderSortableHeader("city", "City")}
                  {renderSortableHeader("state", "State")}
                  {renderSortableHeader("zip_code", "Zip")}
                  {renderSortableHeader("last_reminder", "Last Reminder")}
                  {renderSortableHeader("created_at", "Date")}
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="px-6 py-4 text-center">
                      <div className="text-gray-500">
                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p>No contacts found</p>
                        <p className="text-sm">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact: Contact) => {
                    const daysUntilExpiry = calculateDaysUntilExpiry(
                      contact.expires
                    );
                    return (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => toggleContactSelection(contact.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[120px]">
                          {contact.first_name || ""}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[120px]">
                          {contact.last_name || ""}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[150px]">
                          {contact.company || ""}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[130px]">
                          {contact.phone_number}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[200px]">
                          {contact.email || ""}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[120px]">
                          {(() => {
                            const group = groups.find(
                              (g) => g.id === contact.group_id
                            );
                            return group ? group.name : "-";
                          })()}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[100px]">
                          {contact.job_type || ""}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[100px]">
                          {formatShortDate(contact.expires)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[200px]">
                          {contact.address || ""}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[120px]">
                          {contact.city || ""}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[80px]">
                          {contact.state || ""}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[80px]">
                          {contact.zip_code || ""}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[120px]">
                          {formatShortDate(contact.last_reminder)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[100px]">
                          {formatShortDate(contact.created_at)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditContact(contact)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit contact"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteConfirm(contact.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete contact"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-8">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => {
              try {
                setCurrentPage(Math.max(0, currentPage - 1));
              } catch (error) {
                console.error("Error in pagination:", error);
              }
            }}
            disabled={currentPage === 0 || totalPages <= 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => {
              try {
                setCurrentPage(
                  Math.min(Math.max(totalPages - 1, 0), currentPage + 1)
                );
              } catch (error) {
                console.error("Error in pagination:", error);
              }
            }}
            disabled={currentPage >= Math.max(totalPages - 1, 0)}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex}</span> to{" "}
              <span className="font-medium">{endIndex}</span> of{" "}
              <span className="font-medium">{totalContacts}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0 || totalPages <= 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage < 3) {
                  pageNum = i;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNum
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage(
                    Math.min(Math.max(totalPages - 1, 0), currentPage + 1)
                  )
                }
                disabled={currentPage >= Math.max(totalPages - 1, 0)}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Import Contacts
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <ContactImport
                onImportComplete={(result: any) => {
                  try {
                    console.log("Import completed:", result);
                    setShowUploadModal(false);
                    // Refresh the contacts list to show new data
                    if (refetchContacts) {
                      refetchContacts();
                    } else {
                      console.warn("refetchContacts is not available yet");
                    }
                  } catch (error) {
                    console.error("Error in onImportComplete:", error);
                  }
                }}
                onImportStart={() => {
                  try {
                    console.log("Import started");
                  } catch (error) {
                    console.error("Error in onImportStart:", error);
                  }
                }}
                onComplete={() => {
                  try {
                    setShowUploadModal(false);
                  } catch (error) {
                    console.error("Error in onComplete:", error);
                  }
                }}
                onRefetch={() => {
                  try {
                    console.log("Refetching contacts data...");
                    if (refetchContacts) {
                      refetchContacts();
                    } else {
                      console.warn("refetchContacts is not available yet");
                    }
                  } catch (error) {
                    console.error("Error in onRefetch:", error);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Campaign Assignment Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Assign to Campaign
                </h3>
                <button
                  onClick={() => {
                    setShowCampaignModal(false);
                    setSelectedCampaignId("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Assign all {totalContacts} contact
                  {totalContacts !== 1 ? "s" : ""} to a campaign:
                </p>

                <div className="space-y-2">
                  {campaignsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">
                        Loading campaigns...
                      </p>
                    </div>
                  ) : campaigns.length > 0 ? (
                    campaigns.map((campaign: any) => (
                      <label
                        key={campaign.id}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="campaign"
                          value={campaign.id}
                          checked={selectedCampaignId === campaign.id}
                          onChange={(e) =>
                            setSelectedCampaignId(e.target.value)
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {campaign.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {campaign.description || "No description"}
                          </div>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No campaigns available. Create a campaign first.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCampaignModal(false);
                    setSelectedCampaignId("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignToCampaign}
                  disabled={
                    campaignsLoading ||
                    campaigns.length === 0 ||
                    !selectedCampaignId ||
                    isAssigning
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAssigning
                    ? "Assigning..."
                    : campaignsLoading
                    ? "Loading..."
                    : `Assign All ${totalContacts} Contacts`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          if (refetchContacts) {
            refetchContacts();
          }
        }}
      />

      {/* Edit Contact Modal */}
      <EditContactModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedContact(null);
        }}
        onSuccess={() => {
          if (refetchContacts) {
            refetchContacts();
          }
        }}
        contact={selectedContact}
      />

      {/* Groups Management Modal */}
      <GroupsManagementModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
      />

      {/* Assign to Group Modal */}
      {showAssignGroupModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Assign to Group
                </h3>
                <button
                  onClick={() => {
                    setShowAssignGroupModal(false);
                    setSelectedCampaignId("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Assign {selectedContacts.length} selected contact
                  {selectedContacts.length !== 1 ? "s" : ""} to a group:
                </p>

                <div className="space-y-2">
                  {groups.length > 0 ? (
                    groups.map((group: any) => (
                      <label
                        key={group.id}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="group"
                          value={group.id}
                          checked={selectedCampaignId === group.id}
                          onChange={(e) =>
                            setSelectedCampaignId(e.target.value)
                          }
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: group.color }}
                            />
                            <div className="text-sm font-medium text-gray-900">
                              {group.name}
                            </div>
                          </div>
                          {group.description && (
                            <div className="text-sm text-gray-500">
                              {group.description}
                            </div>
                          )}
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No groups available. Create a group first.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAssignGroupModal(false);
                    setSelectedCampaignId("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignToGroup}
                  disabled={
                    groups.length === 0 || !selectedCampaignId || isAssigning
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAssigning
                    ? "Assigning..."
                    : `Assign ${selectedContacts.length} Contact${
                        selectedContacts.length !== 1 ? "s" : ""
                      }`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Contact
                </h3>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setContactToDelete(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete this contact? This action
                  cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setContactToDelete(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (contactToDelete) {
                      handleDeleteContact(contactToDelete);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
