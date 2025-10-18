"use client";

import {
  Alert,
  AlertDescription,
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
import { CheckCircle, Send, TestTube, XCircle } from "lucide-react";
import { useState } from "react";

export default function TestSMS() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState(
    "Hi {{first_name}}, your {{license_type}} license ({{license_number}}) expires on {{renewal_deadline}}. Please renew to avoid any interruption in practice. Reply STOP to opt out."
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testPatient = {
    first_name: "John",
    last_name: "Smith",
    license_type: "Medical",
    license_number: "MD123456",
    next_exam_due: "2024-03-15",
    specialty: "Cardiology",
  };

  const handleSendTest = async () => {
    if (!phoneNumber || !message) {
      alert("Please enter both phone number and message");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          message,
          patient: testPatient,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        error: "Failed to send test SMS",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="w-5 h-5" />
          <span>Test SMS Sending</span>
        </CardTitle>
        <CardDescription>
          Send a test SMS to verify your Twilio configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use your verified phone number for sandbox testing
          </p>
        </div>

        <div>
          <Label htmlFor="message">Message Template</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your SMS message template..."
            rows={4}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use variables like{" "}
            {(`{first_name}`, `{license_type}`, `{license_number}`)}
          </p>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-2">Test Patient Data:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                Name: {testPatient.first_name} {testPatient.last_name}
              </div>
              <div>License: {testPatient.license_type}</div>
              <div>Number: {testPatient.license_number}</div>
              <div>Specialty: {testPatient.specialty}</div>
              <div>Renewal: {testPatient.next_exam_due}</div>
            </div>
          </div>
        </div>

        <Button onClick={handleSendTest} disabled={loading} className="w-full">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Test SMS
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-3">
            {result.success ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="font-medium">SMS Sent Successfully!</div>
                  <div className="text-sm mt-1">
                    Message ID: {result.messageId}
                  </div>
                  {result.sandbox?.enabled && (
                    <div className="text-sm mt-1">
                      Sandbox Mode: {result.sandbox.cost}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="font-medium">SMS Failed</div>
                  <div className="text-sm mt-1">Error: {result.error}</div>
                  {result.sandbox?.enabled && (
                    <div className="text-sm mt-1">
                      Make sure your phone number is verified in Twilio sandbox
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {result.personalizedMessage && (
              <div className="p-3 bg-gray-50 border rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Personalized Message:
                </div>
                <div className="text-sm text-gray-600 font-mono">
                  {result.personalizedMessage}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <div className="font-medium mb-1">Tips for Testing:</div>
            <ul className="space-y-1 text-xs">
              <li>• Verify your phone number in Twilio Console first</li>
              <li>• Use your own phone number for testing</li>
              <li>• Check console logs for detailed SMS processing</li>
              <li>• Messages in sandbox mode are prefixed with [SANDBOX]</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
