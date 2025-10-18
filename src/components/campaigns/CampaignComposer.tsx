"use client";

import { Campaign } from "@/types/database";
import { Eye, Save, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Contact {
  id: string;
  phone_number: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  status: string;
  group_id?: string;
}

interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  contact_count: number;
}

interface MessageTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  type: "sms" | "email";
  character_count: number;
  parts_estimate: number;
  merge_tags: string[];
  is_active: boolean;
}

interface CampaignComposerProps {
  campaign?: Campaign;
  onSave: (campaign: Campaign) => void;
  onCancel: () => void;
  isOpen: boolean;
}

// Default renewal templates
const defaultRenewalTemplates = [
  {
    id: "renewal_30_days",
    name: "30-Day Renewal Reminder",
    description: "Reminder sent 30 days before license expiration",
    content:
      "Hi {first_name}, your {license_type} license expires in {days_until_expiry} days on {license_expiration_date}. Please renew to avoid any interruption in service.",
    type: "sms" as const,
    character_count: 0,
    parts_estimate: 0,
    merge_tags: [
      "{first_name}",
      "{license_type}",
      "{days_until_expiry}",
      "{license_expiration_date}",
    ],
    is_active: true,
  },
  {
    id: "renewal_7_days",
    name: "7-Day Renewal Reminder",
    description: "Urgent reminder sent 7 days before expiration",
    content:
      "URGENT: {first_name}, your {license_type} license expires in {days_until_expiry} days! Renew now at [link] to avoid service interruption.",
    type: "sms" as const,
    character_count: 0,
    parts_estimate: 0,
    merge_tags: ["{first_name}", "{license_type}", "{days_until_expiry}"],
    is_active: true,
  },
  {
    id: "exam_notification",
    name: "Exam Notification",
    description: "Notification for upcoming exams",
    content:
      "Hello {first_name}, your {specialty} exam is scheduled. Please prepare accordingly. Good luck!",
    type: "sms" as const,
    character_count: 0,
    parts_estimate: 0,
    merge_tags: ["{first_name}", "{specialty}"],
    is_active: true,
  },
];

// Available merge tags for renewal campaigns
const renewalMergeTags = [
  "{first_name}",
  "{last_name}",
  "{email}",
  "{phone}",
  "{company}",
  "{license_type}",
  "{license_expiration_date}",
  "{renewal_deadline}",
  "{days_until_expiry}",
  "{specialty}",
  "{last_contact_date}",
  "{group}",
];

