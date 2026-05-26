"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAirdrop,
  updateAirdrop,
  deleteAirdrop,
  getAirdropTasks,
  createAirdropTask,
  toggleAirdropTaskComplete,
  deleteAirdropTask,
  resetAirdropTasks,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft,
  ExternalLink,
  Trash2,
  Loader2,
  Plus,
  CheckCircle2,
  Circle,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Airdrop, AirdropTask } from "@/lib/types";

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

const statusColors: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  missed: "bg-red-100 text-red-700",
  upcoming: "bg-gray-100 text-gray-700",
};

export default function AirdropDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [newTask, setNewTask] = useState("");

  const { data: airdrop, isLoading } = useQuery({
    queryKey: ["airdrop", id],
    queryFn: () => getAirdrop(Number(id)),
  });

  const { data: tasks } = useQuery({
    queryKey: ["airdrop-tasks", id],
    queryFn: () => getAirdropTasks(Number(id)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAirdrop(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrops"] });
      toast.success("Airdrop deleted");
      router.push("/airdrops");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createTaskMutation = useMutation({
    mutationFn: (description: string) =>
      createAirdropTask(Number(id), { description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrop-tasks", id] });
      setNewTask("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (taskId: number) => toggleAirdropTaskComplete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrop-tasks", id] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => deleteAirdropTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrop-tasks", id] });
      toast.success("Task deleted");
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => resetAirdropTasks(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrop-tasks", id] });
      toast.success("All tasks reset");
    },
  });

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    createTaskMutation.mutate(newTask.trim());
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!airdrop) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500">Airdrop not found</p>
        <Button variant="outline" className="mt-3" render={<Link href="/airdrops" />}>
          Back to Airdrops
        </Button>
      </div>
    );
  }

  const completedCount = (tasks ?? []).filter((t) => t.is_completed).length;
  const totalCount = (tasks ?? []).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" render={<Link href="/airdrops" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{airdrop.name}</h1>
          <p className="text-sm text-gray-500">{airdrop.chain}</p>
        </div>
        {airdrop.url && (
          <Button variant="outline" size="sm" render={<a href={airdrop.url} target="_blank" rel="noopener noreferrer" />}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Visit
          </Button>
        )}
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{airdrop.chain}</Badge>
              <Badge
                variant="secondary"
                className={cn("text-xs", priorityColors[airdrop.priority])}
              >
                {airdrop.priority}
              </Badge>
              <Badge
                variant="secondary"
                className={cn("text-xs", statusColors[airdrop.status])}
              >
                {airdrop.status}
              </Badge>
              {airdrop.category && (
                <Badge variant="outline" className="text-xs">
                  {airdrop.category}
                </Badge>
              )}
            </div>
            {airdrop.notes && (
              <p className="text-sm text-gray-600">{airdrop.notes}</p>
            )}
            {airdrop.deadline && (
              <p className="text-xs text-gray-500">
                Deadline: {new Date(airdrop.deadline).toLocaleDateString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Tasks
              {totalCount > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({completedCount}/{totalCount})
                </span>
              )}
            </CardTitle>
            {totalCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetMutation.mutate()}
                disabled={resetMutation.isPending}
              >
                <RotateCcw className="mr-1 h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {/* Add task form */}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <Input
                placeholder="Add a task... (e.g. Bridge 0.1 ETH)"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newTask.trim() || createTaskMutation.isPending}
              >
                {createTaskMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </form>

            {/* Task list */}
            {(tasks ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No tasks yet. Add tasks above as a checklist for this airdrop.
              </p>
            ) : (
              <div className="flex flex-col gap-1 pt-2">
                {(tasks ?? []).map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                      task.is_completed ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"
                    )}
                  >
                    <button
                      onClick={() => toggleMutation.mutate(task.id)}
                      className="shrink-0"
                    >
                      {task.is_completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <span
                      className={cn(
                        "flex-1 text-sm",
                        task.is_completed && "text-muted-foreground line-through"
                      )}
                    >
                      {task.description}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {task.frequency}
                    </Badge>
                    <button
                      onClick={() => deleteTaskMutation.mutate(task.id)}
                      className="shrink-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete */}
      <div className="flex justify-end">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Airdrop
        </Button>
      </div>
    </div>
  );
}
