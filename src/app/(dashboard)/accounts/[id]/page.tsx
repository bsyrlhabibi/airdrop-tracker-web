"use client";

import { useState, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAccount,
  getAirdrops,
  assignAirdrop,
  removeAirdropFromAccount,
  createTask,
  completeTask,
  resetTask,
  deleteTask,
  createWallet,
  deleteWallet,
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
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AccountAirdrop } from "@/lib/types";

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
  const [assignAirdropId, setAssignAirdropId] = useState("");
  const [expandedAa, setExpandedAa] = useState<number | null>(null);
  const [addTaskAaId, setAddTaskAaId] = useState<number | null>(null);
  const [taskDesc, setTaskDesc] = useState("");
  const [taskFreq, setTaskFreq] = useState("once");
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletLabel, setWalletLabel] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletChain, setWalletChain] = useState("");
  const [removeAaId, setRemoveAaId] = useState<number | null>(null);

  // Queries
  const { data: account, isLoading } = useQuery({
    queryKey: ["account", id],
    queryFn: () => getAccount(id),
  });

  const { data: allAirdrops } = useQuery({
    queryKey: ["airdrops"],
    queryFn: getAirdrops,
  });

  // Filter out already assigned airdrops
  const assignedIds = new Set((account?.account_airdrops ?? []).map((aa) => aa.airdrop_id));
  const availableAirdrops = (allAirdrops ?? []).filter((a) => !assignedIds.has(a.id));

  // Mutations
  const assignMutation = useMutation({
    mutationFn: (airdropId: number) =>
      assignAirdrop(id, { airdrop_id: airdropId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", id] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Airdrop assigned & tasks synced");
      setAssignOpen(false);
      setAssignAirdropId("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: (accountAirdropId: number) =>
      removeAirdropFromAccount(id, accountAirdropId),
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
    mutationFn: (data: { aaId: number; description: string; frequency: string }) =>
      createTask(data.aaId, { description: data.description, frequency: data.frequency }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task added");
      setTaskDesc("");
      setAddTaskAaId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: number) => completeTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const resetTaskMutation = useMutation({
    mutationFn: (taskId: number) => resetTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
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
    if (!taskDesc.trim()) return;
    createTaskMutation.mutate({ aaId, description: taskDesc.trim(), frequency: taskFreq });
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
            const completed = tasks.filter((t) => t.is_completed).length;
            const total = tasks.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
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
                        {completed}/{total}
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
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={pct} className="flex-1 h-2" />
                    <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                      {pct}%
                    </span>
                  </div>
                </CardHeader>

                {/* Expanded: Task list */}
                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="flex flex-col gap-1.5">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                            task.is_completed ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"
                          )}
                        >
                          <button
                            onClick={() =>
                              task.is_completed
                                ? resetTaskMutation.mutate(task.id)
                                : completeTaskMutation.mutate(task.id)
                            }
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

                      {/* Add task */}
                      {addTaskAaId === aa.id ? (
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="Task description..."
                            value={taskDesc}
                            onChange={(e) => setTaskDesc(e.target.value)}
                            className="flex-1"
                            onKeyDown={(e) => e.key === "Enter" && handleAddTask(aa.id)}
                          />
                          <Select value={taskFreq} onValueChange={(v) => v && setTaskFreq(v)}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="once">Once</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={() => handleAddTask(aa.id)} disabled={!taskDesc.trim()}>
                            Add
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setAddTaskAaId(null); setTaskDesc(""); }}>
                            Cancel
                          </Button>
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
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => deleteWalletMutation.mutate(w.id)}
                >
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
                    onClick={() => {
                      assignMutation.mutate(a.id);
                    }}
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
                    {assignMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
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
