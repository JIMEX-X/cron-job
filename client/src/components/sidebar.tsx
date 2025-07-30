import { Link, useLocation } from "wouter";
import { useTheme } from "./theme-provider";
import { Clock, BarChart3, List, Plus, FileText, Settings, Moon, Sun } from "lucide-react";
import { useHealthStatus } from "@/hooks/use-cron-jobs";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Cron Jobs", href: "/jobs", icon: List },
  { name: "Create Job", href: "/create", icon: Plus },
  { name: "Execution Logs", href: "/logs", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { data: health } = useHealthStatus();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">CronManager</h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="sr-only">Close sidebar</span>
            ×
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${health?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {health?.status === 'healthy' ? 'Server Online' : 'Server Offline'}
              </span>
            </div>
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
