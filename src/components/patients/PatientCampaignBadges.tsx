import { CheckCircle, Clock, XCircle } from "lucide-react";
import React from "react";

interface CampaignBadge {
  id: string;
  name: string;
  status: "delivered" | "sent" | "failed" | "pending";
  sent_at: string;
  campaign_id: string;
}

interface PatientCampaignBadgesProps {
  patientId: string;
  campaigns?: CampaignBadge[];
  className?: string;
}

export function PatientCampaignBadges({
  patientId,
  campaigns: propCampaigns,
  className,
}: PatientCampaignBadgesProps) {
  const [campaigns, setCampaigns] = React.useState<CampaignBadge[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Use campaigns from props if available, otherwise use state
  const displayCampaigns = propCampaigns || campaigns;

  // Intersection Observer to only load when visible (only if no campaigns provided)
  React.useEffect(() => {
    if (propCampaigns) {
      // If campaigns are provided via props, use them directly
      setCampaigns(propCampaigns);
      setHasLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded && patientId) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasLoaded, patientId, propCampaigns]);

  React.useEffect(() => {
    // If campaigns are provided via props, skip API call
    if (propCampaigns) return;

    // DISABLED: Skip campaign API requests to reduce load
    // Only fetch if we haven't loaded yet and patientId exists
    if (hasLoaded || !patientId) return;

    // Skip the API call entirely
    setLoading(false);
    setHasLoaded(true);
    setCampaigns([]); // Empty campaigns array

    // Original code (commented out):
    /*
    async function fetchPatientCampaigns() {
      try {
        setLoading(true);
        const response = await fetch(`/api/patients/${patientId}/campaigns`);
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data.campaigns || []);
        }
      } catch (error) {
        console.error("Error fetching patient campaigns:", error);
      } finally {
        setLoading(false);
        setHasLoaded(true);
      }
    }

    fetchPatientCampaigns();
    */
  }, [isVisible, hasLoaded, patientId, propCampaigns]);

  if (loading) {
    return (
      <div ref={ref} className={`flex gap-2 ${className}`}>
        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (displayCampaigns.length === 0) {
    return (
      <div ref={ref} className={`text-sm text-gray-500 ${className}`}>
        No campaigns processed
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "sent":
        return <Clock className="h-3 w-3 text-blue-600" />;
      case "failed":
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return <Clock className="h-3 w-3 text-gray-600" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div ref={ref} className={`flex flex-wrap gap-2 ${className}`}>
      {displayCampaigns.map((campaign) => (
        <div
          key={campaign.id}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getStatusColor(
            campaign.status
          )}`}
          title={`${campaign.name} - ${campaign.status} on ${formatDate(
            campaign.sent_at
          )}`}
        >
          {getStatusIcon(campaign.status)}
          <span className="truncate max-w-20">{campaign.name}</span>
          <span className="text-xs opacity-75">
            {formatDate(campaign.sent_at)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Compact version for tables
export function PatientCampaignBadgesCompact({
  patientId,
  patientName,
  campaigns: propCampaigns,
  onViewDetails,
}: {
  patientId: string;
  patientName?: string;
  campaigns?: CampaignBadge[];
  onViewDetails?: () => void;
}) {
  const [campaigns, setCampaigns] = React.useState<CampaignBadge[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Use campaigns from props if available, otherwise use state
  const displayCampaigns = propCampaigns || campaigns;

  React.useEffect(() => {
    // If campaigns are provided via props, use them directly
    if (propCampaigns) {
      setCampaigns(propCampaigns);
      setLoading(false);
      return;
    }

    // DISABLED: Skip campaign API requests to reduce load
    setLoading(false);
    setCampaigns([]);

    // Original code (commented out):
    /*
    async function fetchPatientCampaigns() {
      try {
        const response = await fetch(`/api/patients/${patientId}/campaigns`);
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data.campaigns || []);
        }
      } catch (error) {
        console.error("Error fetching patient campaigns:", error);
      } finally {
        setLoading(false);
      }
    }

    if (patientId) {
      fetchPatientCampaigns();
    }
    */
  }, [patientId, propCampaigns]);

  if (loading) {
    return <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />;
  }

  if (displayCampaigns.length === 0) {
    return <span className="text-xs text-gray-400">No campaigns</span>;
  }

  const deliveredCount = displayCampaigns.filter(
    (c) => c.status === "delivered"
  ).length;
  const totalCount = displayCampaigns.length;

  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-1">
        {displayCampaigns.slice(0, 3).map((campaign, index) => (
          <div
            key={campaign.id}
            className={`h-4 w-4 rounded-full border border-white ${
              campaign.status === "delivered"
                ? "bg-green-500"
                : campaign.status === "sent"
                ? "bg-blue-500"
                : campaign.status === "failed"
                ? "bg-red-500"
                : "bg-gray-400"
            }`}
            title={`${campaign.name} - ${campaign.status}`}
          />
        ))}
        {campaigns.length > 3 && (
          <div className="h-4 w-4 rounded-full bg-gray-300 border border-white flex items-center justify-center text-xs text-gray-600">
            +{campaigns.length - 3}
          </div>
        )}
      </div>
      <span className="text-xs text-gray-600">
        {deliveredCount}/{totalCount}
      </span>
      {onViewDetails && campaigns.length > 0 && (
        <button
          onClick={onViewDetails}
          className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
          title="View campaign details"
        >
          View Details
        </button>
      )}
    </div>
  );
}
