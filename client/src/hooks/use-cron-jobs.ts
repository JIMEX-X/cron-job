import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cronService } from "@/lib/cron-service";
import { useToast } from "@/hooks/use-toast";

export function useCronJobs() {
  return useQuery({
    queryKey: ["/api/jobs"],
    queryFn: cronService.getJobs,
  });
}

export function useJobStats() {
  return useQuery({
    queryKey: ["/api/stats"],
    queryFn: cronService.getStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useHealthStatus() {
  return useQuery({
    queryKey: ["/api/health"],
    queryFn: cronService.getHealth,
    refetchInterval: 30000,
  });
}

export function useExecutionLogs(jobId?: string) {
  return useQuery({
    queryKey: ["/api/logs", jobId],
    queryFn: () => cronService.getLogs(jobId ? { jobId } : undefined),
    refetchInterval: 15000, // Refresh every 15 seconds
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: cronService.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Job Created",
        description: "Your new cron job has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create job",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => cronService.updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Job Updated",
        description: "Job has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update job",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: cronService.deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Job Deleted",
        description: "The job has been successfully removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job",
        variant: "destructive",
      });
    },
  });
}
