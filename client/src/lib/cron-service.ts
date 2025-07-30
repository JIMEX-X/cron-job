import { apiRequest } from "./queryClient";

export const cronService = {
  getJobs: () => fetch("/api/jobs").then(res => res.json()),
  
  createJob: (data: any) => apiRequest("POST", "/api/jobs", data),
  
  updateJob: (id: string, data: any) => apiRequest("PUT", `/api/jobs/${id}`, data),
  
  deleteJob: (id: string) => apiRequest("DELETE", `/api/jobs/${id}`),
  
  getStats: () => fetch("/api/stats").then(res => res.json()),
  
  getHealth: () => fetch("/api/health").then(res => res.json()),
  
  getLogs: (params?: { jobId?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.jobId) query.set("jobId", params.jobId);
    if (params?.limit) query.set("limit", params.limit.toString());
    return fetch(`/api/logs?${query}`).then(res => res.json());
  },
  
  clearLogs: (days: number) => apiRequest("DELETE", `/api/logs?days=${days}`),
};

// Cron expression utilities
export const cronPresets = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "Every 30 minutes", value: "*/30 * * * *" },
  { label: "Hourly", value: "0 * * * *" },
  { label: "Daily", value: "0 0 * * *" },
  { label: "Weekly", value: "0 0 * * 0" },
  { label: "Monthly", value: "0 0 1 * *" },
];

export const describeCron = (expression: string): string => {
  const descriptions: { [key: string]: string } = {
    "* * * * *": "Every minute",
    "*/5 * * * *": "Every 5 minutes",
    "*/15 * * * *": "Every 15 minutes",
    "*/30 * * * *": "Every 30 minutes",
    "0 * * * *": "Every hour",
    "0 0 * * *": "Daily at midnight",
    "0 0 * * 0": "Weekly on Sunday at midnight",
    "0 0 1 * *": "Monthly on the 1st at midnight",
    "0 9 * * *": "Daily at 9:00 AM",
    "0 9 * * 1-5": "Weekdays at 9:00 AM",
  };
  
  return descriptions[expression] || "Custom schedule";
};

export const getNextRun = (cronExpression: string): string => {
  // Simple approximation - in a real app, use a proper cron parser
  const now = new Date();
  const parts = cronExpression.split(" ");
  
  if (cronExpression === "* * * * *") return "Next minute";
  if (cronExpression === "0 * * * *") return "Next hour";
  if (cronExpression === "0 0 * * *") return "Tomorrow at midnight";
  if (cronExpression === "0 0 * * 0") return "Next Sunday at midnight";
  if (cronExpression === "0 0 1 * *") return "1st of next month";
  
  return "Next scheduled time";
};
