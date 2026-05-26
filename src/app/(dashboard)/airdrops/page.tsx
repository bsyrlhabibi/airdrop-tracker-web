"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAirdrops, createAirdrop } from "@/lib/api";
import { AirdropCard } from "@/components/airdrop-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Search, Rocket, Loader2 } from "lucide-react";

export default function AirdropsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterChain, setFilterChain] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Create form state
  const [name, setName] = useState("");
  const [chain, setChain] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  const { data: airdrops, isLoading } = useQuery({
    queryKey: ["airdrops"],
    queryFn: getAirdrops,
  });

  const createMutation = useMutation({
    mutationFn: createAirdrop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrops"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Airdrop created");
      resetForm();
      setDialogOpen(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Airdrops</h1>
          <p className="text-sm text-muted-foreground">
            Manage your airdrop tracking
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
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
            <AirdropCard key={airdrop.id} airdrop={airdrop} />
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
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Airdrop
            </Button>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Airdrop</DialogTitle>
            <DialogDescription>
              Add a new airdrop to track
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
    </div>
  );
}
