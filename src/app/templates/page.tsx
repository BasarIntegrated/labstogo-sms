"use client";

import TemplateComposer from "@/components/templates/TemplateComposer";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  Copy,
  // Filter,
  Edit,
  Eye,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Smartphone,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface MessageTemplate {
  id?: string;
  name: string;
  description?: string;
  content: string;
  type: "sms" | "email";
  character_count: number;
  parts_estimate: number;
  merge_tags: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Mock data for development
// No mock data - using real API calls

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] =
    useState<MessageTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] =
    useState<MessageTemplate | null>(null);

  // Mock API calls - replace with actual API calls
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["message-templates", searchTerm, selectedType, selectedStatus],
    queryFn: async () => {
      try {
        const response = await fetch("/api/message-templates");
        if (!response.ok) {
          throw new Error("Failed to fetch templates");
        }
        const data = await response.json();
        return data.templates || [];
      } catch (error) {
        console.error("Error fetching templates:", error);
        return [];
      }
    },
  });

  const filteredTemplates = templates.filter((template: MessageTemplate) => {
    const matchesSearch =
      !searchTerm ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === "all" || template.type === selectedType;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && template.is_active) ||
      (selectedStatus === "inactive" && !template.is_active);

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    return type === "sms" ? Smartphone : Mail;
  };

  const getTypeColor = (type: string) => {
    return type === "sms" ? "text-green-600" : "text-blue-600";
  };

  const getTypeBgColor = (type: string) => {
    return type === "sms" ? "bg-green-100" : "bg-blue-100";
  };

  const handlePreview = (template: MessageTemplate) => {
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  };

  const handleCopy = (template: MessageTemplate) => {
    navigator.clipboard.writeText(template.content);
    // You could add a toast notification here
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setShowCreateModal(true);
  };

  const handleSaveTemplate = (template: MessageTemplate) => {
    // Mock save - replace with actual API call
    console.log("Saving template:", template);
    setShowCreateModal(false);
    setEditingTemplate(null);
    // You could add a toast notification here
  };

  const handleCancelEdit = () => {
    setShowCreateModal(false);
    setEditingTemplate(null);
  };

  const getSMSStatusColor = (characterCount: number) => {
    if (characterCount <= 160) return "text-green-600";
    if (characterCount <= 320) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Message Templates
            </h1>
            <p className="mt-2 text-gray-600">
              Create and manage reusable message templates for your campaigns
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Templates
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {templates.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Smartphone className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">SMS Templates</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  templates.filter((t: MessageTemplate) => t.type === "sms")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Email Templates
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  templates.filter((t: MessageTemplate) => t.type === "email")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Templates
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {templates.filter((t: MessageTemplate) => t.is_active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No templates found</p>
            <p className="text-sm text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          filteredTemplates.map((template: MessageTemplate) => {
            const TypeIcon = getTypeIcon(template.type);
            return (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-lg ${getTypeBgColor(
                          template.type
                        )}`}
                      >
                        <TypeIcon
                          className={`h-5 w-5 ${getTypeColor(template.type)}`}
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {template.name}
                        </h3>
                        {template.description && (
                          <p className="text-sm text-gray-500">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {template.is_active ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {template.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {template.type === "sms" && (
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-sm font-medium ${getSMSStatusColor(
                              template.character_count
                            )}`}
                          >
                            {template.character_count} chars
                          </span>
                          <span className="text-sm text-gray-500">
                            ({template.parts_estimate} part
                            {template.parts_estimate > 1 ? "s" : ""})
                          </span>
                        </div>
                      )}
                      {template.merge_tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Tags:</span>
                          <span className="text-xs text-blue-600">
                            {template.merge_tags.slice(0, 2).join(", ")}
                            {template.merge_tags.length > 2 &&
                              ` +${template.merge_tags.length - 2}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      Updated{" "}
                      {template.updated_at
                        ? new Date(template.updated_at).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePreview(template)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCopy(template)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                        title="Copy content"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewTemplate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Preview: {previewTemplate.name}
                </h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    previewTemplate.type === "sms"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {previewTemplate.type.toUpperCase()}
                </div>
                {previewTemplate.type === "sms" && (
                  <div className="mt-2 text-sm text-gray-600">
                    {previewTemplate.character_count} characters •{" "}
                    {previewTemplate.parts_estimate} part
                    {previewTemplate.parts_estimate > 1 ? "s" : ""}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Template Content:
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {previewTemplate.content}
                </p>
              </div>

              {previewTemplate.merge_tags.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Merge Tags:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.merge_tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {`{{${tag}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Handle edit action
                    setShowPreviewModal(false);
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Edit Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Composer Modal */}
      <TemplateComposer
        template={editingTemplate || undefined}
        onSave={handleSaveTemplate}
        onCancel={handleCancelEdit}
        isOpen={showCreateModal}
      />
    </div>
  );
}
