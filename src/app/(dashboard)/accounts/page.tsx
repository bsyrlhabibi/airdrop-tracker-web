"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
import {
  Plus,
  Users,
  Pencil,
  Trash2,
  Rocket,
  Wallet,
  Loader2,
  Download,
} from "lucide-react";
import { exportToExcel } from "@/lib/export";

const COLORS = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#10B981", // green
  "#F59E0B", // yellow
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
];

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Create form
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [notes, setNotes] = useState("");

  // Edit form
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Account created");
      setCreateOpen(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; name: string; color: string; notes: string }) =>
      updateAccount(data.id, { name: data.name, color: data.color, notes: data.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Account updated");
      setEditId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAccount(id, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["airdrops"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Account deleted");
      setDeleteId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function resetForm() {
    setName("");
    setColor(COLORS[0]);
    setNotes("");
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Account name is required");
      return;
    }
    createMutation.mutate({ name: name.trim(), color, notes });
  }

  function openEdit(account: { id: number; name: string; color: string; notes: string }) {
    setEditName(account.name);
    setEditColor(account.color);
    setEditNotes(account.notes);
    setEditId(account.id);
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId || !editName.trim()) return;
    updateMutation.mutate({
      id: editId,
      name: editName.trim(),
      color: editColor,
      notes: editNotes,
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-sm text-gray-500">Manage your sybil accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Account
          </Button>
        </div>
      </div>

      {/* Account Grid */}
      {accounts && accounts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Link key={account.id} href={`/accounts/${account.id}`}>
            <Card
              className="relative overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
            >
              {/* Color bar */}
              <div
                className="absolute left-0 top-0 h-full w-1.5"
                style={{ backgroundColor: account.color }}
              />
              <CardHeader className="pl-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: account.color }}
                    />
                    <CardTitle className="text-base">{account.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => openEdit(account)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setDeleteId(account.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-5">
                <div className="flex flex-col gap-2">
                  {account.notes && (
                    <p className="text-xs text-gray-500">{account.notes}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      <Rocket className="mr-1 h-3 w-3" />
                      {account.account_airdrops?.length ?? 0} airdrops
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Wallet className="mr-1 h-3 w-3" />
                      {account.wallets?.length ?? 0} wallets
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-12">
          <Users className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">No accounts yet</p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create your first account
          </Button>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Account</DialogTitle>
            <DialogDescription>Create a new sybil account</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. Akun 1, ETH Main, Sybil A"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full transition-all ${
                      color === c ? "ring-2 ring-offset-2 ring-gray-400" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Strategy, wallet info, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
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

      {/* Edit Dialog */}
      <Dialog open={!!editId} onOpenChange={() => setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditColor(c)}
                    className={`h-7 w-7 rounded-full transition-all ${
                      editColor === c ? "ring-2 ring-offset-2 ring-gray-400" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={2}
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently delete the account and ALL its airdrops,
              tasks, and wallets. This cannot be undone.
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
              Delete Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
