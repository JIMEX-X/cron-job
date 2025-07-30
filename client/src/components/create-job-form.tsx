import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, TestTube } from "lucide-react";
import { CronBuilder } from "./cron-builder";
import { useCreateJob } from "@/hooks/use-cron-jobs";

const createJobSchema = z.object({
  id: z
    .string()
    .min(1, "Job ID is required")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Job ID can only contain letters, numbers, hyphens, and underscores"
    ),
  url: z.string().url("Please enter a valid URL"),
  schedule: z.string().min(1, "Schedule is required"),
  cronSecret: z.string().optional(),
  body: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    }, "Body must be valid JSON or empty"),
});

type CreateJobForm = z.infer<typeof createJobSchema>;

export function CreateJobForm() {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const createJob = useCreateJob();

  const form = useForm<CreateJobForm>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      id: "",
      url: "",
      schedule: "0 0 * * *", // Daily at midnight
      cronSecret: "",
      body: "",
    },
  });

  const onSubmit = (data: CreateJobForm) => {
    createJob.mutate(data);
  };

  const testJob = async () => {
    const url = form.getValues("url");
    const cronSecret = form.getValues("cronSecret");
    const body = form.getValues("body");

    if (!url) return;

    try {
      const headers: any = {
        "Content-Type": "application/json",
      };

      if (cronSecret) {
        headers["Authorization"] = `Bearer ${cronSecret}`;
      }

      const requestOptions: RequestInit = {
        method: "POST",
        headers,
      };

      // Only add body if it's provided and not empty
      if (body && body.trim()) {
        requestOptions.body = body;
      }

      const response = await fetch(url, requestOptions);

      console.log("Test response:", response.status, response.statusText);
    } catch (error) {
      console.error("Test failed:", error);
    }
  };

  const formatJSON = () => {
    const bodyValue = form.getValues("body");
    if (!bodyValue || bodyValue.trim() === "") return;

    try {
      const parsed = JSON.parse(bodyValue);
      const formatted = JSON.stringify(parsed, null, 2);
      form.setValue("body", formatted);
    } catch (error) {
      // Invalid JSON, don't format
    }
  };

  return (
    <div className="max-w-4xl">
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Create New Cron Job
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure a new scheduled job with custom parameters
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="id"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Job ID *
                </Label>
                <Input
                  id="id"
                  {...form.register("id")}
                  placeholder="e.g., weekly-backup"
                  className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
                {form.formState.errors.id && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.id.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Unique identifier for this job
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="url"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Target URL *
                </Label>
                <Input
                  id="url"
                  type="url"
                  {...form.register("url")}
                  placeholder="https://api.example.com/webhook"
                  className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
                {form.formState.errors.url && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.url.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Endpoint to call when job executes
                </p>
              </div>
            </div>

            {/* Cron Schedule Builder */}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">
                Schedule *
              </Label>
              <CronBuilder
                value={form.watch("schedule")}
                onChange={(value) => form.setValue("schedule", value)}
              />
              {form.formState.errors.schedule && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.schedule.message}
                </p>
              )}
            </div>

            {/* Request Body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="body"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Request Body (Optional)
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={formatJSON}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Format JSON
                </Button>
              </div>
              <Textarea
                id="body"
                {...form.register("body")}
                placeholder='{"message": "Hello from cron job", "timestamp": "{{now}}"}'
                rows={6}
                className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono text-sm"
              />
              {form.formState.errors.body && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.body.message}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Optional JSON payload to send with the request. Leave empty for
                requests without body.
              </p>
            </div>

            {/* Security & Authentication */}
            <div className="space-y-2">
              <Label
                htmlFor="cronSecret"
                className="text-gray-700 dark:text-gray-300"
              >
                Authentication (Optional)
              </Label>
              <Input
                id="cronSecret"
                {...form.register("cronSecret")}
                placeholder="Bearer token or secret key"
                className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Optional bearer token to include in Authorization header
              </p>
            </div>

            {/* Advanced Options */}
            <Separator />
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    Advanced Options
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      advancedOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-600 dark:text-gray-400">
                      <input type="checkbox" className="mr-2" />
                      Retry on failure
                    </Label>
                    <Input
                      type="number"
                      placeholder="3"
                      min="1"
                      max="5"
                      className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600 dark:text-gray-400">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Enable detailed logging
                    </Label>
                    <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                      <option value="info">Info</option>
                      <option value="warn">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Form Actions */}
            <Separator />
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={testJob}
                className="text-gray-700 dark:text-gray-300"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Job
              </Button>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  disabled={createJob.isPending}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {createJob.isPending ? "Creating..." : "Create Job"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
