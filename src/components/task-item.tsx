"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task, Category } from "@/lib/types";
import { Trash2, Pencil } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  ongoing: "bg-yellow-100 text-yellow-700",
  finish: "bg-green-100 text-green-700",
  cancel: "bg-red-100 text-red-700",
};

interface TaskItemProps {
  task: Task;
  category?: Category | null;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

export function TaskItem({
  task,
  category,
  onEdit,
  onDelete,
  deleting,
}: TaskItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm font-medium">{task.name}</span>
        <div className="flex items-center gap-2">
          {category && (
            <Badge variant="outline" className="text-xs">
              <div className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: category.color }} />
              {category.name}
            </Badge>
          )}
          <Badge variant="secondary" className={cn("text-xs", statusColors[task.status])}>
            {task.status}
          </Badge>
          {task.date && (
            <span className="text-xs text-muted-foreground">
              {new Date(task.date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-xs" onClick={onEdit} title="Edit task">
          <Pencil className="h-3.5 w-3.5 text-blue-500" />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={onDelete} disabled={deleting} title="Delete task">
          <Trash2 className="h-3.5 w-3.5 text-red-500" />
        </Button>
      </div>
    </div>
  );
}
