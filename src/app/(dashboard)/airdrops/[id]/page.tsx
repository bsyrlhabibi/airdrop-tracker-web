"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAirdrop,
  updateAirdrop,
  deleteAirdrop,
  getAirdropTasks,
  createAirdropTask,
  updateAirdropTask,
  deleteAirdropTask,
  getCategories,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft,
  ExternalLink,
  Trash2,
  Loader2,
  Plus,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AirdropTask } from "@/lib/types";

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

const statusOptions = ["pending", "ongoing", "finish", "cancel"];

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  ongoing: "bg-yellow-100 text-yellow-700",
  finish: "bg-green-100 text-green-700",
  cancel: "bg-red-100 text-red-700",
};

export default function AirdropDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Add task form state
  const [taskName, setTaskName] = useState("");
  const [taskCategoryId, setTaskCategoryId] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState("pending");
  const [taskDate, setTaskDate] = useState("");

  // Edit task state
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<string>("");
  const [editStatus, setEditStatus] = useState("pending");
  const [editDate, setEditDate] = useState("");

  const { data: airdrop, isLoading } = useQuery({
    queryKey: ["airdrop", id],
    queryFn: () => getAirdrop(Number(id)),
  });

  const { data: tasks } = useQuery({
    queryKey: ["airdrop-tasks", id],
    queryFn: () => getAirdropTasks(Number(id)),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
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
    mutationFn: (data: { name: string; category_id?: number; status: string; date?: string }) =>
      createAirdropTask(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrop-tasks", id] });
      setTaskName("");
      setTaskCategoryId("");
      setTaskStatus("pending");
      setTaskDate("");
      toast.success("Task added");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: { taskId: number; name: string; category_id?: number; status: string; date?: string }) =>
      updateAirdropTask(data.taskId, {
        name: data.name,
        category_id: data.category_id,
        status: data.status,
        date: data.date,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrop-tasks", id] });
      setEditTaskId(null);
      toast.success("Task updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => deleteAirdropTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrop-tasks", id] });
      toast.success("Task deleted");
    },
  });

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskName.trim()) return;
    createTaskMutation.mutate({
      name: taskName.trim(),
      category_id: taskCategoryId ? Number(taskCategoryId) : undefined,
      status: taskStatus,
      date: taskDate || undefined,
    });
  }

  function handleUpdateTask(taskId: number) {
    if (!editName.trim()) return;
    updateTaskMutation.mutate({
      taskId,
      name: editName.trim(),
      category_id: editCategoryId ? Number(editCategoryId) : undefined,
      status: editStatus,
      date: editDate || undefined,
    });
  }

  function startEdit(task: AirdropTask) {
    setEditTaskId(task.id);
    setEditName(task.name);
    setEditCategoryId(task.category_id?.toString() || "");
    setEditStatus(task.status);
    setEditDate(task.date ? task.date.split("T")[0] : "");
  }

  function getCategoryName(id: number | null | undefined) {
    if (!id || !categories) return null;
    return categories.find((c) => c.id === id);
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
              <Badge variant="secondary" className={cn("text-xs", priorityColors[airdrop.priority])}>
                {airdrop.priority}
              </Badge>
              <Badge variant="secondary" className={cn("text-xs", statusColors[airdrop.status] || "bg-gray-100 text-gray-700")}>
                {airdrop.status}
              </Badge>
              {airdrop.category && (
                <Badge variant="outline" className="text-xs">{airdrop.category}</Badge>
              )}
            </div>
            {airdrop.notes && <p className="text-sm text-gray-600">{airdrop.notes}</p>}
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
          <CardTitle className="text-base">
            Tasks
            {(tasks ?? []).length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({(tasks ?? []).length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {/* Add task form */}
            <form onSubmit={handleAddTask} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Task name... (e.g. Bridge 0.1 ETH)"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={!taskName.trim() || createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <Select value={taskCategoryId} onValueChange={(v) => setTaskCategoryId(v ?? "")}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {(categories ?? []).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={taskStatus} onValueChange={(v) => setTaskStatus(v ?? "pending")}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        <Badge variant="secondary" className={cn("text-xs", statusColors[s])}>
                          {s}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="w-40"
                />
              </div>
            </form>

            {/* Task list */}
            {(tasks ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No tasks yet. Add tasks above.
              </p>
            ) : (
              <div className="flex flex-col gap-1 pt-2">
                {(tasks ?? []).map((task) => {
                  const cat = getCategoryName(task.category_id);
                  const isEditing = editTaskId === task.id;

                  if (isEditing) {
                    return (
                      <div key={task.id} className="flex flex-col gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Task name"
                        />
                        <div className="flex gap-2">
                          <Select value={editCategoryId} onValueChange={(v) => setEditCategoryId(v ?? "")}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Category</SelectItem>
                              {(categories ?? []).map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={editStatus} onValueChange={(v) => setEditStatus(v ?? "pending")}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-40"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateTask(task.id)} disabled={updateTaskMutation.isPending}>
                            Save
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditTaskId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{task.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          {cat && (
                            <Badge variant="outline" className="text-xs">
                              <div className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: cat.color }} />
                              {cat.name}
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
                      <button onClick={() => startEdit(task)} className="shrink-0 text-gray-400 hover:text-blue-500">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteTaskMutation.mutate(task.id)} className="shrink-0 text-gray-400 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
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
          {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Airdrop
        </Button>
      </div>
    </div>
  );
}
