import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface SystemSettings {
  sms: {
    provider: string;
    accountSid: string;
    authToken: string;
    fromNumber: string;
    rateLimit: number;
    retryAttempts: number;
    sandboxMode: boolean;
  };
  email: {
    provider: string;
    smtpHost: string;
    smtpPort: number;
    username: string;
    password: string;
    fromEmail: string;
  };
  general: {
    appName: string;
    timezone: string;
    dateFormat: string;
    language: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    campaignAlerts: boolean;
    errorAlerts: boolean;
  };
  security: {
    sessionTimeout: number;
    requireTwoFactor: boolean;
    allowedDomains: string[];
    maxLoginAttempts: number;
  };
}

export function useSettings() {
  return useQuery<SystemSettings>({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      const data = await response.json();
      return data.settings;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: SystemSettings) => {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save settings");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useTestConnection() {
  return useMutation({
    mutationFn: async (type: string) => {
      const response = await fetch(`/api/settings/test/${type}`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Connection test failed");
      }

      return response.json();
    },
  });
}
