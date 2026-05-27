"use client";

import { use, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAirdrop,
  getAirdrops,
  deleteAirdrop,
  getAirdropTasks,
  createAirdropTask,
  updateAirdropTask,
  deleteAirdropTask,
  getCategories,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { slugify, formatLocalDate } from "@/lib/utils";
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

const airdropStatusColors: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  end: "bg-gray-200 text-gray-600",
  upcoming: "bg-purple-100 text-purple-700",
  missed: "bg-red-100 text-red-700",
};

// Task status options — synced with daily tasks
const taskStatusOptions = ["pending", "ongoing", "finish", "missed"];

const taskStatusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  ongoing: "bg-yellow-100 text-yellow-700",
  finish: "bg-green-100 text-green-700",
  missed: "bg-red-100 text-red-700",
};

export default function AirdropDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Resolve slug → airdrop ID
  const { data: allAirdrops } = useQuery({
    queryKey: ["airdrops"],
    queryFn: getAirdrops,
  });

  const airdropId = useMemo(() => {
    if (!allAirdrops) return null;
    // Try match by slugified name first
    const found = allAirdrops.find((a) => slugify(a.name) === slug);
    if (found) return found.id;
    // Fallback: try as number (backward compat)
    const num = Number(slug);
    if (!isNaN(num)) return num;
    return null;
  }, [allAirdrops, slug]);

  const { data: airdrop, isLoading: airdropLoading } = useQuery({
    queryKey: ["airdrop", airdropId],
    queryFn: () => getAirdrop(airdropId!),
    enabled: !!airdropId,
  });

  // Add task form
  const [taskName, setTaskName] = useState("");
  const [taskCategoryName, setTaskCategoryName] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState("pending");
  const [taskStartDate, setTaskStartDate] = useState("");
  const [taskEndDate, setTaskEndDate] = useState("");

  // Edit task state
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategoryName, setEditCategoryName] = useState<string>("");
  const [editStatus, setEditStatus] = useState("pending");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");

  const { data: tasks } = useQuery({
    queryKey: ["airdrop-tasks", airdropId],
    queryFn: () => getAirdropTasks(airdropId!),
    enabled: !!airdropId,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAirdrop(airdropId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrops"] });
      toast.success("Airdrop deleted");
      router.push("/airdrops");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: { name: string; category_id?: number; status: string; start_date?: string; end_date?: string }) =>
      createAirdropTask(airdropId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrop-tasks", airdropId] });
      setTaskName("");
      setTaskCategoryName("");
      setTaskStatus("pending");
      setTaskStartDate("");
      setTaskEndDate("");
      toast.success("Task added");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: { taskId: number; name: string; category_id?: number; status: string; start_date?: string; end_date?: string }) =>
      updateAirdropTask(data.taskId, {
        name: data.name,
        category_id: data.category_id,
        status: data.status,
        start_date: data.start_date,
        end_date: data.end_date,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrop-tasks", airdropId] });
      setEditTaskId(null);
      toast.success("Task updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => deleteAirdropTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrop-tasks", airdropId] });
      toast.success("Task deleted");
    },
  });

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskName.trim()) return;
    createTaskMutation.mutate({
      name: taskName.trim(),
      category_id: taskCategoryName && taskCategoryName !== "none" ? (categories ?? []).find((c) => c.name === taskCategoryName)?.id : undefined,
      status: taskStatus,
      start_date: taskStartDate || undefined,
      end_date: taskEndDate || undefined,
    });
  }

  function handleUpdateTask(taskId: number) {
    if (!editName.trim()) return;
    updateTaskMutation.mutate({
      taskId,
      name: editName.trim(),
      category_id: editCategoryName && editCategoryName !== "none" ? (categories ?? []).find((c) => c.name === editCategoryName)?.id : undefined,
      status: editStatus,
      start_date: editStartDate || undefined,
      end_date: editEndDate || undefined,
    });
  }

  function startEdit(task: AirdropTask) {
    setEditTaskId(task.id);
    setEditName(task.name);
    setEditCategoryName((categories ?? []).find((c) => c.id === task.category_id)?.name || "");
    setEditStatus(task.status);
    setEditStartDate(task.start_date ? task.start_date.split("T")[0] : "");
    setEditEndDate(task.end_date ? task.end_date.split("T")[0] : "");
  }

  function getCategoryName(id: number | null | undefined) {
    if (!id || !categories) return null;
    return categories.find((c) => c.id === id);
  }

  function formatDate(d: string | null) {
    if (!d) return null;
    return formatLocalDate(d, { month: "short", day: "numeric" });
  }

  if (airdropLoading || (!airdropId && allAirdrops)) {
    if (!airdropId && allAirdrops) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-gray-500">Airdrop not found</p>
          <Button variant="outline" className="mt-3" render={<Link href="/airdrops" />}>Back to Airdrops</Button>
        </div>
      );
    }
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
        <Button variant="outline" className="mt-3" render={<Link href="/airdrops" />}>Back to Airdrops</Button>
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
              <Badge variant="secondary" className={cn("text-xs", airdropStatusColors[airdrop.status] || "bg-gray-100 text-gray-700")}>
                {airdrop.status}
              </Badge>
              {airdrop.category && (
                <Badge variant="outline" className="text-xs">{airdrop.category}</Badge>
              )}
            </div>
            {(airdrop.date_start || airdrop.date_end) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>📅</span>
                {airdrop.date_start && <span>Start: {formatLocalDate(airdrop.date_start)}</span>}
                {airdrop.date_start && airdrop.date_end && <span>→</span>}
                {airdrop.date_end && <span>End: {formatLocalDate(airdrop.date_end)}</span>}
              </div>
            )}
            {airdrop.notes && <p className="text-sm text-gray-600">{airdrop.notes}</p>}
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
                  {createTaskMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={taskCategoryName} onValueChange={(v) => setTaskCategoryName(v ?? "")}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {(categories ?? []).map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={taskStatus} onValueChange={(v) => setTaskStatus(v ?? "pending")}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskStatusOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Label className="text-xs text-gray-500 whitespace-nowrap min-w-[2.5rem] text-right">Start:</Label>
                  <Input type="date" value={taskStartDate} onChange={(e) => setTaskStartDate(e.target.value)} className="w-full sm:w-36" />
                </div>
                <div className="flex items-center gap-1">
                  <Label className="text-xs text-gray-500 whitespace-nowrap min-w-[2.5rem] text-right">End:</Label>
                  <Input type="date" value={taskEndDate} onChange={(e) => setTaskEndDate(e.target.value)} className="w-full sm:w-36" />
                </div>
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
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Task name" />
                        <div className="flex flex-wrap gap-2">
                          <Select value={editCategoryName} onValueChange={(v) => setEditCategoryName(v ?? "")}>
                            <SelectTrigger className="w-full sm:w-40">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Category</SelectItem>
                              {(categories ?? []).map((c) => (
                                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={editStatus} onValueChange={(v) => setEditStatus(v ?? "pending")}>
                            <SelectTrigger className="w-full sm:w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {taskStatusOptions.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-1">
                            <Label className="text-xs text-gray-500 min-w-[2.5rem] text-right">Start:</Label>
                            <Input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className="w-full sm:w-36" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Label className="text-xs text-gray-500 min-w-[2.5rem] text-right">End:</Label>
                            <Input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} className="w-full sm:w-36" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateTask(task.id)} disabled={updateTaskMutation.isPending}>Save</Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditTaskId(null)}>Cancel</Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={task.id} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5 hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{task.name}</span>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {cat && (
                            <Badge variant="outline" className="text-xs">
                              <div className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: cat.color }} />
                              {cat.name}
                            </Badge>
                          )}
                          <Badge variant="secondary" className={cn("text-xs", taskStatusColors[task.status])}>
                            {task.status}
                          </Badge>
                          {(task.start_date || task.end_date) && (
                            <span className="text-xs text-muted-foreground">
                              📅 {formatDate(task.start_date)}
                              {task.start_date && task.end_date && " → "}
                              {formatDate(task.end_date)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => startEdit(task)} className="shrink-0 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-blue-500">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteTaskMutation.mutate(task.id)} className="shrink-0 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
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
        <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
          {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Airdrop
        </Button>
      </div>
    </div>
  );
}
