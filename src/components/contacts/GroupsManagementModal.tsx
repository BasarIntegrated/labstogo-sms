"use client";

import { Edit, Plus, Tag, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  contact_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface GroupsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GroupsManagementModal({
  isOpen,
  onClose,
}: GroupsManagementModalProps) {
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
  });

  const fetchGroups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/groups");
      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      setError(error.message || "Failed to load groups");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      setError("Group name is required");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Creating group with data:", formData);
      
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to create group");
      }

      const result = await response.json();
      console.log("Group created successfully:", result);
      
      await fetchGroups();
      setShowCreateModal(false);
      setFormData({ name: "", description: "", color: "#3B82F6" });
      setError(null);
    } catch (error: any) {
      console.error("Error creating group:", error);
      setError(error.message || "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (group: ContactGroup) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      color: group.color,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedGroup || !formData.name.trim()) {
      setError("Group name is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/groups", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedGroup.id,
          name: formData.name,
          description: formData.description,
          color: formData.color,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update group");
      }

      await fetchGroups();
      setShowEditModal(false);
      setSelectedGroup(null);
      setFormData({ name: "", description: "", color: "#3B82F6" });
      setError(null);
    } catch (error: any) {
      console.error("Error updating group:", error);
      setError(error.message || "Failed to update group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups?id=${groupId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete group");
      }

      await fetchGroups();
      setShowDeleteConfirm(false);
      setGroupToDelete(null);
      setError(null);
    } catch (error: any) {
      console.error("Error deleting group:", error);
      setError(error.message || "Failed to delete group");
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteConfirm = (groupId: string) => {
    setGroupToDelete(groupId);
    setShowDeleteConfirm(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-900">
            Manage Groups
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => {
              setFormData({ name: "", description: "", color: "#3B82F6" });
              setShowCreateModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </button>
        </div>

        {/* Groups List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-8">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No groups found</p>
            <p className="text-sm text-gray-400">
              Create your first group to get started
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{group.name}</p>
                    {group.description && (
                      <p className="text-sm text-gray-500">
                        {group.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {group.contact_count} contact
                      {group.contact_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(group)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit group"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteConfirm(group.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete group"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-60 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h4 className="text-lg font-semibold mb-4">Create New Group</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Group name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    placeholder="Group description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({
                        name: "",
                        description: "",
                        color: "#3B82F6",
                      });
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-60 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h4 className="text-lg font-semibold mb-4">Edit Group</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Group name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    placeholder="Group description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedGroup(null);
                      setFormData({
                        name: "",
                        description: "",
                        color: "#3B82F6",
                      });
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-60 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h4 className="text-lg font-semibold mb-4">Delete Group</h4>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this group? This action cannot
                be undone.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setGroupToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (groupToDelete) {
                      handleDelete(groupToDelete);
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
