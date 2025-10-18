"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from "@/components/ui";
import { MessageSquare, Save } from "lucide-react";
import { useState } from "react";

interface SimpleCampaignBuilderProps {
  onSave: (campaign: SimpleCampaign) => void;
  patientsCount?: number;
  initialData?: SimpleCampaign;
}

interface SimpleCampaign {
  name: string;
  description: string;
  message_template: string;
  status: string;
}

export default function SimpleCampaignBuilder({
  onSave,
  patientsCount = 0,
  initialData,
}: SimpleCampaignBuilderProps) {
  const [campaign, setCampaign] = useState<SimpleCampaign>(
    initialData || {
      name: "",
      description: "",
      message_template: "",
      status: "draft",
    }
  );

  const handleSave = () => {
    if (!campaign.name.trim()) {
      alert("Please enter a campaign name");
      return;
    }
    if (!campaign.message_template.trim()) {
      alert("Please enter a message template");
      return;
    }
    onSave(campaign);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {initialData ? "Edit Campaign" : "Create New Campaign"}
        </h1>
        <p className="text-gray-600">
          {patientsCount.toLocaleString()} total patients • ~
          {Math.round(patientsCount * 0.3).toLocaleString()} eligible
        </p>
      </div>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Create your SMS campaign with the essential information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Campaign Name */}
          <div>
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              value={campaign.name}
              onChange={(e) =>
                setCampaign((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="e.g., Q1 Medical License Renewals"
              className="mt-1"
            />
          </div>

          {/* Description */}
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
              className="mt-1"
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={campaign.status}
              onChange={(e) =>
                setCampaign((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
              className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Message Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Message Template *</span>
          </CardTitle>
          <CardDescription>
            Use variables like {"{{ first_name }}"}, {"{{ license_number }}"},{" "}
            {"{{ renewal_deadline }}"}
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
            rows={6}
            className="font-mono text-sm"
          />
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Available Variables:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
              <div>• {"{{ first_name }}"} - Patient's first name</div>
              <div>• {"{{ last_name }}"} - Patient's last name</div>
              <div>• {"{{ license_type }}"} - Medical, Nursing, etc.</div>
              <div>• {"{{ license_number }}"} - License number</div>
              <div>• {"{{ renewal_deadline }}"} - Renewal deadline date</div>
              <div>• {"{{ days_until_renewal }}"} - Days until renewal</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end space-x-3">
        <Button onClick={handleSave} className="flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>{initialData ? "Update Campaign" : "Save Campaign"}</span>
        </Button>
      </div>
    </div>
  );
}
