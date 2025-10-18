"use client";

import { Eye, Mail, Save, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";

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
}

interface TemplateComposerProps {
  template?: MessageTemplate;
  onSave: (template: MessageTemplate) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const AVAILABLE_MERGE_TAGS = [
  {
    tag: "first_name",
    label: "First Name",
    description: "Contact's first name",
  },
  { tag: "last_name", label: "Last Name", description: "Contact's last name" },
  {
    tag: "phone_number",
    label: "Phone Number",
    description: "Contact's phone number",
  },
  {
    tag: "email",
    label: "Email Address",
    description: "Contact's email address",
  },
  { tag: "company", label: "Company", description: "Contact's company name" },
  { tag: "group", label: "Group", description: "Contact's group name" },
  {
    tag: "license_expiration_date",
    label: "License Expiration",
    description: "License expiration date",
  },
  { tag: "others", label: "Others", description: "Additional information" },
];

export default function TemplateComposer({
  template,
  onSave,
  onCancel,
  isOpen,
}: TemplateComposerProps) {
  const [formData, setFormData] = useState<MessageTemplate>({
    name: "",
    description: "",
    content: "",
    type: "sms",
    character_count: 0,
    parts_estimate: 1,
    merge_tags: [],
    is_active: true,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

  useEffect(() => {
    if (template) {
      setFormData(template);
    } else {
      setFormData({
        name: "",
        description: "",
        content: "",
        type: "sms",
        character_count: 0,
        parts_estimate: 1,
        merge_tags: [],
        is_active: true,
      });
    }
  }, [template]);

  useEffect(() => {
    // Update character count and parts estimate when content changes
    const characterCount = formData.content.length;
    let partsEstimate = 1;

    if (formData.type === "sms") {
      partsEstimate = Math.ceil(characterCount / 160);
    }

    // Extract merge tags from content
    const mergeTags = extractMergeTags(formData.content);

    setFormData((prev) => ({
      ...prev,
      character_count: characterCount,
      parts_estimate: partsEstimate,
      merge_tags: mergeTags,
    }));
  }, [formData.content, formData.type]);

  const extractMergeTags = (content: string): string[] => {
    const mergeTagRegex = /\{\{(\w+)\}\}/g;
    const tags: string[] = [];
    let match;

    while ((match = mergeTagRegex.exec(content)) !== null) {
      const tag = match[1];
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }

    return tags;
  };

  const handleInputChange = (
    field: keyof MessageTemplate,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const insertMergeTag = (tag: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.content;
      const newText =
        text.substring(0, start) + `{{${tag}}}` + text.substring(end);

      handleInputChange("content", newText);

      // Set cursor position after the inserted tag
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + tag.length + 4,
          start + tag.length + 4
        );
      }, 0);
    }
  };

  const generatePreview = () => {
    let preview = formData.content;

    // Replace merge tags with sample data
    const sampleData: Record<string, string> = {
      first_name: "John",
      last_name: "Doe",
      phone_number: "+1234567890",
      email: "john.doe@example.com",
      company: "Acme Corp",
      group: "VIP Customers",
      license_expiration_date: "2024-12-31",
      others: "Additional info",
    };

    formData.merge_tags.forEach((tag) => {
      const regex = new RegExp(`\\{\\{${tag}\\}\\}`, "g");
      preview = preview.replace(regex, sampleData[tag] || `[${tag}]`);
    });

    setPreviewContent(preview);
    setShowPreview(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    onSave(formData);
  };

  const getSMSStatusColor = () => {
    if (formData.character_count <= 160) return "text-green-600";
    if (formData.character_count <= 320) return "text-yellow-600";
    return "text-red-600";
  };

  const getSMSStatusBg = () => {
    if (formData.character_count <= 160) return "bg-green-100";
    if (formData.character_count <= 320) return "bg-yellow-100";
    return "bg-red-100";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {template ? "Edit Template" : "Create New Template"}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter template name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter template description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="sms"
                        checked={formData.type === "sms"}
                        onChange={(e) =>
                          handleInputChange("type", e.target.value)
                        }
                        className="mr-2"
                      />
                      <Smartphone className="w-4 h-4 mr-1" />
                      SMS
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="email"
                        checked={formData.type === "email"}
                        onChange={(e) =>
                          handleInputChange("type", e.target.value)
                        }
                        className="mr-2"
                      />
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </label>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Message Content *
                  </label>
                  {formData.type === "sms" && (
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getSMSStatusBg()} ${getSMSStatusColor()}`}
                    >
                      {formData.character_count} chars •{" "}
                      {formData.parts_estimate} part
                      {formData.parts_estimate > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your message content. Use {{tag_name}} for merge tags."
                />
              </div>

              {/* Merge Tags Used */}
              {formData.merge_tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Merge Tags Used
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.merge_tags.map((tag) => (
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Available Merge Tags */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Available Merge Tags
                </h4>
                <div className="space-y-2">
                  {AVAILABLE_MERGE_TAGS.map((tag) => (
                    <button
                      key={tag.tag}
                      onClick={() => insertMergeTag(tag.tag)}
                      className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md border border-gray-200 hover:border-blue-300 transition-colors"
                      title={tag.description}
                    >
                      <div className="font-medium">{tag.label}</div>
                      <div className="text-xs text-gray-500">{`{{${tag.tag}}}`}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Template Stats
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Characters:</span>
                    <span className="font-medium">
                      {formData.character_count}
                    </span>
                  </div>
                  {formData.type === "sms" && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">SMS Parts:</span>
                      <span className="font-medium">
                        {formData.parts_estimate}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Merge Tags:</span>
                    <span className="font-medium">
                      {formData.merge_tags.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <button
                onClick={generatePreview}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {template ? "Update Template" : "Create Template"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-60">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Template Preview
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    formData.type === "sms"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {formData.type.toUpperCase()}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Preview:
                </h4>
                <div className="whitespace-pre-wrap text-sm text-gray-700">
                  {previewContent}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