// Empty arrays - will be populated by API calls
const mockGroups: ContactGroup[] = [];
const mockContacts: Contact[] = [];

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
    campaign_type: "renewal_reminder",
    status: "draft",
    recipient_type: "all",
    recipient_groups: [],
    recipient_contacts: [],
    scheduled_at: "",
    created_by: "00000000-0000-0000-0000-000000000000", // Mock user ID
  });

  const [selectedTemplate, setSelectedTemplate] =
    useState<MessageTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

  useEffect(() => {
    if (campaign) {
      setFormData(campaign);
      // Find the selected template
      if (campaign.template_id) {
        const template = defaultRenewalTemplates.find(
          (t) => t.id === campaign.template_id
        );
        setSelectedTemplate(template || null);
      }
    } else {
      setFormData({
        name: "",
        description: "",
        message_template: "",
        template_id: "",
        campaign_type: "renewal_reminder",
        status: "draft",
        recipient_type: "all",
        recipient_groups: [],
        recipient_contacts: [],
        scheduled_at: "",
        created_by: "00000000-0000-0000-0000-000000000000",
      });
      setSelectedTemplate(null);
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

  const handleTemplateSelect = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    handleInputChange("template_id", template.id);
    handleInputChange("message_template", template.content);
  };

  const handleRecipientTypeChange = (type: "all" | "groups" | "custom") => {
    handleInputChange("recipient_type", type);
    // Clear selections when changing type
    handleInputChange("recipient_groups", []);
    handleInputChange("recipient_contacts", []);
  };

  const handleGroupToggle = (groupId: string) => {
    const currentGroups = formData.recipient_groups || [];
    const newGroups = currentGroups.includes(groupId)
      ? currentGroups.filter((id) => id !== groupId)
      : [...currentGroups, groupId];
    handleInputChange("recipient_groups", newGroups);
  };

  const handleContactToggle = (contactId: string) => {
    const currentContacts = formData.recipient_contacts || [];
    const newContacts = currentContacts.includes(contactId)
      ? currentContacts.filter((id) => id !== contactId)
      : [...currentContacts, contactId];
    handleInputChange("recipient_contacts", newContacts);
  };

  const generatePreview = () => {
    if (!selectedTemplate) return;

    let preview = selectedTemplate.content;

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

    selectedTemplate.merge_tags.forEach((tag) => {
      const regex = new RegExp(`\\{\\{${tag}\\}\\}`, "g");
      preview = preview.replace(regex, sampleData[tag] || `[${tag}]`);
    });

    setPreviewContent(preview);
    setShowPreview(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.message_template.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    onSave(formData);
  };

  const getRecipientCount = () => {
    switch (formData.recipient_type) {
      case "all":
        return 0; // Will be populated by API calls
      case "groups":
        return (
          formData.recipient_groups?.reduce((total, groupId) => {
            const group = mockGroups.find((g) => g.id === groupId);
            return total + (group?.contact_count || 0);
          }, 0) || 0
        );
      case "custom":
        return formData.recipient_contacts?.length || 0;
      default:
        return 0;
    }
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

              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Template *
                </label>
                <div className="space-y-2">
                  {defaultRenewalTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {template.name}
                          </div>
                          {template.description && (
                            <div className="text-sm text-gray-500">
                              {template.description}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {template.type.toUpperCase()} •{" "}
                          {template.character_count} chars
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recipient Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients
                </label>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="all"
                        checked={formData.recipient_type === "all"}
                        onChange={(e) =>
                          handleRecipientTypeChange(e.target.value as "all")
                        }
                        className="mr-2"
                      />
                      All Contacts (0)
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="groups"
                        checked={formData.recipient_type === "groups"}
                        onChange={(e) =>
                          handleRecipientTypeChange(e.target.value as "groups")
                        }
                        className="mr-2"
                      />
                      Specific Groups
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="custom"
                        checked={formData.recipient_type === "custom"}
                        onChange={(e) =>
                          handleRecipientTypeChange(e.target.value as "custom")
                        }
                        className="mr-2"
                      />
                      Custom Selection
                    </label>
                  </div>

                  {formData.recipient_type === "groups" && (
                    <div className="space-y-2">
                      {mockGroups.map((group) => (
                        <label key={group.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              formData.recipient_groups?.includes(group.id) ||
                              false
                            }
                            onChange={() => handleGroupToggle(group.id)}
                            className="mr-2"
                          />
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: group.color }}
                            />
                            {group.name} ({group.contact_count} contacts)
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {formData.recipient_type === "custom" && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {mockContacts.map((contact) => (
                        <label key={contact.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              formData.recipient_contacts?.includes(
                                contact.id
                              ) || false
                            }
                            onChange={() => handleContactToggle(contact.id)}
                            className="mr-2"
                          />
                          <div>
                            {contact.first_name} {contact.last_name} (
                            {contact.phone_number})
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Scheduling */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="now"
                      checked={!formData.scheduled_at}
                      onChange={() => handleInputChange("scheduled_at", "")}
                      className="mr-2"
                    />
                    Send Now
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="later"
                      checked={!!formData.scheduled_at}
                      onChange={() =>
                        handleInputChange(
                          "scheduled_at",
                          new Date().toISOString()
                        )
                      }
                      className="mr-2"
                    />
                    Schedule Later
                  </label>
                </div>
                {formData.scheduled_at && (
                  <div className="mt-2">
                    <input
                      type="datetime-local"
                      value={
                        formData.scheduled_at
                          ? new Date(formData.scheduled_at)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "scheduled_at",
                          new Date(e.target.value).toISOString()
                        )
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
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
                    <span className="text-gray-600">Recipients:</span>
                    <span className="font-medium">{getRecipientCount()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Template:</span>
                    <span className="font-medium">
                      {selectedTemplate?.name || "None selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">
                      {selectedTemplate?.type.toUpperCase() || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Schedule:</span>
                    <span className="font-medium">
                      {formData.scheduled_at ? "Scheduled" : "Send Now"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Template Preview */}
              {selectedTemplate && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Template Preview
                  </h4>
                  <div className="text-sm text-gray-700 mb-3">
                    {selectedTemplate.content}
                  </div>
                  <button
                    onClick={generatePreview}
                    className="w-full text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Full Preview
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <button
                onClick={generatePreview}
                disabled={!selectedTemplate}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                {campaign ? "Update Campaign" : "Create Campaign"}
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
                  Campaign Preview
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
                    selectedTemplate?.type === "sms"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {selectedTemplate?.type.toUpperCase()}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Message Preview:
                </h4>
                <div className="whitespace-pre-wrap text-sm text-gray-700">
                  {previewContent}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Campaign Details:
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>Recipients: {getRecipientCount()} contacts</div>
                  <div>
                    Schedule: {formData.scheduled_at ? "Scheduled" : "Send Now"}
                  </div>
                  <div>Template: {selectedTemplate?.name}</div>
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
