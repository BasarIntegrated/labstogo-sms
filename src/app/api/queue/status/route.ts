import { campaignQueue, smsQueue } from "@/lib/queue";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get queue statistics
    const [smsStats, campaignStats] = await Promise.all([
      smsQueue.getJobCounts(),
      campaignQueue.getJobCounts(),
    ]);

    // Get recent jobs
    const [recentSmsJobs, recentCampaignJobs] = await Promise.all([
      smsQueue.getJobs(["completed", "failed", "active"], 0, 10),
      campaignQueue.getJobs(["completed", "failed", "active"], 0, 10),
    ]);

    return NextResponse.json({
      queues: {
        sms: {
          ...smsStats,
          recentJobs: await Promise.all(
            recentSmsJobs.map(async (job) => ({
              id: job.id,
              name: job.name,
              status: await job.getState(),
              progress: job.progress,
              data: job.data,
              createdAt: job.timestamp,
              processedOn: job.processedOn,
              finishedOn: job.finishedOn,
              failedReason: job.failedReason,
            }))
          ),
        },
        campaign: {
          ...campaignStats,
          recentJobs: await Promise.all(
            recentCampaignJobs.map(async (job) => ({
              id: job.id,
              name: job.name,
              status: await job.getState(),
              progress: job.progress,
              data: job.data,
              createdAt: job.timestamp,
              processedOn: job.processedOn,
              finishedOn: job.finishedOn,
              failedReason: job.failedReason,
            }))
          ),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching queue status:", error);
    return NextResponse.json(
      { error: "Failed to fetch queue status" },
      { status: 500 }
    );
  }
}
