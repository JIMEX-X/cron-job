import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cronPresets, describeCron } from "@/lib/cron-service";
import { Info } from "lucide-react";

interface CronBuilderProps {
  value: string;
  onChange: (value: string) => void;
}

export function CronBuilder({ value, onChange }: CronBuilderProps) {
  const [parts, setParts] = useState({
    minute: "*",
    hour: "*",
    day: "*",
    month: "*",
    weekday: "*",
  });

  useEffect(() => {
    if (value && value.split(" ").length === 5) {
      const [minute, hour, day, month, weekday] = value.split(" ");
      setParts({ minute, hour, day, month, weekday });
    }
  }, [value]);

  const updatePart = (part: keyof typeof parts, newValue: string) => {
    const newParts = { ...parts, [part]: newValue || "*" };
    setParts(newParts);
    const cronExpression = `${newParts.minute} ${newParts.hour} ${newParts.day} ${newParts.month} ${newParts.weekday}`;
    onChange(cronExpression);
  };

  const selectPreset = (preset: string) => {
    onChange(preset);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Quick Presets
        </Label>
        <div className="flex flex-wrap gap-2">
          {cronPresets.map((preset) => (
            <Button
              key={preset.value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => selectPreset(preset.value)}
              className={`text-sm ${
                value === preset.value 
                  ? "bg-primary text-white border-primary hover:bg-primary/90" 
                  : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Custom Schedule
        </Label>
        <div className="grid grid-cols-5 gap-2">
          <div>
            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Minute</Label>
            <Input
              type="text"
              value={parts.minute === "*" ? "" : parts.minute}
              onChange={(e) => updatePart("minute", e.target.value)}
              placeholder="*"
              className="text-center text-sm"
              maxLength={2}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Hour</Label>
            <Input
              type="text"
              value={parts.hour === "*" ? "" : parts.hour}
              onChange={(e) => updatePart("hour", e.target.value)}
              placeholder="*"
              className="text-center text-sm"
              maxLength={2}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Day</Label>
            <Input
              type="text"
              value={parts.day === "*" ? "" : parts.day}
              onChange={(e) => updatePart("day", e.target.value)}
              placeholder="*"
              className="text-center text-sm"
              maxLength={2}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Month</Label>
            <Input
              type="text"
              value={parts.month === "*" ? "" : parts.month}
              onChange={(e) => updatePart("month", e.target.value)}
              placeholder="*"
              className="text-center text-sm"
              maxLength={2}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Weekday</Label>
            <Input
              type="text"
              value={parts.weekday === "*" ? "" : parts.weekday}
              onChange={(e) => updatePart("weekday", e.target.value)}
              placeholder="*"
              className="text-center text-sm"
              maxLength={1}
            />
          </div>
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Cron Expression</Label>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono"
          placeholder="* * * * *"
        />
        <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
          <Info className="h-3 w-3 mr-1" />
          {describeCron(value)}
        </div>
      </div>
    </div>
  );
}
