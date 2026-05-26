"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";
import { Check, RotateCcw, Trash2 } from "lucide-react";

interface TaskItemProps {
  task: Task;
  onComplete: () => void;
  onReset: () => void;
  onDelete: () => void;
  completing?: boolean;
  resetting?: boolean;
  deleting?: boolean;
}

export function TaskItem({
  task,
  onComplete,
  onReset,
  onDelete,
  completing,
  resetting,
  deleting,
}: TaskItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 transition-colors",
        task.is_completed
          ? "border-green-200 bg-green-50/50"
          : "border-gray-200 bg-white"
      )}
    >
      <button
        onClick={task.is_completed ? onReset : onComplete}
        disabled={completing || resetting}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          task.is_completed
            ? "border-green-500 bg-green-500 text-white"
            : "border-gray-300 hover:border-blue-500"
        )}
      >
        {task.is_completed && <Check className="h-3 w-3" />}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={cn(
            "text-sm",
            task.is_completed && "text-muted-foreground line-through"
          )}
        >
          {task.description}
        </span>
        {task.frequency && (
          <Badge variant="outline" className="w-fit text-xs">
            {task.frequency}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1">
        {task.is_completed ? (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onReset}
            disabled={resetting}
            title="Reset task"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onComplete}
            disabled={completing}
            title="Complete task"
          >
            <Check className="h-3.5 w-3.5 text-green-600" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onDelete}
          disabled={deleting}
          title="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5 text-red-500" />
        </Button>
      </div>
    </div>
  );
}
