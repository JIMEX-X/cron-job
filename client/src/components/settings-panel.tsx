import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Key, Download, Trash2, Eye, EyeOff, Copy } from "lucide-react";

export function SettingsPanel() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey] = useState("sk-1234567890abcdef");

  const generateNewApiKey = () => {
    console.log("Generating new API key...");
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
  };

  const exportConfig = () => {
    console.log("Exporting configuration...");
  };

  const clearLogs = () => {
    console.log("Clearing logs...");
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* API Configuration */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            API Configuration
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage API keys and server settings
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
              Current API Key
            </Label>
            <div className="flex items-center space-x-3">
              <Input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                className="flex-1 font-mono bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                readOnly
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-gray-700 dark:text-gray-300"
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyApiKey}
                className="text-gray-700 dark:text-gray-300"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Button
              onClick={generateNewApiKey}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Key className="h-4 w-4 mr-2" />
              Generate New API Key
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Warning: This will invalidate the current key
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Server Configuration */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Server Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
                Server URL
              </Label>
              <Input
                type="url"
                defaultValue="https://cronmanager.example.com"
                className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
                Port
              </Label>
              <Input
                type="number"
                defaultValue="5000"
                className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <Label className="flex items-center text-gray-700 dark:text-gray-300">
              <input type="checkbox" className="mr-2" defaultChecked />
              Enable self-ping to prevent sleep
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="flex items-center text-gray-700 dark:text-gray-300">
              <input type="checkbox" className="mr-2" defaultChecked />
              Email notifications for failed jobs
            </Label>
          </div>
          <div>
            <Label className="flex items-center text-gray-700 dark:text-gray-300">
              <input type="checkbox" className="mr-2" />
              Slack notifications
            </Label>
          </div>
          <div>
            <Label className="flex items-center text-gray-700 dark:text-gray-300">
              <input type="checkbox" className="mr-2" />
              Discord webhooks
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Export Configuration
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Download all job configurations as JSON
              </p>
            </div>
            <Button
              onClick={exportConfig}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Clear Logs
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Remove execution logs older than 30 days
              </p>
            </div>
            <Button
              onClick={clearLogs}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
