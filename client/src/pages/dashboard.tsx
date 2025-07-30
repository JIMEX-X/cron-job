import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";
import { StatsGrid } from "@/components/stats-grid";
import { JobsTable } from "@/components/jobs-table";
import { CreateJobForm } from "@/components/create-job-form";
import { ExecutionLogs } from "@/components/execution-logs";
import { SettingsPanel } from "@/components/settings-panel";
import { Menu, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { useHealthStatus, useJobStats } from "@/hooks/use-cron-jobs";

const pageTitles: { [key: string]: string } = {
  "/": "Dashboard",
  "/jobs": "Cron Jobs",
  "/create": "Create Job",
  "/logs": "Execution Logs", 
  "/settings": "Settings",
};

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { data: health } = useHealthStatus();
  const { data: stats } = useJobStats();

  const pageTitle = pageTitles[location] || "Dashboard";

  const renderContent = () => {
    switch (location) {
      case "/jobs":
        return <JobsTable />;
      case "/create":
        return <CreateJobForm />;
      case "/logs":
        return <ExecutionLogs />;
      case "/settings":
        return <SettingsPanel />;
      default:
        return (
          <>
            <StatsGrid />
            
            {/* Health Monitor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Server Status</span>
                    <span className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm font-medium">
                        {health?.status === 'healthy' ? 'Online' : 'Offline'}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {health?.memoryUsage || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {health?.cpuUsage || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Self-Ping</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {health?.lastPing || 'Unknown'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">System started successfully</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">System startup</p>
                    </div>
                  </div>
                  {stats && stats.activeJobs > 0 && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {stats.activeJobs} active job{stats.activeJobs !== 1 ? 's' : ''} loaded
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Job initialization</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">Cron Manager is ready</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">System ready</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{pageTitle}</h2>
            </div>
            <div className="flex items-center space-x-4">
              {/* Health Status */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">
                  {stats?.activeJobs || 0} Jobs Active
                </span>
              </div>
              {/* API Status */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full">
                <Zap className="h-3 w-3" />
                <span className="text-sm font-medium">API Connected</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
