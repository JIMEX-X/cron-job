import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Download, Upload, RefreshCw, Edit, Eye, Trash2 } from "lucide-react";
import { useCronJobs, useDeleteJob } from "@/hooks/use-cron-jobs";
import { Skeleton } from "@/components/ui/skeleton";
import { getNextRun } from "@/lib/cron-service";

export function JobsTable() {
  const { data: jobs, isLoading, refetch } = useCronJobs();
  const deleteJob = useDeleteJob();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setJobToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (jobToDelete) {
      deleteJob.mutate(jobToDelete);
      setJobToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const exportJobs = () => {
    if (jobs) {
      const dataStr = JSON.stringify(jobs, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "cron-jobs.json";
      link.click();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cron Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 dark:text-white">Cron Jobs</CardTitle>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={exportJobs}
                className="text-gray-700 dark:text-gray-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-gray-700 dark:text-gray-300"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-primary"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!jobs || jobs.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No cron jobs found. Create your first job to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-slate-700/50">
                  <TableHead className="text-gray-500 dark:text-gray-400">Job ID</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">URL</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Schedule</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Next Run</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs?.map((job: any) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${job.isActive ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <span className="font-medium text-gray-900 dark:text-white">{job.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {job.url}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {job.schedule}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={job.isActive ? "default" : "secondary"}
                        className={job.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : ""}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mr-1 ${job.isActive ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        {job.isActive ? "Active" : "Paused"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {job.isActive ? getNextRun(job.schedule) : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleDelete(job.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
