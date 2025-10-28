"use client";

import { Campaign } from "@/types/database";
import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 animate-pulse" />,
});

interface CampaignComposerProps {
  campaign?: Campaign;
  onSave: (campaign: Campaign) => void;
  onCancel: () => void;
  isOpen: boolean;
}

// Available merge tags for campaigns
const availableMergeTags = [
  "{first_name}",
  "{last_name}",
  "{email}",
  "{phone_number}",
  "{company_name}",
  "{message_content}",
  "{custom_message}",
  "{appointment_date}",
  "{appointment_time}",
  "{group_name}",
  "{contact_id}",
  "{expiry_date}",
  "{expiry_time}",
  "{days_until_expiry}",
  "{license_type}",
  "{license_number}",
  "{renewal_deadline}",
];

export default function CampaignComposer({
  campaign,
  onSave,
  onCancel,
  isOpen,
}: CampaignComposerProps) {
  const [formData, setFormData] = useState<Campaign>({
    name: "",
    description: "",
    message_template: "",
    template_id: "",
    campaign_type: "general",
    status: "draft",
    recipient_type: "all",
    recipient_groups: [],
    recipient_contacts: [],
    scheduled_at: "",
    created_by: "", // Will be set by the API
  });

  useEffect(() => {
    if (campaign) {
      setFormData(campaign);
    } else {
      setFormData({
        name: "",
        description: "",
        message_template: "",
        template_id: "",
        campaign_type: "general",
        status: "draft",
        recipient_type: "all",
        recipient_groups: [],
        recipient_contacts: [],
        scheduled_at: "",
        created_by: "", // Will be set by the API
      });
    }
  }, [campaign]);

  const handleInputChange = (
    field: keyof Campaign,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInsertMergeTag = (tag: string) => {
    const currentText = formData.message_template;
    handleInputChange("message_template", currentText + tag);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.message_template.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {campaign ? "Edit Campaign" : "Create New Campaign"}
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
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter campaign name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Type *
                  </label>
                  <select
                    value={formData.campaign_type}
                    onChange={(e) =>
                      handleInputChange("campaign_type", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="general">SMS Campaign</option>
                    <option value="appointment_reminder">
                      Appointment Reminder (SMS)
                    </option>
                    <option value="custom">Custom (SMS)</option>
                    <option value="email">Email Campaign</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter campaign description"
                  />
                </div>
              </div>

              {/* Message Template Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.campaign_type === "email"
                    ? "Email Content (HTML) *"
                    : "Message Template *"}
                </label>
                {formData.campaign_type === "email" ? (
                  <div className="border border-gray-300 rounded-md overflow-hidden">
                    <MonacoEditor
                      height="400px"
                      language="html"
                      value={formData.message_template}
                      onChange={(value) =>
                        handleInputChange("message_template", value || "")
                      }
                      theme="vs-light"
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        wordWrap: "on",
                        formatOnPaste: true,
                        formatOnType: true,
                        tabSize: 2,
                      }}
                    />
                  </div>
                ) : (
                  <textarea
                    value={formData.message_template}
                    onChange={(e) =>
                      handleInputChange("message_template", e.target.value)
                    }
                    placeholder="Enter your message template here. Use {first_name}, {last_name}, {company_name}, etc. for personalization."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
                <div className="mt-2 text-sm text-gray-500">
                  <p className="mb-1">Available merge tags (click to insert):</p>
                  <div className="flex flex-wrap gap-2">
                    {availableMergeTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs cursor-pointer hover:bg-gray-200"
                        onClick={() => handleInsertMergeTag(tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Character count: {formData.message_template.length} characters
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Campaign Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Campaign Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Template:</span>
                    <span className="font-medium">
                      {formData.message_template ? "Custom Template" : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Characters:</span>
                    <span className="font-medium">
                      {formData.message_template.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Preview */}
              {formData.message_template && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Message Preview
                  </h4>
                  <div className="text-sm text-gray-700 mb-3 bg-white p-3 rounded border">
                    {formData.message_template
                      .replace(/\{first_name\}/g, "John")
                      .replace(/\{last_name\}/g, "Doe")
                      .replace(/\{company_name\}/g, "Acme Corp")
                      .replace(/\{email\}/g, "john.doe@example.com")
                      .replace(/\{phone_number\}/g, "+1234567890")
                      .replace(
                        /\{message_content\}/g,
                        "Thank you for your business!"
                      )
                      .replace(
                        /\{custom_message\}/g,
                        "This is a custom message"
                      )
                      .replace(/\{appointment_date\}/g, "2024-12-15")
                      .replace(/\{appointment_time\}/g, "2:00 PM")
                      .replace(/\{group_name\}/g, "VIP Customers")
                      .replace(/\{contact_id\}/g, "12345")}
                  </div>
                  <div className="text-xs text-gray-500">
                    Preview with sample data
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                Character count: {formData.message_template.length}
              </div>
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
                {campaign ? "Update Campaign" : "Create Campaign"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
