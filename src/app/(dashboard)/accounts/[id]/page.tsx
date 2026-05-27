"use client";

import { useState, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAccount,
  getAirdrops,
  assignAirdrop,
  removeAirdropFromAccount,
  createTask,
  updateTask,
  deleteTask,
  createWallet,
  deleteWallet,
  getCategories,
  getTodayTasks,
  getDateTasks,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Wallet,
  Rocket,
  ChevronDown,
  ChevronUp,
  Pencil,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AccountAirdrop, Task } from "@/lib/types";

const statusOptions = ["pending", "ongoing", "finish", "cancel"];

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  ongoing: "bg-yellow-100 text-yellow-700",
  finish: "bg-green-100 text-green-700",
  cancel: "bg-red-100 text-red-700",
};

export default function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = use(params);
  const id = Number(idStr);
  const queryClient = useQueryClient();

  // State
  const [assignOpen, setAssignOpen] = useState(false);
  const [expandedAa, setExpandedAa] = useState<number | null>(null);
  const [addTaskAaId, setAddTaskAaId] = useState<number | null>(null);
  const [taskName, setTaskName] = useState("");
  const [taskCategoryId, setTaskCategoryId] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState("pending");
  const [taskDate, setTaskDate] = useState("");
  const [taskFrequency, setTaskFrequency] = useState("once");
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletLabel, setWalletLabel] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletChain, setWalletChain] = useState("");
  const [removeAaId, setRemoveAaId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Edit task state
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<string>("");
  const [editStatus, setEditStatus] = useState("pending");
  const [editDate, setEditDate] = useState("");
  const [editFrequency, setEditFrequency] = useState("once");

  // Queries
  const { data: account, isLoading } = useQuery({
    queryKey: ["account", id],
    queryFn: () => getAccount(id),
  });

  const { data: allAirdrops } = useQuery({
    queryKey: ["airdrops"],
    queryFn: getAirdrops,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: todayTasks } = useQuery({
    queryKey: ["today-tasks", id, selectedDate],
    queryFn: () => getDateTasks(id, selectedDate),
  });

  function changeDate(delta: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split("T")[0]);
  }

  function isToday() {
    return selectedDate === new Date().toISOString().split("T")[0];
  }

  const assignedIds = new Set((account?.account_airdrops ?? []).map((aa) => aa.airdrop_id));
  const availableAirdrops = (allAirdrops ?? []).filter((a) => !assignedIds.has(a.id));

  // Mutations
  const assignMutation = useMutation({
    mutationFn: (airdropId: number) => assignAirdrop(id, { airdrop_id: airdropId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", id] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Airdrop assigned & tasks synced");
      setAssignOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: (accountAirdropId: number) => removeAirdropFromAccount(id, accountAirdropId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", id] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Airdrop removed");
      setRemoveAaId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: { aaId: number; name: string; category_id?: number; status: string; frequency?: string; date?: string }) =>
      createTask(data.aaId, { name: data.name, category_id: data.category_id, status: data.status, frequency: data.frequency, date: data.date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task added");
      setTaskName("");
      setTaskCategoryId("");
      setTaskStatus("pending");
      setTaskDate("");
      setTaskFrequency("once");
      setAddTaskAaId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: { taskId: number; name: string; category_id?: number; status: string; frequency?: string; date?: string }) =>
      updateTask(data.taskId, {
        name: data.name,
        category_id: data.category_id,
        status: data.status,
        frequency: data.frequency,
        date: data.date,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setEditTaskId(null);
      toast.success("Task updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task deleted");
    },
  });

  const createWalletMutation = useMutation({
    mutationFn: createWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", id] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Wallet added");
      setWalletLabel("");
      setWalletAddress("");
      setWalletChain("");
      setWalletOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteWalletMutation = useMutation({
    mutationFn: (walletId: number) => deleteWallet(walletId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", id] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Wallet deleted");
    },
  });

  function handleAddTask(aaId: number) {
    if (!taskName.trim()) return;
    createTaskMutation.mutate({
      aaId,
      name: taskName.trim(),
      category_id: taskCategoryId && taskCategoryId !== "none" ? Number(taskCategoryId) : undefined,
      status: taskStatus,
      frequency: taskFrequency,
      date: taskDate || undefined,
    });
  }

  function handleUpdateTask(taskId: number) {
    if (!editName.trim()) return;
    updateTaskMutation.mutate({
      taskId,
      name: editName.trim(),
      category_id: editCategoryId && editCategoryId !== "none" ? Number(editCategoryId) : undefined,
      status: editStatus,
      frequency: editFrequency,
      date: editDate || undefined,
    });
  }

  function startEdit(task: Task) {
    setEditTaskId(task.id);
    setEditName(task.name);
    setEditCategoryId(task.category_id?.toString() || "");
    setEditStatus(task.status);
    setEditFrequency(task.frequency || "once");
    setEditDate(task.date ? task.date.split("T")[0] : "");
  }

  function getCategoryName(id: number | null | undefined) {
    if (!id || !categories) return null;
    return categories.find((c) => c.id === id);
  }

  function handleAddWallet(e: React.FormEvent) {
    e.preventDefault();
    if (!walletLabel || !walletAddress || !walletChain) {
      toast.error("All wallet fields required");
      return;
    }
    createWalletMutation.mutate({
      label: walletLabel,
      address: walletAddress,
      chain: walletChain,
      account_id: id,
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500">Account not found</p>
        <Button variant="outline" className="mt-3" render={<Link href="/accounts" />}>
          Back to Accounts
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" render={<Link href="/accounts" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: account.color }} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
            {account.notes && <p className="text-sm text-gray-500">{account.notes}</p>}
          </div>
        </div>
      </div>

      {/* Today's Tasks */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">
                {isToday() ? "Today's Tasks" : `Tasks — ${new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {(todayTasks ?? []).length} tasks
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-xs" onClick={() => changeDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant={isToday() ? "default" : "ghost"} size="sm" onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}>
                Today
              </Button>
              <Button variant="ghost" size="icon-xs" onClick={() => changeDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(todayTasks ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {isToday() ? "No tasks for today. Add tasks below!" : "No tasks for this date."}
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {(todayTasks ?? []).map((task) => {
                const cat = task.category;
                return (
                  <div key={task.id} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{task.name}</span>
                        {task.account_airdrop?.airdrop && (
                          <Badge variant="outline" className="text-xs text-gray-500">
                            {task.account_airdrop.airdrop.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {cat && (
                          <Badge variant="outline" className="text-xs">
                            <div className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: cat.color }} />
                            {cat.name}
                          </Badge>
                        )}
                        {task.frequency && task.frequency !== "once" && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600">
                            {task.frequency}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Select value={task.status} onValueChange={(v) => {
                      if (v) updateTaskMutation.mutate({ taskId: task.id, name: task.name, status: v, frequency: task.frequency });
                    }}>
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem key={s} value={s}>
                            <Badge variant="secondary" className={cn("text-xs", statusColors[s])}>{s}</Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          )}
          {/* Summary */}
          {(todayTasks ?? []).length > 0 && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-blue-100">
              {[
                { label: "Pending", status: "pending", color: "text-gray-600" },
                { label: "Ongoing", status: "ongoing", color: "text-yellow-600" },
                { label: "Finish", status: "finish", color: "text-green-600" },
                { label: "Edit", status: "edit", color: "text-orange-600" },
              ].map((s) => {
                const count = (todayTasks ?? []).filter((t) => t.status === s.status).length;
                return (
                  <span key={s.status} className={cn("text-xs font-medium", s.color)}>
                    {s.label}: {count}
                  </span>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Airdrops Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Airdrops</h2>
        <Button size="sm" onClick={() => setAssignOpen(true)} disabled={availableAirdrops.length === 0}>
          <Plus className="mr-1 h-4 w-4" />
          Assign Airdrop
        </Button>
      </div>

      {(account.account_airdrops ?? []).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Rocket className="mb-3 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">No airdrops assigned yet</p>
            <p className="text-xs text-gray-400 mt-1">Click "Assign Airdrop" to add from catalog</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {(account.account_airdrops ?? []).map((aa) => {
            const tasks = aa.tasks ?? [];
            const finished = tasks.filter((t) => t.status === "finish").length;
            const total = tasks.length;
            const pct = total > 0 ? Math.round((finished / total) * 100) : 0;
            const isExpanded = expandedAa === aa.id;

            return (
              <Card key={aa.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {aa.airdrop?.name ?? "Unknown"}
                      </CardTitle>
                      {aa.airdrop?.chain && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          {aa.airdrop.chain}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {finished}/{total}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setExpandedAa(isExpanded ? null : aa.id)}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setRemoveAaId(aa.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={pct} className="flex-1 h-2" />
                    <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                      {pct}%
                    </span>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="flex flex-col gap-1.5">
                      {tasks.map((task) => {
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
                                <Select value={editFrequency} onValueChange={(v) => setEditFrequency(v ?? "once")}>
                                  <SelectTrigger className="w-28">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="once">Once</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                  </SelectContent>
                                </Select>
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
                            className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors bg-gray-50 hover:bg-gray-100"
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
                                {task.frequency && task.frequency !== "once" && (
                                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600">
                                    {task.frequency}
                                  </Badge>
                                )}
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

                      {/* Add task */}
                      {addTaskAaId === aa.id ? (
                        <div className="flex flex-col gap-2 mt-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Task name..."
                              value={taskName}
                              onChange={(e) => setTaskName(e.target.value)}
                              className="flex-1"
                              onKeyDown={(e) => e.key === "Enter" && handleAddTask(aa.id)}
                            />
                            <Button size="sm" onClick={() => handleAddTask(aa.id)} disabled={!taskName.trim()}>
                              Add
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setAddTaskAaId(null); setTaskName(""); }}>
                              Cancel
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
                            <Select value={taskFrequency} onValueChange={(v) => setTaskFrequency(v ?? "once")}>
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="once">Once</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 self-start"
                          onClick={() => setAddTaskAaId(aa.id)}
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          Add Task
                        </Button>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Wallets Section */}
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-lg font-semibold text-gray-900">Wallets</h2>
        <Button size="sm" onClick={() => setWalletOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add Wallet
        </Button>
      </div>

      {(account.wallets ?? []).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Wallet className="mb-3 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">No wallets yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(account.wallets ?? []).map((w) => (
            <Card key={w.id}>
              <CardContent className="flex items-center gap-3 py-3">
                <Wallet className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{w.label}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{w.address}</p>
                  <Badge variant="outline" className="text-xs mt-1">{w.chain}</Badge>
                </div>
                <Button variant="ghost" size="icon-xs" onClick={() => deleteWalletMutation.mutate(w.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Airdrop Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Airdrop</DialogTitle>
            <DialogDescription>
              Select an airdrop from the catalog. Tasks will be auto-synced.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {availableAirdrops.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                All airdrops are already assigned to this account.
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {availableAirdrops.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => assignMutation.mutate(a.id)}
                    disabled={assignMutation.isPending}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-gray-50",
                      assignMutation.isPending && "opacity-50"
                    )}
                  >
                    <Rocket className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{a.name}</p>
                      <div className="flex gap-1.5 mt-1">
                        <Badge variant="outline" className="text-xs">{a.chain}</Badge>
                        <Badge variant="secondary" className="text-xs">{a.category}</Badge>
                      </div>
                    </div>
                    {assignMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Airdrop Confirmation */}
      <Dialog open={!!removeAaId} onOpenChange={() => setRemoveAaId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Airdrop</DialogTitle>
            <DialogDescription>
              This will remove this airdrop and all its tasks from this account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={() => removeAaId && removeMutation.mutate(removeAaId)}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Wallet Dialog */}
      <Dialog open={walletOpen} onOpenChange={setWalletOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Wallet</DialogTitle>
            <DialogDescription>Add a wallet to this account</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddWallet} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Label</Label>
              <Input placeholder="e.g. Main Wallet" value={walletLabel} onChange={(e) => setWalletLabel(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Address</Label>
              <Input placeholder="0x..." value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Chain</Label>
              <Input placeholder="e.g. Ethereum" value={walletChain} onChange={(e) => setWalletChain(e.target.value)} />
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button type="submit" disabled={createWalletMutation.isPending}>
                {createWalletMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
