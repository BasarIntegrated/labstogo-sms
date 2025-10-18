"use client";

import {
  useSaveSettings,
  useSettings,
  useTestConnection,
} from "@/hooks/useSettings";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Database,
  Mail,
  MessageSquare,
  RefreshCw,
  Save,
  Settings,
  Shield,
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
  };
  // Email Settings
  email: {
    provider: string;
    smtpHost: string;
    smtpPort: number;
    username: string;
    password: string;
    fromEmail: string;
  };
  // General Settings
  general: {
    appName: string;
    timezone: string;
    dateFormat: string;
    language: string;
  };
  // Notification Settings
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    campaignAlerts: boolean;
    errorAlerts: boolean;
  };
  // Security Settings
  security: {
    sessionTimeout: number;
    requireTwoFactor: boolean;
    allowedDomains: string[];
    maxLoginAttempts: number;
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
  },
  email: {
    provider: "smtp",
    smtpHost: "",
    smtpPort: 587,
    username: "",
    password: "",
    fromEmail: "",
  },
  general: {
    appName: "LabsToGo SMS Blaster",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    language: "en",
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    campaignAlerts: true,
    errorAlerts: true,
  },
  security: {
    sessionTimeout: 30,
    requireTwoFactor: false,
    allowedDomains: [],
    maxLoginAttempts: 5,
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState("general");
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
    { id: "general", label: "General", icon: Settings },
    { id: "sms", label: "SMS", icon: MessageSquare },
    { id: "email", label: "Email", icon: Mail },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
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
              {/* General Settings */}
              {activeTab === "general" && (
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                    General Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application Name
                      </label>
                      <input
                        type="text"
                        value={settings.general.appName}
                        onChange={(e) =>
                          updateSetting("general", "appName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) =>
                          updateSetting("general", "timezone", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">
                          Pacific Time
                        </option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Format
                      </label>
                      <select
                        value={settings.general.dateFormat}
                        onChange={(e) =>
                          updateSetting("general", "dateFormat", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.general.language}
                        onChange={(e) =>
                          updateSetting("general", "language", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

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

                  {/* Sandbox Mode Status */}
                  {settings.sms.sandboxMode && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            Sandbox Mode Active - SMS testing environment
                          </h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">FREE</span>
                              <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                                Sandbox Configuration
                              </span>
                            </div>
                            <p className="mb-2">Current SMS testing settings</p>
                            <div className="space-y-1 text-xs">
                              <div>
                                <strong>From Number:</strong> +15005550006
                              </div>
                              <div>
                                <strong>Cost:</strong> FREE
                              </div>
                            </div>
                            <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
                              <strong>Important:</strong> Only verified phone
                              numbers can receive SMS in sandbox mode.
                              <br />
                              <a
                                href="https://console.twilio.com/us1/develop/sms/try-it-out/send-an-sms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                Verify your number in Twilio Console
                              </a>
                            </div>
                            <div className="mt-2">
                              <strong>Benefits:</strong>
                              <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>No charges for SMS sent</li>
                                <li>Full API functionality</li>
                                <li>Safe testing environment</li>
                                <li>Messages prefixed with [SANDBOX]</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sandbox Mode Toggle */}
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Sandbox Mode
                          </h4>
                          <p className="text-sm text-gray-500">
                            Enable sandbox mode for free SMS testing (only
                            verified numbers)
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settings.email.smtpHost}
                        onChange={(e) =>
                          updateSetting("email", "smtpHost", e.target.value)
                        }
                        placeholder="smtp.gmail.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={settings.email.smtpPort}
                        onChange={(e) =>
                          updateSetting(
                            "email",
                            "smtpPort",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={settings.email.username}
                        onChange={(e) =>
                          updateSetting("email", "username", e.target.value)
                        }
                        placeholder="your-email@gmail.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={settings.email.password}
                        onChange={(e) =>
                          updateSetting("email", "password", e.target.value)
                        }
                        placeholder="App password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Email
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
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === "notifications" && (
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                    Notification Preferences
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Email Notifications
                        </h4>
                        <p className="text-sm text-gray-500">
                          Receive notifications via email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) =>
                            updateSetting(
                              "notifications",
                              "emailNotifications",
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          SMS Notifications
                        </h4>
                        <p className="text-sm text-gray-500">
                          Receive notifications via SMS
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.smsNotifications}
                          onChange={(e) =>
                            updateSetting(
                              "notifications",
                              "smsNotifications",
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Campaign Alerts
                        </h4>
                        <p className="text-sm text-gray-500">
                          Get notified when campaigns complete
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.campaignAlerts}
                          onChange={(e) =>
                            updateSetting(
                              "notifications",
                              "campaignAlerts",
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Error Alerts
                        </h4>
                        <p className="text-sm text-gray-500">
                          Get notified of system errors
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.errorAlerts}
                          onChange={(e) =>
                            updateSetting(
                              "notifications",
                              "errorAlerts",
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                    Security Settings
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) =>
                          updateSetting(
                            "security",
                            "sessionTimeout",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Two-Factor Authentication
                        </h4>
                        <p className="text-sm text-gray-500">
                          Require 2FA for all users
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.security.requireTwoFactor}
                          onChange={(e) =>
                            updateSetting(
                              "security",
                              "requireTwoFactor",
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) =>
                          updateSetting(
                            "security",
                            "maxLoginAttempts",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allowed Domains (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={settings.security.allowedDomains.join(", ")}
                        onChange={(e) =>
                          updateSetting(
                            "security",
                            "allowedDomains",
                            e.target.value.split(", ").filter((d) => d.trim())
                          )
                        }
                        placeholder="company.com, partner.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
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
