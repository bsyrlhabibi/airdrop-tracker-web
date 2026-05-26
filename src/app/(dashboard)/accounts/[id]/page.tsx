"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAccount,
  removeAirdropFromAccount,
  createTask,
  completeTask,
  resetTask,
  deleteTask,
  createWallet,
  deleteWallet,
  cloneAccount,
} from "@/lib/api";
import { TaskItem } from "@/components/task-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Copy,
  Wallet,
  Rocket,
  CheckCircle2,
  ClipboardCopy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

export default function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = use(params);
  const id = Number(idStr);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Task form state (for adding tasks to an account-airdrop)
  const [addTaskAaId, setAddTaskAaId] = useState<number | null>(null);
  const [taskDesc, setTaskDesc] = useState("");
  const [taskFreq, setTaskFreq] = useState("once");

  // Wallet form state
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletLabel, setWalletLabel] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletChain, setWalletChain] = useState("");

  // Remove airdrop confirm
  const [removeAaId, setRemoveAaId] = useState<number | null>(null);

  // Clone dialog
  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneName, setCloneName] = useState("");
  const [cloneColor, setCloneColor] = useState("#3B82F6");

  const { data: account, isLoading } = useQuery({
    queryKey: ["account", id],
    queryFn: () => getAccount(id),
  });

  const removeMutation = useMutation({
    mutationFn: (accountAirdropId: number) =>
      removeAirdropFromAccount(id, accountAirdropId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", id] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Airdrop removed from account");
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
      setTaskFreq("once");
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
    onError: (err: Error) => toast.error(err.message),
  });

  const resetTaskMutation = useMutation({
    mutationFn: (taskId: number) => resetTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
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
    onError: (err: Error) => toast.error(err.message),
  });

  const createWalletMutation = useMutation({
    mutationFn: createWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", id] });
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
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Wallet deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const cloneMutation = useMutation({
    mutationFn: () => cloneAccount(id, { name: cloneName, color: cloneColor }),
    onSuccess: (newAccount) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Account cloned");
      setCloneOpen(false);
      router.push(`/accounts/${newAccount.id}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!addTaskAaId || !taskDesc.trim()) {
      toast.error("Task description is required");
      return;
    }
    createTaskMutation.mutate({
      aaId: addTaskAaId,
      description: taskDesc,
      frequency: taskFreq,
    });
  }

  function handleAddWallet(e: React.FormEvent) {
    e.preventDefault();
    if (!walletLabel || !walletAddress || !walletChain) {
      toast.error("All wallet fields are required");
      return;
    }
    createWalletMutation.mutate({
      account_id: id,
      label: walletLabel,
      address: walletAddress,
      chain: walletChain,
    });
  }

  function handleClone(e: React.FormEvent) {
    e.preventDefault();
    if (!cloneName.trim()) {
      toast.error("Name is required");
      return;
    }
    cloneMutation.mutate();
  }

  function copyAddress(addr: string) {
    navigator.clipboard.writeText(addr);
    toast.success("Address copied");
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
        <p className="text-muted-foreground">Account not found</p>
        <Button
          variant="ghost"
          className="mt-2"
          render={<Link href="/accounts" />}
        >
          Back to accounts
        </Button>
      </div>
    );
  }

  const accountAirdrops = account.account_airdrops ?? [];
  const allTasks = accountAirdrops.flatMap((aa) =>
    (aa.tasks ?? []).map((t) => ({ ...t, airdropName: aa.airdrop?.name ?? "Unknown" }))
  );
  const wallets = account.wallets ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/accounts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: account.color }}
            />
            <h1 className="text-2xl font-bold text-gray-900">
              {account.name}
            </h1>
          </div>
          {account.notes && (
            <p className="mt-1 text-sm text-muted-foreground">
              {account.notes}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCloneName(`${account.name} Copy`);
            setCloneColor(account.color);
            setCloneOpen(true);
          }}
        >
          <ClipboardCopy className="mr-1.5 h-3.5 w-3.5" />
          Clone
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="airdrops" className="w-full">
        <TabsList>
          <TabsTrigger value="airdrops">
            <Rocket className="mr-1.5 h-3.5 w-3.5" />
            Airdrops ({accountAirdrops.length})
          </TabsTrigger>
          <TabsTrigger value="wallets">
            <Wallet className="mr-1.5 h-3.5 w-3.5" />
            Wallets ({wallets.length})
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Tasks ({allTasks.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Airdrops */}
        <TabsContent value="airdrops" className="mt-4">
          {accountAirdrops.length > 0 ? (
            <div className="flex flex-col gap-4">
              {accountAirdrops.map((aa) => {
                const tasks = aa.tasks ?? [];
                const completed = tasks.filter((t) => t.is_completed).length;
                const total = tasks.length;
                const progress = total > 0 ? (completed / total) * 100 : 0;

                return (
                  <Card key={aa.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <CardTitle className="text-base">
                            {aa.airdrop?.name ?? "Unknown"}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-2">
                            {aa.airdrop?.chain && (
                              <Badge variant="outline" className="text-xs">
                                {aa.airdrop.chain}
                              </Badge>
                            )}
                            {aa.airdrop?.category && (
                              <Badge variant="secondary" className="text-xs">
                                {aa.airdrop.category}
                              </Badge>
                            )}
                            {aa.airdrop?.priority && (
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs",
                                  priorityColors[aa.airdrop.priority]
                                )}
                              >
                                {aa.airdrop.priority}
                              </Badge>
                            )}
                            {aa.airdrop?.status && (
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs",
                                  statusColors[aa.airdrop.status]
                                )}
                              >
                                {aa.airdrop.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => {
                              setAddTaskAaId(aa.id);
                              setTaskDesc("");
                              setTaskFreq("once");
                            }}
                            title="Add task"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setRemoveAaId(aa.id)}
                            title="Remove from account"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      {total > 0 && (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {completed}/{total} tasks
                            </span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>
                      )}

                      {/* Inline task list for this account-airdrop */}
                      {tasks.length > 0 && (
                        <div className="flex flex-col gap-2">
                          {tasks.map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              onComplete={() =>
                                completeTaskMutation.mutate(task.id)
                              }
                              onReset={() =>
                                resetTaskMutation.mutate(task.id)
                              }
                              onDelete={() =>
                                deleteTaskMutation.mutate(task.id)
                              }
                              completing={completeTaskMutation.isPending}
                              resetting={resetTaskMutation.isPending}
                              deleting={deleteTaskMutation.isPending}
                            />
                          ))}
                        </div>
                      )}

                      {/* Inline add task form */}
                      {addTaskAaId === aa.id && (
                        <form
                          onSubmit={handleAddTask}
                          className="flex flex-col gap-2 rounded-lg border bg-gray-50 p-3 sm:flex-row"
                        >
                          <Input
                            placeholder="New task description..."
                            value={taskDesc}
                            onChange={(e) => setTaskDesc(e.target.value)}
                            className="flex-1"
                            autoFocus
                          />
                          <Select
                            value={taskFreq}
                            onValueChange={(v) => v && setTaskFreq(v)}
                          >
                            <SelectTrigger className="w-full sm:w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="once">Once</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              size="sm"
                              disabled={createTaskMutation.isPending}
                            >
                              {createTaskMutation.isPending ? (
                                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Plus className="mr-1 h-3.5 w-3.5" />
                              )}
                              Add
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setAddTaskAaId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
              <Rocket className="mb-4 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium text-gray-900">
                No airdrops assigned
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Go to the Airdrops catalog and assign some to this account
              </p>
              <Button render={<Link href="/airdrops" />}>
                <Plus className="mr-2 h-4 w-4" />
                Browse Airdrops
              </Button>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: Wallets */}
        <TabsContent value="wallets" className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Wallet Addresses
            </h3>
            <Button size="sm" onClick={() => setWalletOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Wallet
            </Button>
          </div>
          {wallets.length > 0 ? (
            <div className="flex flex-col gap-3">
              {wallets.map((wallet) => (
                <Card key={wallet.id}>
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {wallet.label}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {wallet.chain}
                        </Badge>
                      </div>
                      <code className="break-all rounded bg-gray-100 px-2 py-1 text-xs">
                        {wallet.address}
                      </code>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => copyAddress(wallet.address)}
                        title="Copy address"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => deleteWalletMutation.mutate(wallet.id)}
                        disabled={deleteWalletMutation.isPending}
                        title="Delete wallet"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
              <Wallet className="mb-4 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium text-gray-900">
                No wallets yet
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Add wallet addresses for this account
              </p>
              <Button onClick={() => setWalletOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Wallet
              </Button>
            </div>
          )}
        </TabsContent>

        {/* TAB 3: Tasks (all tasks across airdrops) */}
        <TabsContent value="tasks" className="mt-4">
          {allTasks.length > 0 ? (
            <div className="flex flex-col gap-4">
              {accountAirdrops.map((aa) => {
                const tasks = aa.tasks ?? [];
                if (tasks.length === 0) return null;
                return (
                  <div key={aa.id}>
                    <h4 className="mb-2 text-sm font-medium text-gray-700">
                      {aa.airdrop?.name ?? "Unknown"}
                    </h4>
                    <div className="flex flex-col gap-2">
                      {tasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onComplete={() =>
                            completeTaskMutation.mutate(task.id)
                          }
                          onReset={() => resetTaskMutation.mutate(task.id)}
                          onDelete={() => deleteTaskMutation.mutate(task.id)}
                          completing={completeTaskMutation.isPending}
                          resetting={resetTaskMutation.isPending}
                          deleting={deleteTaskMutation.isPending}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
              <CheckCircle2 className="mb-4 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium text-gray-900">
                No tasks yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Tasks will appear here when you assign airdrops to this account
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Wallet Dialog */}
      <Dialog open={walletOpen} onOpenChange={setWalletOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Wallet</DialogTitle>
            <DialogDescription>
              Add a wallet address to {account.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddWallet} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wallet-label">Label</Label>
              <Input
                id="wallet-label"
                placeholder="e.g. Main Wallet"
                value={walletLabel}
                onChange={(e) => setWalletLabel(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wallet-address">Address</Label>
              <Input
                id="wallet-address"
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wallet-chain">Chain</Label>
              <Input
                id="wallet-chain"
                placeholder="e.g. Ethereum"
                value={walletChain}
                onChange={(e) => setWalletChain(e.target.value)}
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={createWalletMutation.isPending}>
                {createWalletMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Airdrop Confirmation */}
      <Dialog open={!!removeAaId} onOpenChange={() => setRemoveAaId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Airdrop</DialogTitle>
            <DialogDescription>
              This will remove the airdrop and all its tasks from this account.
              The airdrop will remain in the global catalog.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => removeAaId && removeMutation.mutate(removeAaId)}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clone Account Dialog */}
      <Dialog open={cloneOpen} onOpenChange={setCloneOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Account</DialogTitle>
            <DialogDescription>
              Create a copy of {account.name} with all its airdrops and tasks
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleClone} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clone-name">Name</Label>
              <Input
                id="clone-name"
                value={cloneName}
                onChange={(e) => setCloneName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Color</Label>
              <div className="flex gap-2">
                {[
                  "#3B82F6", "#EF4444", "#10B981", "#F59E0B",
                  "#8B5CF6", "#EC4899", "#06B6D4", "#F97316",
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCloneColor(c)}
                    className={cn(
                      "h-7 w-7 rounded-full transition-all",
                      cloneColor === c ? "ring-2 ring-offset-2 ring-gray-400" : ""
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={cloneMutation.isPending}>
                {cloneMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Clone
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
