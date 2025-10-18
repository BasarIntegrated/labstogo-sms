import {
  Calendar,
  CheckCircle,
  Clock,
  MessageSquare,
  XCircle,
} from "lucide-react";
import React from "react";

interface CampaignDetail {
  id: string;
  campaign_id: string;
  name: string;
  status: "delivered" | "sent" | "failed" | "pending";
  sent_at: string;
  delivered_at?: string;
  failed_at?: string;
  message_template?: string;
}

interface PatientCampaignDetailsProps {
  patientId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientCampaignDetails({
  patientId,
  patientName,
  isOpen,
  onClose,
}: PatientCampaignDetailsProps) {
  const [campaigns, setCampaigns] = React.useState<CampaignDetail[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    total: 0,
    delivered: 0,
    sent: 0,
    failed: 0,
    pending: 0,
  });

  React.useEffect(() => {
    async function fetchPatientCampaigns() {
      if (!isOpen) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/patients/${patientId}/campaigns`);
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data.campaigns || []);
          setStats(data.stats || stats);
        }
      } catch (error) {
        console.error("Error fetching patient campaigns:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPatientCampaigns();
  }, [patientId, isOpen]);

  if (!isOpen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "sent":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Campaign History for {patientName}
              </h2>
              <p className="text-sm text-gray-500">
                All SMS campaigns sent to this patient
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </div>
                  <div className="text-sm text-gray-500">Total Campaigns</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.delivered}
                  </div>
                  <div className="text-sm text-green-600">Delivered</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.sent}
                  </div>
                  <div className="text-sm text-blue-600">Sent</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.failed}
                  </div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {stats.pending}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>

              {/* Campaigns List */}
              {campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No campaigns sent
                  </h3>
                  <p className="text-gray-500">
                    This patient hasn't received any SMS campaigns yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {campaign.name}
                            </h3>
                            <div
                              className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${getStatusColor(
                                campaign.status
                              )}`}
                            >
                              {getStatusIcon(campaign.status)}
                              {campaign.status}
                            </div>
                          </div>

                          {campaign.message_template && (
                            <div className="bg-gray-50 rounded-md p-3 mb-3">
                              <p className="text-sm text-gray-700 italic">
                                "{campaign.message_template}"
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Sent: {formatDateTime(campaign.sent_at)}
                              </span>
                            </div>
                            {campaign.delivered_at && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span>
                                  Delivered:{" "}
                                  {formatDateTime(campaign.delivered_at)}
                                </span>
                              </div>
                            )}
                            {campaign.failed_at && (
                              <div className="flex items-center gap-1 text-red-600">
                                <XCircle className="h-4 w-4" />
                                <span>
                                  Failed: {formatDateTime(campaign.failed_at)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
