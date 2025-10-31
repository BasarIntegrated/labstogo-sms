"use client";

import {
  useSaveSettings,
  useSettings,
  useTestConnection,
} from "@/hooks/useSettings";
import {
  AlertTriangle,
  CheckCircle,
  Database,
  Mail,
  MessageSquare,
  RefreshCw,
  Save,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface SystemSettings {
  // SMS Settings
  sms: {
    provider: string;
    accountSid: string;
    authToken: string;
    fromNumber: string;
    rateLimit: number;
    retryAttempts: number;
    sandboxMode: boolean;
    verifiedNumber: string;
    apiKeySid: string;
    apiKeySecret: string;
  };
  // Email Settings (SendGrid)
  email: {
    provider: string;
    sendgridApiKey: string;
    fromEmail: string;
    fromName: string;
    sandboxMode: boolean;
    testEmailAddress: string;
  };
}

const defaultSettings: SystemSettings = {
  sms: {
    provider: "twilio",
    accountSid: "",
    authToken: "",
    fromNumber: "",
    rateLimit: 100,
    retryAttempts: 3,
    sandboxMode: false,
    verifiedNumber: "",
    apiKeySid: "",
    apiKeySecret: "",
  },
  email: {
    provider: "sendgrid",
    sendgridApiKey: "",
    fromEmail: "",
    fromName: "LabsToGo",
    sandboxMode: false,
    testEmailAddress: "",
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState("sms");
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  // React Query hooks
  const { data: fetchedSettings, isLoading, error } = useSettings();
  const saveSettingsMutation = useSaveSettings();
  const testConnectionMutation = useTestConnection();

  useEffect(() => {
    if (fetchedSettings) {
      setSettings(fetchedSettings);
    }
  }, [fetchedSettings]);

  const saveSettings = async () => {
    try {
      await saveSettingsMutation.mutateAsync(settings);
      alert("Settings saved successfully!");
    } catch (error: any) {
      alert(`Error saving settings: ${error.message}`);
    }
  };

  const testConnection = async (type: string) => {
    try {
      setTestResults((prev) => ({ ...prev, [type]: "testing" }));
      const result = await testConnectionMutation.mutateAsync(type);
      setTestResults((prev) => ({
        ...prev,
        [type]: result.success ? "success" : "error",
      }));
    } catch (error) {
      setTestResults((prev) => ({ ...prev, [type]: "error" }));
    }
  };

  const updateSetting = (
    section: keyof SystemSettings,
    key: string,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const tabs = [
    { id: "sms", label: "SMS", icon: MessageSquare },
    { id: "email", label: "Email", icon: Mail },
    { id: "database", label: "Database", icon: Database },
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="lg:col-span-3">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure your SMS blaster system settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {/* SMS Settings */}
              {activeTab === "sms" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      SMS Provider Settings
                    </h3>
                    <button
                      onClick={() => testConnection("sms")}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Test Connection
                      {testResults.sms === "testing" && (
                        <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                      )}
                      {testResults.sms === "success" && (
                        <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
                      )}
                      {testResults.sms === "error" && (
                        <XCircle className="w-4 h-4 ml-2 text-red-500" />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sandbox Mode Toggle */}
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Sandbox Mode
                          </h4>
                          <p className="text-sm text-gray-500">
                            Enable sandbox mode to route all SMS to your
                            Verified Number (catch-all). Adds [SANDBOX] and
                            [TEST] prefixes and prevents real sends.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.sms.sandboxMode}
                            onChange={(e) =>
                              updateSetting(
                                "sms",
                                "sandboxMode",
                                e.target.checked
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provider
                      </label>
                      <select
                        value={settings.sms.provider}
                        onChange={(e) =>
                          updateSetting("sms", "provider", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="twilio">Twilio</option>
                        <option value="aws-sns">AWS SNS</option>
                        <option value="sendgrid">SendGrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Number
                      </label>
                      <input
                        type="tel"
                        value={settings.sms.fromNumber}
                        onChange={(e) =>
                          updateSetting("sms", "fromNumber", e.target.value)
                        }
                        placeholder="+1234567890"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account SID
                      </label>
                      <input
                        type="password"
                        value={settings.sms.accountSid}
                        onChange={(e) =>
                          updateSetting("sms", "accountSid", e.target.value)
                        }
                        placeholder="Your Twilio Account SID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auth Token
                      </label>
                      <input
                        type="password"
                        value={settings.sms.authToken}
                        onChange={(e) =>
                          updateSetting("sms", "authToken", e.target.value)
                        }
                        placeholder="Your Twilio Auth Token"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate Limit (messages/minute)
                      </label>
                      <input
                        type="number"
                        value={settings.sms.rateLimit}
                        onChange={(e) =>
                          updateSetting(
                            "sms",
                            "rateLimit",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retry Attempts
                      </label>
                      <input
                        type="number"
                        value={settings.sms.retryAttempts}
                        onChange={(e) =>
                          updateSetting(
                            "sms",
                            "retryAttempts",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verified Number
                      </label>
                      <input
                        type="tel"
                        value={settings.sms.verifiedNumber}
                        onChange={(e) =>
                          updateSetting("sms", "verifiedNumber", e.target.value)
                        }
                        placeholder="+639064763851"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Verified phone number for sandbox mode
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key SID (Optional)
                      </label>
                      <input
                        type="password"
                        value={settings.sms.apiKeySid}
                        onChange={(e) =>
                          updateSetting("sms", "apiKeySid", e.target.value)
                        }
                        placeholder="SK..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Optional: Use API Key instead of Auth Token (starts with
                        SK)
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key Secret (Optional)
                      </label>
                      <input
                        type="password"
                        value={settings.sms.apiKeySecret}
                        onChange={(e) =>
                          updateSetting("sms", "apiKeySecret", e.target.value)
                        }
                        placeholder="API Key Secret"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Required if using API Key authentication
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Settings */}
              {activeTab === "email" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Email Settings
                    </h3>
                    <button
                      onClick={() => testConnection("email")}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Test Connection
                      {testResults.email === "testing" && (
                        <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                      )}
                      {testResults.email === "success" && (
                        <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
                      )}
                      {testResults.email === "error" && (
                        <XCircle className="w-4 h-4 ml-2 text-red-500" />
                      )}
                    </button>
                  </div>
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>SendGrid Integration:</strong> Email campaigns use
                      SendGrid API for delivery. Enter your SendGrid API key
                      below.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SendGrid API Key <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={settings.email.sendgridApiKey}
                        onChange={(e) =>
                          updateSetting(
                            "email",
                            "sendgridApiKey",
                            e.target.value
                          )
                        }
                        placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Get your API key from{" "}
                        <a
                          href="https://app.sendgrid.com/settings/api_keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          SendGrid API Keys
                        </a>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={settings.email.fromEmail}
                        onChange={(e) =>
                          updateSetting("email", "fromEmail", e.target.value)
                        }
                        placeholder="noreply@yourdomain.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Must be verified in SendGrid
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Name
                      </label>
                      <input
                        type="text"
                        value={settings.email.fromName}
                        onChange={(e) =>
                          updateSetting("email", "fromName", e.target.value)
                        }
                        placeholder="LabsToGo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Email Sandbox Mode
                          </h4>
                          <p className="text-sm text-gray-500">
                            Route all emails to the Test Email Address
                            (catch-all). Adds [SANDBOX - Original: address] to
                            the subject.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.email.sandboxMode}
                            onChange={(e) =>
                              updateSetting(
                                "email",
                                "sandboxMode",
                                e.target.checked
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Email Address
                      </label>
                      <input
                        type="email"
                        value={settings.email.testEmailAddress}
                        onChange={(e) =>
                          updateSetting(
                            "email",
                            "testEmailAddress",
                            e.target.value
                          )
                        }
                        placeholder="roel.abasa@gmail.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Email address for sandbox mode testing
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Database Settings */}
              {activeTab === "database" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Database Settings
                    </h3>
                    <button
                      onClick={() => testConnection("database")}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Test Connection
                      {testResults.database === "testing" && (
                        <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                      )}
                      {testResults.database === "success" && (
                        <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
                      )}
                      {testResults.database === "error" && (
                        <XCircle className="w-4 h-4 ml-2 text-red-500" />
                      )}
                    </button>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Database Configuration
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>
                            Database settings are configured through environment
                            variables and Supabase. Contact your system
                            administrator to modify these settings.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Database Type
                      </label>
                      <input
                        type="text"
                        value="PostgreSQL (Supabase)"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Connection Status
                      </label>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-700">Connected</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <button
                    onClick={saveSettings}
                    disabled={saveSettingsMutation.isPending}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveSettingsMutation.isPending
                      ? "Saving..."
                      : "Save Settings"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
