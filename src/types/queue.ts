export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

export interface RecentJob {
  id: string;
  name: string;
  queue: string;
  state: string;
  timestamp: string;
  createdAt: string;
  status: string;
}

export interface QueueStatus {
  smsQueue: QueueStats;
  campaignQueue: QueueStats;
  recentJobs: RecentJob[];
}
