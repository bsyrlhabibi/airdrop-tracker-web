"use client";

import { useState, use, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAccount,
  getAccounts,
  getAirdrops,
  getAirdropTasks,
  assignAirdrop,
  removeAirdropFromAccount,
  createTask,
  updateTask,
  deleteTask,
  createWallet,
  deleteWallet,
  getCategories,
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
  ChevronLeft,
  ChevronRight,
  Calendar,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { cn, slugify, formatLocalDate } from "@/lib/utils";
import type { AccountAirdrop, AirdropTask, Task } from "@/lib/types";

const statusOptions = ["pending", "ongoing", "finish", "missed"];

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  ongoing: "bg-yellow-100 text-yellow-700",
  finish: "bg-green-100 text-green-700",
  missed: "bg-red-100 text-red-700",
};

// Airdrop task status (global template)
const airdropTaskStatusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  ongoing: "bg-blue-100 text-blue-700",
  end: "bg-green-100 text-green-700",
};

export default function AccountDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const queryClient = useQueryClient();

  // Resolve slug → account ID
  const { data: allAccounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const accountId = useMemo(() => {
    if (!allAccounts) return null;
    const found = allAccounts.find((a) => slugify(a.name) === slug);
    if (found) return found.id;
    const num = Number(slug);
    if (!isNaN(num)) return num;
    return null;
  }, [allAccounts, slug]);

  // State
  const [assignOpen, setAssignOpen] = useState(false);
  const [expandedAa, setExpandedAa] = useState<number | null>(null);
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletLabel, setWalletLabel] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletChain, setWalletChain] = useState("");
  const [removeAaId, setRemoveAaId] = useState<number | null>(null);

  // Today's tasks state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [taskAaName, setTaskAaName] = useState<string>("");
  const [taskName, setTaskName] = useState("");
  const [taskCategoryName, setTaskCategoryName] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState("pending");
  const [taskFrequency, setTaskFrequency] = useState("daily");
  const [taskDate, setTaskDate] = useState("");

  // Edit task state
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategoryName, setEditCategoryName] = useState<string>("");
  const [editStatus, setEditStatus] = useState("pending");
  const [editFrequency, setEditFrequency] = useState("daily");
  const [editDate, setEditDate] = useState("");
  const [editGasSpent, setEditGasSpent] = useState("");
  const [editTxHash, setEditTxHash] = useState("");

  // Queries
  const { data: account, isLoading } = useQuery({
    queryKey: ["account", accountId],
    queryFn: () => getAccount(accountId!),
    enabled: !!accountId,
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
    queryKey: ["today-tasks", accountId, selectedDate],
    queryFn: () => getDateTasks(accountId!, selectedDate),
    enabled: !!accountId,
  });

  const assignedIds = new Set((account?.account_airdrops ?? []).map((aa) => aa.airdrop_id));
  const availableAirdrops = (allAirdrops ?? []).filter((a) => !assignedIds.has(a.id));

  // Date navigation
  function changeDate(delta: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split("T")[0]);
  }

  function isToday() {
    return selectedDate === new Date().toISOString().split("T")[0];
  }

  // Mutations
  const assignMutation = useMutation({
    mutationFn: (airdropId: number) => assignAirdrop(accountId!, { airdrop_id: airdropId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", accountId] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["today-tasks", accountId] });
      toast.success("Airdrop assigned");
      setAssignOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: (airdropId: number) => removeAirdropFromAccount(accountId!, airdropId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", accountId] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["today-tasks", accountId] });
      toast.success("Airdrop removed");
      setRemoveAaId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: { aaId: number; name: string; category_id?: number; status: string; frequency: string; date?: string }) =>
      createTask(data.aaId, { name: data.name, category_id: data.category_id, status: data.status, frequency: data.frequency, date: data.date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", accountId] });
      queryClient.invalidateQueries({ queryKey: ["today-tasks", accountId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task added");
      setTaskName("");
      setTaskCategoryName("");
      setTaskStatus("pending");
      setTaskFrequency("daily");
      setAddTaskOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: { taskId: number; name?: string; category_id?: number; status?: string; frequency?: string; date?: string; gas_spent?: number; tx_hash?: string }) =>
      updateTask(data.taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", accountId] });
      queryClient.invalidateQueries({ queryKey: ["today-tasks", accountId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setEditTaskId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", accountId] });
      queryClient.invalidateQueries({ queryKey: ["today-tasks", accountId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task deleted");
    },
  });

  const createWalletMutation = useMutation({
    mutationFn: createWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", accountId] });
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
      queryClient.invalidateQueries({ queryKey: ["account", accountId] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Wallet deleted");
    },
  });

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskName.trim() || !taskAaName) return;
    const aa = (account?.account_airdrops ?? []).find((a) => (a.airdrop?.name ?? "") === taskAaName);
    if (!aa) return;
    createTaskMutation.mutate({
      aaId: aa.id,
      name: taskName.trim(),
      category_id: taskCategoryName && taskCategoryName !== "none" ? (categories ?? []).find((c) => c.name === taskCategoryName)?.id : undefined,
      status: taskStatus,
      frequency: taskFrequency,
      date: taskDate || selectedDate,
    });
  }

  function startEditTask(task: Task) {
    setEditTaskId(task.id);
    setEditName(task.name);
    setEditCategoryName((categories ?? []).find((c) => c.id === task.category_id)?.name || "");
    setEditStatus(task.status);
    setEditFrequency(task.frequency || "daily");
    setEditDate(task.date ? task.date.split("T")[0] : "");
    setEditGasSpent(task.gas_spent ? String(task.gas_spent) : "");
    setEditTxHash(task.tx_hash || "");
  }

  function handleUpdateTask() {
    if (!editTaskId) return;
    updateTaskMutation.mutate({
      taskId: editTaskId,
      name: editName || undefined,
      category_id: editCategoryName && editCategoryName !== "none" ? (categories ?? []).find((c) => c.name === editCategoryName)?.id : undefined,
      status: editStatus,
      frequency: editFrequency,
      date: editDate || undefined,
      gas_spent: editGasSpent ? parseFloat(editGasSpent) : undefined,
      tx_hash: editTxHash || undefined,
    });
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
    createWalletMutation.mutate({ label: walletLabel, address: walletAddress, chain: walletChain, account_id: accountId! });
  }

  // Calculate stats for today's tasks
  const todayStats = {
    total: (todayTasks ?? []).length,
    pending: (todayTasks ?? []).filter((t) => t.status === "pending").length,
    ongoing: (todayTasks ?? []).filter((t) => t.status === "ongoing").length,
    finish: (todayTasks ?? []).filter((t) => t.status === "finish").length,
    edit: (todayTasks ?? []).filter((t) => t.status === "missed").length,
  };

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
        <Button variant="outline" className="mt-3" render={<Link href="/accounts" />}>Back to Accounts</Button>
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

      {/* ===== TODAY'S TASKS (Account Tasks - Daily Tracking) ===== */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">
                {isToday() ? "Today's Tasks" : `Tasks — ${formatLocalDate(selectedDate, { weekday: "short", month: "short", day: "numeric" })}`}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">{todayStats.total} tasks</Badge>
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
          {/* Add task button */}
          <Button variant="outline" size="sm" className="mb-3" onClick={() => { setAddTaskOpen(true); setTaskDate(selectedDate); }}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Task
          </Button>

          {(todayTasks ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {isToday() ? "No tasks for today. Add tasks above!" : "No tasks for this date."}
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {(todayTasks ?? []).map((task) => {
                const cat = getCategoryName(task.category_id);
                const isEditing = editTaskId === task.id;

                if (isEditing) {
                  return (
                    <div key={task.id} className="flex flex-col gap-2 rounded-lg border border-blue-200 bg-white p-3">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Task name" />
                      <div className="flex flex-wrap gap-2">
                        <Select value={editCategoryName} onValueChange={(v) => setEditCategoryName(v ?? "")}>
                          <SelectTrigger className="w-36"><SelectValue placeholder="Category" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Category</SelectItem>
                            {(categories ?? []).map((c) => (
                              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={editStatus} onValueChange={(v) => setEditStatus(v ?? "pending")}>
                          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={editFrequency} onValueChange={(v) => setEditFrequency(v ?? "daily")}>
                          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once">Once</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-36" />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Label className="text-xs text-gray-500">Gas Spent:</Label>
                          <Input type="number" step="0.0001" placeholder="0.001" value={editGasSpent} onChange={(e) => setEditGasSpent(e.target.value)} className="w-28" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Label className="text-xs text-gray-500">Tx Hash:</Label>
                          <Input placeholder="0xabc..." value={editTxHash} onChange={(e) => setEditTxHash(e.target.value)} className="w-48" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleUpdateTask} disabled={updateTaskMutation.isPending}>Save</Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditTaskId(null)}>Cancel</Button>
                      </div>
                    </div>
                  );
                }

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
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600">{task.frequency}</Badge>
                        )}
                        {task.gas_spent > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ⛽ {task.gas_spent}
                          </span>
                        )}
                        {task.tx_hash && (
                          <span className="text-xs text-muted-foreground truncate max-w-[120px]" title={task.tx_hash}>
                            🔗 {task.tx_hash.slice(0, 10)}...
                          </span>
                        )}
                      </div>
                    </div>
                    <Select value={task.status} onValueChange={(v) => {
                      if (v) updateTaskMutation.mutate({ taskId: task.id, status: v });
                    }}>
                      <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button onClick={() => startEditTask(task)} className="shrink-0 text-gray-400 hover:text-blue-500">
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

          {/* Progress bar */}
          {todayStats.total > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <Progress value={todayStats.total > 0 ? Math.round((todayStats.finish / todayStats.total) * 100) : 0} className="flex-1 h-2" />
              <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                {todayStats.total > 0 ? Math.round((todayStats.finish / todayStats.total) * 100) : 0}%
              </span>
            </div>
          )}

          {/* Summary */}
          {todayStats.total > 0 && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-blue-100">
              {[
                { label: "Pending", key: "pending", color: "text-gray-600" },
                { label: "Ongoing", key: "ongoing", color: "text-yellow-600" },
                { label: "Finish", key: "finish", color: "text-green-600" },
                { label: "Missed", key: "edit", color: "text-red-600" },
              ].map((s) => (
                <span key={s.key} className={cn("text-xs font-medium", s.color)}>
                  {s.label}: {todayStats[s.key as keyof typeof todayStats]}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== AIRDROPS SECTION (Global Template Reference) ===== */}
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
              <AirdropCard
                key={aa.id}
                aa={aa}
                tasks={tasks}
                finished={finished}
                total={total}
                pct={pct}
                isExpanded={isExpanded}
                onToggle={() => setExpandedAa(isExpanded ? null : aa.id)}
                onRemove={() => setRemoveAaId(aa.airdrop_id)}
              />
            );
          })}
        </div>
      )}

      {/* ===== WALLET SECTION ===== */}
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

      {/* ===== DIALOGS ===== */}

      {/* Add Task Dialog */}
      <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>Add a new tracking task for this account</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Airdrop *</Label>
              <Select value={taskAaName} onValueChange={(v) => setTaskAaName(v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Select airdrop" /></SelectTrigger>
                <SelectContent>
                  {(account.account_airdrops ?? []).map((aa) => (
                    <SelectItem key={aa.id} value={aa.airdrop?.name ?? aa.id.toString()}>
                      {aa.airdrop?.name ?? "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Task Name *</Label>
              <Input placeholder="e.g. Bridge 0.1 ETH" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Select value={taskCategoryName} onValueChange={(v) => setTaskCategoryName(v ?? "")}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {(categories ?? []).map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Frequency</Label>
                <Select value={taskFrequency} onValueChange={(v) => setTaskFrequency(v ?? "daily")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Select value={taskStatus} onValueChange={(v) => setTaskStatus(v ?? "pending")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Date</Label>
                <Input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button type="submit" disabled={createTaskMutation.isPending || !taskAaName}>
                {createTaskMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Airdrop Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Airdrop</DialogTitle>
            <DialogDescription>Select an airdrop from the catalog. Tasks will be auto-synced.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {availableAirdrops.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">All airdrops are already assigned.</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {availableAirdrops.map((a) => (
                  <button key={a.id} onClick={() => assignMutation.mutate(a.id)} disabled={assignMutation.isPending}
                    className={cn("flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-gray-50", assignMutation.isPending && "opacity-50")}>
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
            <DialogDescription>This will remove this airdrop and all its tasks from this account.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={() => removeAaId && removeMutation.mutate(removeAaId)} disabled={removeMutation.isPending}>
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

// ===== AIRDROP CARD COMPONENT =====
// Shows airdrop info + global task list (read-only reference)
function AirdropCard({
  aa,
  tasks,
  finished,
  total,
  pct,
  isExpanded,
  onToggle,
  onRemove,
}: {
  aa: AccountAirdrop;
  tasks: Task[];
  finished: number;
  total: number;
  pct: number;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const { data: airdropTasks } = useQuery({
    queryKey: ["airdrop-tasks", aa.airdrop_id],
    queryFn: () => getAirdropTasks(aa.airdrop_id),
    enabled: isExpanded,
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CardTitle className="text-base truncate">{aa.airdrop?.name ?? "Unknown"}</CardTitle>
            {aa.airdrop?.chain && (
              <Badge variant="outline" className="text-xs shrink-0">{aa.airdrop.chain}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="icon-xs" onClick={onToggle}>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={onRemove}>
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </Button>
          </div>
        </div>
        {/* Progress removed — airdrop section shows template only */}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {/* Show AIRDROP tasks (global template) as reference */}
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Task Template</p>
          {(airdropTasks ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No tasks defined for this airdrop.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {(airdropTasks ?? []).map((task) => (
                <div key={task.id} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm">{task.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      {task.category && (
                        <Badge variant="outline" className="text-xs">
                          <div className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: task.category.color }} />
                          {task.category.name}
                        </Badge>
                      )}
                      <Badge variant="secondary" className={cn("text-xs", airdropTaskStatusColors[task.status] || "bg-gray-100 text-gray-700")}>
                        {task.status}
                      </Badge>
                      {(task.start_date || task.end_date) && (
                        <span className="text-xs text-muted-foreground">
                          📅 {task.start_date ? formatLocalDate(task.start_date, { month: "short", day: "numeric" }) : "?"}
                          {task.start_date && task.end_date && " → "}
                          {task.end_date ? formatLocalDate(task.end_date, { month: "short", day: "numeric" }) : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            ℹ️ Edit tasks on the <Link href={`/airdrops/${aa.airdrop_id}`} className="text-blue-600 underline">airdrop detail page</Link>
          </p>
        </CardContent>
      )}
    </Card>
  );
}
