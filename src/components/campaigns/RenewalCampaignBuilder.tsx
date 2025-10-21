"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/ui";
import {
  Clock,
  MessageSquare,
  Play,
  Save,
  Settings,
  Users,
} from "lucide-react";
import { useState } from "react";

interface RenewalCampaignBuilderProps {
  onSave: (campaign: RenewalCampaign) => void;
  onPreview: (campaign: RenewalCampaign) => void;
  onSchedule: (campaign: RenewalCampaign) => void;
  templates?: RenewalCampaignTemplate[];
  contactsCount?: number;
  initialData?: RenewalCampaign;
}

interface RenewalCampaign {
  name: string;
  description: string;
  campaign_type:
    | "renewal_reminder"
    | "exam_notification"
    | "general"
    | "custom";
  message_template: string;
  renewal_deadline_start: string;
  renewal_deadline_end: string;
  license_types: string[];
  specialties: string[];
  reminder_frequency: "daily" | "weekly" | "monthly";
  max_reminders: number;
  scheduled_at?: string;
}

interface RenewalCampaignTemplate {
  id: string;
  name: string;
  description: string;
  campaign_type: "renewal_reminder" | "exam_notification";
  message_template: string;
  license_types: string[];
  specialties: string[];
  days_before_renewal: number[];
  reminder_frequency: "daily" | "weekly" | "monthly";
  max_reminders: number;
}

const LICENSE_TYPES = ["Medical", "Nursing", "Pharmacy", "Dental", "Other"];
const SPECIALTIES = [
  "Cardiology",
  "Emergency Medicine",
  "Family Medicine",
  "Internal Medicine",
  "Pediatrics",
  "Surgery",
  "Anesthesiology",
  "Radiology",
  "Pathology",
  "Emergency Nursing",
  "Critical Care",
  "Pediatric Nursing",
  "Oncology Nursing",
  "Clinical Pharmacy",
  "Hospital Pharmacy",
  "Community Pharmacy",
];

const DEFAULT_TEMPLATES: RenewalCampaignTemplate[] = [
  {
    id: "medical-renewal",
    name: "Medical License Renewal",
    description: "Standard reminder for medical license renewals",
    campaign_type: "renewal_reminder",
    message_template:
      "Hi {{first_name}}, your medical license ({{license_number}}) expires on {{renewal_deadline}}. Please renew to avoid any interruption in practice. Reply STOP to opt out.",
    license_types: ["Medical"],
    specialties: [],
    days_before_renewal: [90, 60, 30, 14, 7],
    reminder_frequency: "weekly",
    max_reminders: 5,
  },
  {
    id: "urgent-renewal",
    name: "Urgent License Renewal",
    description: "Urgent reminder for licenses expiring soon",
    campaign_type: "renewal_reminder",
    message_template:
      "URGENT: {{first_name}}, your {{license_type}} license ({{license_number}}) expires in {{days_until_renewal}} days on {{renewal_deadline}}. Renew immediately! Reply STOP to opt out.",
    license_types: ["Medical", "Nursing", "Pharmacy", "Dental"],
    specialties: [],
    days_before_renewal: [7, 3, 1],
    reminder_frequency: "daily",
    max_reminders: 3,
  },
];

