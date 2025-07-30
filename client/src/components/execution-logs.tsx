import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, Eye, CheckCircle, XCircle } from "lucide-react";
import { useExecutionLogs, useCronJobs } from "@/hooks/use-cron-jobs";
import { Skeleton } from "@/components/ui/skeleton";

export function ExecutionLogs() {
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("24h");
  
  const { data: jobs } = useCronJobs();
  const { data: logs, isLoading, refetch } = useExecutionLogs(
    selectedJob === "all" ? undefined : selectedJob
  );

  const getLogStats = () => {
    if (!logs) return { successful: 0, failed: 0, total: 0, avgResponseTime: "0ms" };
    
    const successful = logs.filter((log: any) => log.status === 'success').length;
    const failed = logs.filter((log: any) => log.status === 'error').length;
    const total = logs.length;
    const avgDuration = logs.reduce((acc: number, log: any) => acc + (log.duration || 0), 0) / total;
    
    return {
      successful,
      failed,
      total,
      avgResponseTime: `${Math.round(avgDuration)}ms`,
    };
  };

  const stats = getLogStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Execution Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Logs Header */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-gray-900 dark:text-white">Execution Logs</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs?.map((job: any) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-primary"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.avgResponseTime}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Logs Table */}
      <Card className="bg-white dark:bg-slate-800">
        <CardContent className="p-0">
          {!logs || logs.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No execution logs found for the selected criteria.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-slate-700/50">
                  <TableHead className="text-gray-500 dark:text-gray-400">Timestamp</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Job ID</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Response</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Duration</TableHead>
                  <TableHead className="text-gray-500 dark:text-gray-400">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs?.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-gray-900 dark:text-white">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {log.jobId}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={log.status === 'success' ? "default" : "destructive"}
                        className={log.status === 'success' 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }
                      >
                        {log.status === 'success' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {log.status === 'success' ? 'Success' : 'Failed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {log.responseCode ? `${log.responseCode} ${log.responseCode === 200 ? 'OK' : 'Error'}` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {log.duration ? `${log.duration}ms` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4 text-primary" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
