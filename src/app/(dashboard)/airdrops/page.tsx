"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAirdrops,
  createAirdrop,
  updateAirdrop,
  deleteAirdrop,
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
import { Plus, Search, Rocket, Loader2, Trash2, ExternalLink, ChevronDown, Pencil } from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Airdrop } from "@/lib/types";

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const airdropStatusOptions = ["active", "end", "upcoming", "missed"];

const statusColors: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  end: "bg-gray-200 text-gray-600",
  upcoming: "bg-purple-100 text-purple-700",
  missed: "bg-red-100 text-red-700",
};

export default function AirdropsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterChain, setFilterChain] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Create form
  const [name, setName] = useState("");
  const [chain, setChain] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("active");
  const [url, setUrl] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [notes, setNotes] = useState("");

  // Edit form
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editChain, setEditChain] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editStatus, setEditStatus] = useState("active");
  const [editUrl, setEditUrl] = useState("");
  const [editDateStart, setEditDateStart] = useState("");
  const [editDateEnd, setEditDateEnd] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const { data: airdrops, isLoading } = useQuery({
    queryKey: ["airdrops"],
    queryFn: getAirdrops,
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

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateAirdrop(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrops"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Status updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateAirdrop(editId!, {
        name: editName,
        chain: editChain,
        category: editCategory,
        priority: editPriority,
        status: editStatus,
        url: editUrl,
        date_start: editDateStart || undefined,
        date_end: editDateEnd || undefined,
        notes: editNotes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrops"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Airdrop updated");
      setEditId(null);
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
    setStatus("active");
    setUrl("");
    setDateStart("");
    setDateEnd("");
    setNotes("");
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !chain) {
      toast.error("Name and chain are required");
      return;
    }
    createMutation.mutate({ name, chain, category, priority, status, url, date_start: dateStart || undefined, date_end: dateEnd || undefined, notes });
  }

  function startEdit(a: Airdrop) {
    setEditId(a.id);
    setEditName(a.name);
    setEditChain(a.chain);
    setEditCategory(a.category);
    setEditPriority(a.priority);
    setEditStatus(a.status || "active");
    setEditUrl(a.url || "");
    setEditDateStart(a.date_start ? a.date_start.split("T")[0] : "");
    setEditDateEnd(a.date_end ? a.date_end.split("T")[0] : "");
    setEditNotes(a.notes || "");
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

  const chains = [...new Set((airdrops ?? []).map((a) => a.chain))].filter(Boolean);

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
            Global airdrop catalog — click to manage tasks
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
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((airdrop) => (
            <Card
              key={airdrop.id}
              className="transition-shadow hover:shadow-md cursor-pointer"
              onClick={() => router.push(`/airdrops/${slugify(airdrop.name)}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{airdrop.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    {airdrop.url && (
                      <a href={airdrop.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </a>
                    )}
                    <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); startEdit(airdrop); }}>
                      <Pencil className="h-3.5 w-3.5 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); setDeleteId(airdrop.id); }}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">{airdrop.chain}</Badge>
                  {airdrop.category && (
                    <Badge variant="secondary" className="text-xs">{airdrop.category}</Badge>
                  )}
                  <Badge variant="secondary" className={cn("text-xs", priorityColors[airdrop.priority])}>
                    {airdrop.priority}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 outline-none"
                    >
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs cursor-pointer hover:opacity-80 transition-opacity",
                          statusColors[airdrop.status] || "bg-gray-100 text-gray-700"
                        )}
                      >
                        {airdrop.status}
                        <ChevronDown className="h-3 w-3 ml-0.5" />
                      </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                      {airdropStatusOptions.map((s) => (
                        <DropdownMenuItem
                          key={s}
                          onClick={() => {
                            if (s !== airdrop.status) {
                              updateStatusMutation.mutate({ id: airdrop.id, status: s });
                            }
                          }}
                          className={cn("cursor-pointer", s === airdrop.status && "bg-accent font-medium")}
                        >
                          <div className={cn("h-2 w-2 rounded-full mr-2", statusColors[s]?.split(" ")[0])} />
                          {s}
                          {s === airdrop.status && <span className="ml-auto text-xs text-muted-foreground">current</span>}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {(airdrop.date_start || airdrop.date_end) && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>📅</span>
                    {airdrop.date_start && <span>{new Date(airdrop.date_start).toLocaleDateString()}</span>}
                    {airdrop.date_start && airdrop.date_end && <span>→</span>}
                    {airdrop.date_end && <span>{new Date(airdrop.date_end).toLocaleDateString()}</span>}
                  </div>
                )}
                {airdrop.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{airdrop.notes}</p>
                )}
              </CardContent>
            </Card>
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
            <DialogDescription>Add a new airdrop to the global catalog</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Name *</Label>
              <Input placeholder="e.g. EigenLayer" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Chain *</Label>
                <Input placeholder="e.g. Ethereum" value={chain} onChange={(e) => setChain(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Input placeholder="e.g. DeFi" value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => v && setPriority(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {airdropStatusOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>URL</Label>
              <Input placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Date Start</Label>
                <Input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Date End</Label>
                <Input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Notes</Label>
              <Textarea placeholder="Any additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editId !== null} onOpenChange={() => setEditId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Airdrop</DialogTitle>
            <DialogDescription>Update airdrop details</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Chain</Label>
                <Input value={editChain} onChange={(e) => setEditChain(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Priority</Label>
                <Select value={editPriority} onValueChange={(v) => v && setEditPriority(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(v) => v && setEditStatus(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {airdropStatusOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>URL</Label>
              <Input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Date Start</Label>
                <Input type="date" value={editDateStart} onChange={(e) => setEditDateStart(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Date End</Label>
                <Input type="date" value={editDateEnd} onChange={(e) => setEditDateEnd(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Notes</Label>
              <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
              <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Airdrop</DialogTitle>
            <DialogDescription>
              This will permanently delete this airdrop and all its tasks. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
