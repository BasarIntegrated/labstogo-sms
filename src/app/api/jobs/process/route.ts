import { formatPhoneNumber, personalizeMessage, sendSMS } from "@/lib/sms";
import { supabaseAdmin } from "@/lib/supabase";
import { Campaign, Patient } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get pending jobs, ordered by priority and creation time
    const { data: jobs, error: jobsError } = await supabaseAdmin
      .from("job_queue")
      .select(
        `
        *,
        leads (*),
        campaigns (*)
      `
      )
      .eq("status", "pending")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(10); // Process up to 10 jobs at a time

    if (jobsError) {
      return NextResponse.json(
        { error: "Failed to fetch jobs" },
        { status: 500 }
      );
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending jobs to process",
        processed: 0,
      });
    }

    let processedCount = 0;
    const results = [];

    for (const job of jobs) {
      try {
        // Mark job as processing
        await supabaseAdmin
          .from("job_queue")
          .update({
            status: "processing",
            started_at: new Date().toISOString(),
          })
          .eq("id", job.id);

        const patient = job.leads as Patient;
        const campaign = job.campaigns as Campaign;

        if (!patient || !campaign) {
          throw new Error("Patient or campaign not found");
        }

        // Check if campaign is still running
        if (campaign.status !== "active") {
          await supabaseAdmin
            .from("job_queue")
            .update({
              status: "failed",
              error_message: "Campaign is not running",
              completed_at: new Date().toISOString(),
            })
            .eq("id", job.id);
          continue;
        }

        // Personalize the message
        const personalizedMessage = personalizeMessage(
          campaign.message_template,
          patient
        );

        // Format phone number
        const formattedPhone = formatPhoneNumber(patient.phone_number);

        // Send SMS
        const smsResult = await sendSMS(formattedPhone, personalizedMessage);

        if (smsResult.success) {
          // Update SMS message record
          await supabaseAdmin
            .from("sms_messages")
            .update({
              status: "sent",
              provider_message_id: smsResult.messageId,
              provider_response: smsResult.providerResponse,
              sent_at: new Date().toISOString(),
            })
            .eq("campaign_id", campaign.id)
            .eq("lead_id", patient.id);

          // Mark job as completed
          await supabaseAdmin
            .from("job_queue")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
            })
            .eq("id", job.id);

          // Update campaign sent count
          await supabaseAdmin
            .from("campaigns")
            .update({
              sent_count: (campaign.sent_count || 0) + 1,
            })
            .eq("id", campaign.id);

          processedCount++;
          results.push({
            jobId: job.id,
            patientId: patient.id,
            phoneNumber: formattedPhone,
            status: "sent",
            messageId: smsResult.messageId,
          });
        } else {
          // Handle SMS sending failure
          await supabaseAdmin
            .from("sms_messages")
            .update({
              status: "failed",
              error_message: smsResult.error,
              failed_at: new Date().toISOString(),
            })
            .eq("campaign_id", campaign.id)
            .eq("lead_id", patient.id);

          // Check if we should retry
          if (job.retry_count < job.max_retries) {
            await supabaseAdmin
              .from("job_queue")
              .update({
                status: "pending",
                retry_count: job.retry_count + 1,
                started_at: null,
              })
              .eq("id", job.id);
          } else {
            await supabaseAdmin
              .from("job_queue")
              .update({
                status: "failed",
                error_message: smsResult.error,
                completed_at: new Date().toISOString(),
              })
              .eq("id", job.id);

            // Update campaign failed count
            await supabaseAdmin
              .from("campaigns")
              .update({
                failed_count: (campaign.failed_count || 0) + 1,
              })
              .eq("id", campaign.id);
          }

          results.push({
            jobId: job.id,
            patientId: patient.id,
            phoneNumber: formattedPhone,
            status: "failed",
            error: smsResult.error,
          });
        }

        // Add a small delay between SMS sends to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error: any) {
        console.error(`Error processing job ${job.id}:`, error);

        // Mark job as failed
        await supabaseAdmin
          .from("job_queue")
          .update({
            status: "failed",
            error_message: error.message,
            completed_at: new Date().toISOString(),
          })
          .eq("id", job.id);

        results.push({
          jobId: job.id,
          status: "error",
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} jobs successfully`,
      processed: processedCount,
      results,
    });
  } catch (error) {
    console.error("Error processing jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