export default function RenewalCampaignBuilder({
  onSave,
  onPreview,
  onSchedule,
  templates = DEFAULT_TEMPLATES,
  contactsCount = 0,
  initialData,
}: RenewalCampaignBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [campaign, setCampaign] = useState<RenewalCampaign>(
    initialData || {
      name: "",
      description: "",
      campaign_type: "renewal_reminder",
      message_template: "",
      renewal_deadline_start: "",
      renewal_deadline_end: "",
      license_types: [],
      specialties: [],
      reminder_frequency: "weekly",
      max_reminders: 3,
    }
  );

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setCampaign({
        ...campaign,
        name: template.name,
        description: template.description,
        campaign_type: template.campaign_type,
        message_template: template.message_template,
        license_types: template.license_types,
        specialties: template.specialties,
        reminder_frequency: template.reminder_frequency,
        max_reminders: template.max_reminders,
      });
      setSelectedTemplate(templateId);
    }
  };

  const handleLicenseTypeToggle = (licenseType: string) => {
    setCampaign((prev) => ({
      ...prev,
      license_types: prev.license_types.includes(licenseType)
        ? prev.license_types.filter((t) => t !== licenseType)
        : [...prev.license_types, licenseType],
    }));
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setCampaign((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const estimatedRecipients = Math.floor(contactsCount * 0.3); // Rough estimate

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Renewal Campaign Builder
          </h2>
          <p className="text-gray-600">
            Create targeted SMS campaigns for license renewals
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{contactsCount} total contacts</span>
          <span>•</span>
          <span>~{estimatedRecipients} eligible</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Campaign Template</span>
              </CardTitle>
              <CardDescription>
                Choose a pre-built template or create a custom campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template">Select Template</Label>
                <Select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                >
                  <option value="">Choose a template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                  <option value="custom">Custom Campaign</option>
                </Select>
              </div>

              {selectedTemplate && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    {templates.find((t) => t.id === selectedTemplate)?.name}
                  </h4>
                  <p className="text-sm text-blue-700">
                    {
                      templates.find((t) => t.id === selectedTemplate)
                        ?.description
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Campaign Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={campaign.name}
                    onChange={(e) =>
                      setCampaign((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Q1 Medical License Renewals"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Campaign Type</Label>
                  <Select
                    value={campaign.campaign_type}
                    onChange={(e) =>
                      setCampaign((prev) => ({
                        ...prev,
                        campaign_type: e.target.value as
                          | "renewal_reminder"
                          | "exam_notification"
                          | "general"
                          | "custom",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="renewal_reminder">
                        Renewal Reminder
                      </SelectItem>
                      <SelectItem value="exam_notification">
                        Exam Notification
                      </SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={campaign.description}
                  onChange={(e) =>
                    setCampaign((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of this campaign..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Message Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Message Template</span>
              </CardTitle>
              <CardDescription>
                Use variables like {"{{ first_name }}"},{" "}
                {"{{ license_number }}"}, {"{{ renewal_deadline }}"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={campaign.message_template}
                onChange={(e) =>
                  setCampaign((prev) => ({
                    ...prev,
                    message_template: e.target.value,
                  }))
                }
                placeholder="Enter your SMS message template..."
                rows={4}
                className="font-mono text-sm"
              />
              <div className="mt-2 text-xs text-gray-500">
                Available variables: {"{{ first_name }}"}, {"{{ last_name }}"},{" "}
                {"{{ license_type }}"}, {"{{ license_number }}"},{" "}
                {"{{ renewal_deadline }}"}, {"{{ days_until_renewal }}"}
              </div>
            </CardContent>
          </Card>

          {/* Targeting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Targeting</span>
              </CardTitle>
              <CardDescription>
                Select which contacts to include in this campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* License Types */}
              <div>
                <Label className="text-sm font-medium">License Types</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {LICENSE_TYPES.map((licenseType) => (
                    <div
                      key={licenseType}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`license-${licenseType}`}
                        checked={campaign.license_types.includes(licenseType)}
                        onChange={() => handleLicenseTypeToggle(licenseType)}
                      />
                      <Label
                        htmlFor={`license-${licenseType}`}
                        className="text-sm"
                      >
                        {licenseType}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              <div>
                <Label className="text-sm font-medium">Specialties</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SPECIALTIES.map((specialty) => (
                    <div
                      key={specialty}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`specialty-${specialty}`}
                        checked={campaign.specialties.includes(specialty)}
                        onChange={() => handleSpecialtyToggle(specialty)}
                      />
                      <Label
                        htmlFor={`specialty-${specialty}`}
                        className="text-sm"
                      >
                        {specialty}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Renewal Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Renewal Deadline Start</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={campaign.renewal_deadline_start}
                    onChange={(e) =>
                      setCampaign((prev) => ({
                        ...prev,
                        renewal_deadline_start: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">Renewal Deadline End</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={campaign.renewal_deadline_end}
                    onChange={(e) =>
                      setCampaign((prev) => ({
                        ...prev,
                        renewal_deadline_end: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Settings & Actions */}
        <div className="space-y-6">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="frequency">Reminder Frequency</Label>
                <Select
                  value={campaign.reminder_frequency}
                  onChange={(e) =>
                    setCampaign((prev) => ({
                      ...prev,
                      reminder_frequency: e.target.value as
                        | "daily"
                        | "weekly"
                        | "monthly",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="max-reminders">Max Reminders</Label>
                <Input
                  id="max-reminders"
                  type="number"
                  min="1"
                  max="10"
                  value={campaign.max_reminders}
                  onChange={(e) =>
                    setCampaign((prev) => ({
                      ...prev,
                      max_reminders: parseInt(e.target.value) || 3,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="schedule">Schedule Campaign</Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  value={campaign.scheduled_at}
                  onChange={(e) =>
                    setCampaign((prev) => ({
                      ...prev,
                      scheduled_at: e.target.value,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Campaign Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <Badge variant="outline">{campaign.campaign_type}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Frequency:</span>
                <span className="text-sm">{campaign.reminder_frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Max Reminders:</span>
                <span className="text-sm">{campaign.max_reminders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">License Types:</span>
                <span className="text-sm">{campaign.license_types.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Specialties:</span>
                <span className="text-sm">{campaign.specialties.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button
                  onClick={() => onPreview(campaign)}
                  variant="outline"
                  className="w-full"
                >
                  Preview Campaign
                </Button>
                <Button
                  onClick={() => onSave(campaign)}
                  variant="outline"
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={() => onSchedule(campaign)} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Schedule Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
