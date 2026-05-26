"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAirdrops,
  createAirdrop,
  deleteAirdrop,
  getAccounts,
  assignAirdrop,
  getTaskTemplates,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Search, Rocket, Loader2, UserPlus, ExternalLink, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Airdrop } from "@/lib/types";

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const statusColors: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  missed: "bg-red-100 text-red-700",
  upcoming: "bg-gray-100 text-gray-700",
};

export default function AirdropsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterChain, setFilterChain] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignAirdropId, setAssignAirdropId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Create form state
  const [name, setName] = useState("");
  const [chain, setChain] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  // Assign form state
  const [assignAccountId, setAssignAccountId] = useState("");
  const [assignTemplate, setAssignTemplate] = useState("");

  const { data: airdrops, isLoading } = useQuery({
    queryKey: ["airdrops"],
    queryFn: getAirdrops,
  });

  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const { data: templates } = useQuery({
    queryKey: ["task-templates"],
    queryFn: getTaskTemplates,
  });

  const createMutation = useMutation({
    mutationFn: createAirdrop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrops"] });
      toast.success("Airdrop created");
      resetForm();
      setCreateOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const assignMutation = useMutation({
    mutationFn: (data: { accountId: number; airdropId: number; template: string }) =>
      assignAirdrop(data.accountId, {
        airdrop_id: data.airdropId,
        template: data.template || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Airdrop assigned to account");
      setAssignOpen(false);
      setAssignAirdropId(null);
      setAssignAccountId("");
      setAssignTemplate("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAirdrop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrops"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Airdrop deleted");
      setDeleteId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function resetForm() {
    setName("");
    setChain("");
    setCategory("");
    setPriority("medium");
    setUrl("");
    setNotes("");
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !chain) {
      toast.error("Name and chain are required");
      return;
    }
    createMutation.mutate({ name, chain, category, priority, url, notes });
  }

  function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!assignAccountId || !assignAirdropId) {
      toast.error("Please select an account");
      return;
    }
    assignMutation.mutate({
      accountId: Number(assignAccountId),
      airdropId: assignAirdropId,
      template: assignTemplate,
    });
  }

  function openAssign(airdropId: number) {
    setAssignAirdropId(airdropId);
    setAssignAccountId("");
    setAssignTemplate("");
    setAssignOpen(true);
  }

  const filtered = (airdrops ?? []).filter((a) => {
    const matchesSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.chain.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase());
    const matchesChain = !filterChain || a.chain === filterChain;
    return matchesSearch && matchesChain;
  });

  const chains = [...new Set((airdrops ?? []).map((a) => a.chain))].filter(
    Boolean
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Airdrop Catalog</h1>
          <p className="text-sm text-muted-foreground">
            Global airdrop catalog — assign to accounts to start tracking
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Airdrop
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search airdrops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        {chains.length > 0 && (
          <Select
            value={filterChain || "__all__"}
            onValueChange={(v) => setFilterChain(!v || v === "__all__" ? "" : v)}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All chains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All chains</SelectItem>
              {chains.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((airdrop) => (
            <AirdropCatalogCard
              key={airdrop.id}
              airdrop={airdrop}
              onAssign={openAssign}
              onDelete={setDeleteId}
              onCardClick={() => router.push(`/airdrops/${airdrop.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Rocket className="mb-4 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium text-gray-900">
            {search || filterChain ? "No matches found" : "No airdrops yet"}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {search || filterChain
              ? "Try adjusting your search or filters"
              : "Create your first airdrop to get started"}
          </p>
          {!search && !filterChain && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Airdrop
            </Button>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Airdrop</DialogTitle>
            <DialogDescription>
              Add a new airdrop to the global catalog
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g. EigenLayer"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chain">Chain *</Label>
                <Input
                  id="chain"
                  placeholder="e.g. Ethereum"
                  value={chain}
                  onChange={(e) => setChain(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g. DeFi"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => v && setPriority(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign to Account Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign to Account</DialogTitle>
            <DialogDescription>
              Select an account and optional task template
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssign} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Account *</Label>
              <Select
                value={assignAccountId}
                onValueChange={(v) => v && setAssignAccountId(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {(accounts ?? []).map((acc) => (
                    <SelectItem key={acc.id} value={String(acc.id)}>
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: acc.color }}
                        />
                        {acc.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Task Template (optional)</Label>
              <Select
                value={assignTemplate || "__none__"}
                onValueChange={(v) =>
                  setAssignTemplate(!v || v === "__none__" ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No template</SelectItem>
                  {(templates ?? []).map((t) => (
                    <SelectItem key={t.name} value={t.name}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={assignMutation.isPending}>
                {assignMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Assign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Airdrop</DialogTitle>
            <DialogDescription>
              This will permanently delete this airdrop from the catalog. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AirdropCatalogCard({
  airdrop,
  onAssign,
  onDelete,
  onCardClick,
}: {
  airdrop: Airdrop;
  onAssign: (id: number) => void;
  onDelete: (id: number) => void;
  onCardClick: () => void;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md cursor-pointer" onClick={onCardClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{airdrop.name}</CardTitle>
          <div className="flex items-center gap-1">
            {airdrop.url && (
              <a
                href={airdrop.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
              </a>
            )}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => { e.stopPropagation(); onDelete(airdrop.id); }}
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {airdrop.chain}
          </Badge>
          {airdrop.category && (
            <Badge variant="secondary" className="text-xs">
              {airdrop.category}
            </Badge>
          )}
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              priorityColors[airdrop.priority] || ""
            )}
          >
            {airdrop.priority}
          </Badge>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              statusColors[airdrop.status] || ""
            )}
          >
            {airdrop.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => { e.stopPropagation(); onAssign(airdrop.id); }}
          >
            <UserPlus className="mr-2 h-3.5 w-3.5" />
            Assign
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => { e.stopPropagation(); onCardClick(); }}
          >
            <Eye className="mr-2 h-3.5 w-3.5" />
            Detail
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
