"use client";

import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { useSettings } from "@/hooks/useSettings";
import {
  CheckCircle,
  DollarSign,
  ExternalLink,
  Info,
  Phone,
  TestTube,
  XCircle,
} from "lucide-react";

interface SandboxStatusProps {
  className?: string;
}

export default function SandboxStatus({ className }: SandboxStatusProps) {
  const { data: settings, isLoading } = useSettings();

  // Check if sandbox mode is enabled from settings or environment
  const isSandboxMode =
    settings?.sms?.sandboxMode ||
    process.env.NODE_ENV === "development" ||
    (typeof window !== "undefined" && window.location.hostname === "localhost");

  // Show loading state briefly, then show sandbox status if enabled
  if (isLoading) {
    return (
      <div className={className}>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-blue-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-blue-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isSandboxMode) {
    return null;
  }

  return (
    <div className={className}>
      <Alert className="border-blue-200 bg-blue-50">
        <TestTube className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <strong>Sandbox Mode Active</strong> - SMS testing environment
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-300">
              FREE
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Info className="w-4 h-4" />
            <span>Sandbox Configuration</span>
          </CardTitle>
          <CardDescription>Current SMS testing settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-medium">From Number</div>
                <div className="text-gray-600">+15005550006</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-medium">Cost</div>
                <div className="text-gray-600">FREE</div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <XCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <div className="font-medium">Important:</div>
                <div>
                  Only verified phone numbers can receive SMS in sandbox mode.
                </div>
                <div className="mt-1">
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-yellow-700 underline"
                    onClick={() =>
                      window.open(
                        "https://console.twilio.com/us1/develop/sms/try-it-out/send-an-sms",
                        "_blank"
                      )
                    }
                  >
                    Verify your number in Twilio Console
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <div className="font-medium">Benefits:</div>
                <ul className="mt-1 space-y-1">
                  <li>• No charges for SMS sent</li>
                  <li>• Full API functionality</li>
                  <li>• Safe testing environment</li>
                  <li>• Messages prefixed with [SANDBOX]</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
