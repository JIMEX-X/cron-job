import { Card, CardContent } from "@/components/ui/card";
import { List, Play, Zap, CheckCircle } from "lucide-react";
import { useJobStats } from "@/hooks/use-cron-jobs";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsGrid() {
  const { data: stats, isLoading } = useJobStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      name: "Total Jobs",
      value: stats?.totalJobs || 0,
      icon: List,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      name: "Active Jobs",
      value: stats?.activeJobs || 0,
      icon: Play,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/20",
    },
    {
      name: "Executions Today",
      value: stats?.executionsToday || 0,
      icon: Zap,
      color: "text-yellow-600",
      bg: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
      name: "Success Rate",
      value: `${stats?.successRate || 0}%`,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.name} className="bg-white dark:bg-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.name}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                </div>
                <div className={`w-12 h-12 ${item.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${item.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
