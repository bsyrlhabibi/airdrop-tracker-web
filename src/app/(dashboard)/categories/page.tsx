"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus, Trash2, Loader2, Pencil, Tag } from "lucide-react";
import type { Category } from "@/lib/types";

const presetColors = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6B7280",
];

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: () => createCategory({ name: name.trim(), color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setName("");
      setColor("#3B82F6");
      toast.success("Category created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateCategory(editId!, { name: editName.trim(), color: editColor }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditId(null);
      toast.success("Category updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCategory(deleteId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeleteId(null);
      toast.success("Category deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate();
  }

  function startEdit(cat: Category) {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-sm text-gray-500 mt-1">Manage task categories for your airdrops</p>
      </div>

      {/* Add form */}
      <form onSubmit={handleCreate} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            placeholder="Category name (e.g. Bridge, Swap, Staking)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!name.trim() || createMutation.isPending}>
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-1" />
            )}
            Add
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Color:</span>
          {presetColors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full transition-transform ${color === c ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : "hover:scale-110"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </form>

      {/* Category list */}
      {(categories ?? []).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 lg:py-12">
            <Tag className="mb-3 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">No categories yet</p>
            <p className="text-xs text-gray-400 mt-1">Create categories to organize your tasks</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {(categories ?? []).map((cat) => {
            const isEditing = editId === cat.id;

            if (isEditing) {
              return (
                <Card key={cat.id} className="border-blue-200">
                  <CardContent className="flex flex-col gap-3 py-4">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Category name"
                    />
                    <div className="flex items-center gap-2">
                      {presetColors.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEditColor(c)}
                          className={`h-5 w-5 rounded-full ${editColor === c ? "ring-2 ring-offset-1 ring-blue-500" : ""}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card key={cat.id}>
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + "20" }}>
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.color}</p>
                  </div>
                  <Button variant="ghost" size="icon-xs" onClick={() => startEdit(cat)}>
                    <Pencil className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => setDeleteId(cat.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              This will delete the category. Tasks using this category will keep their data but lose the category reference.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
