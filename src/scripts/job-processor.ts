#!/usr/bin/env node

/**
 * Job Processor Script
 *
 * This script processes SMS campaign jobs from the queue.
 * It should be run as a cron job or background service.
 *
 * Usage: npm run process-jobs
 */

import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const JOB_PROCESSOR_URL = process.env.NEXT_PUBLIC_APP_URL + "/api/jobs/process";
const PROCESSING_INTERVAL = 5000; // 5 seconds

async function processJobs() {
  try {
    console.log(`[${new Date().toISOString()}] Processing jobs...`);

    const response = await fetch(JOB_PROCESSOR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`[${new Date().toISOString()}] ${result.message}`);

    if (result.processed > 0) {
      console.log(
        `[${new Date().toISOString()}] Processed ${result.processed} jobs`
      );
    }
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error processing jobs:`,
      error
    );
  }
}

async function startJobProcessor() {
  console.log("Starting SMS Job Processor...");
  console.log(`Processing interval: ${PROCESSING_INTERVAL}ms`);
  console.log(`Job processor URL: ${JOB_PROCESSOR_URL}`);

  // Process jobs immediately
  await processJobs();

  // Then process every interval
  setInterval(processJobs, PROCESSING_INTERVAL);
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down job processor...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nShutting down job processor...");
  process.exit(0);
});

// Start the processor
startJobProcessor().catch(console.error);
