"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAirdrop,
  updateAirdrop,
  deleteAirdrop,
  createTask,
  completeTask,
  resetTask,
  deleteTask,
} from "@/lib/api";
import { TaskItem } from "@/components/task-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  ExternalLink,
  Loader2,
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

export default function AirdropDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [taskDesc, setTaskDesc] = useState("");
  const [taskFreq, setTaskFreq] = useState("once");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editChain, setEditChain] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editStatus, setEditStatus] = useState("active");
  const [editUrl, setEditUrl] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

  const { data: airdrop, isLoading } = useQuery({
    queryKey: ["airdrop", id],
    queryFn: () => getAirdrop(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateAirdrop>[1]) =>
      updateAirdrop(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrop", id] });
      queryClient.invalidateQueries({ queryKey: ["airdrops"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Airdrop updated");
      setEditOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAirdrop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrops"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Airdrop deleted");
      router.push("/airdrops");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: { description: string; frequency: string }) =>
      createTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrop", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task added");
      setTaskDesc("");
      setTaskFreq("once");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) => completeTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrop", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetTaskMutation = useMutation({
    mutationFn: (taskId: string) => resetTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrop", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrop", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function openEdit() {
    if (!airdrop) return;
    setEditName(airdrop.name);
    setEditChain(airdrop.chain);
    setEditCategory(airdrop.category);
    setEditPriority(airdrop.priority);
    setEditStatus(airdrop.status);
    setEditUrl(airdrop.url);
    setEditNotes(airdrop.notes);
    setEditDeadline(airdrop.deadline ? airdrop.deadline.slice(0, 10) : "");
    setEditOpen(true);
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate({
      name: editName,
      chain: editChain,
      category: editCategory,
      priority: editPriority,
      status: editStatus,
      url: editUrl,
      notes: editNotes,
      deadline: editDeadline || undefined,
    });
  }

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskDesc.trim()) {
      toast.error("Task description is required");
      return;
    }
    createTaskMutation.mutate({ description: taskDesc, frequency: taskFreq });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!airdrop) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Airdrop not found</p>
        <Link href="/airdrops">
          <Button variant="ghost" className="mt-2">
            Back to airdrops
          </Button>
        </Link>
      </div>
    );
  }

  const tasks = airdrop.tasks ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/airdrops">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{airdrop.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{airdrop.chain}</Badge>
            {airdrop.category && (
              <Badge variant="secondary">{airdrop.category}</Badge>
            )}
            <Badge
              variant="secondary"
              className={cn(priorityColors[airdrop.priority])}
            >
              {airdrop.priority}
            </Badge>
            <Badge
              variant="secondary"
              className={cn(statusColors[airdrop.status])}
            >
              {airdrop.status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openEdit}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        {airdrop.url && (
          <Card>
            <CardContent className="pt-4">
              <a
                href={airdrop.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                {airdrop.url}
              </a>
            </CardContent>
          </Card>
        )}
        {airdrop.deadline && (
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Deadline</p>
              <p className="font-medium">
                {format(new Date(airdrop.deadline), "MMM d, yyyy")}
              </p>
            </CardContent>
          </Card>
        )}
        {airdrop.notes && (
          <Card className="sm:col-span-2">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="mt-1 text-sm whitespace-pre-wrap">
                {airdrop.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Tasks</CardTitle>
            <span className="text-sm text-muted-foreground">
              {tasks.filter((t) => t.completed).length}/{tasks.length} completed
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {/* Add task form */}
          <form
            onSubmit={handleAddTask}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <Input
              placeholder="New task description..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              className="flex-1"
            />
            <Select value={taskFreq} onValueChange={(v) => v && setTaskFreq(v)}>
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
            <Button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="sm:w-auto"
            >
              {createTaskMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add
            </Button>
          </form>

          {/* Task list */}
          {tasks.length > 0 ? (
            <div className="flex flex-col gap-2">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={() => completeTaskMutation.mutate(task.id)}
                  onReset={() => resetTaskMutation.mutate(task.id)}
                  onDelete={() => deleteTaskMutation.mutate(task.id)}
                  completing={completeTaskMutation.isPending}
                  resetting={resetTaskMutation.isPending}
                  deleting={deleteTaskMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No tasks yet. Add one above.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Airdrop</DialogTitle>
            <DialogDescription>Update airdrop details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-chain">Chain</Label>
                <Input
                  id="edit-chain"
                  value={editChain}
                  onChange={(e) => setEditChain(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Priority</Label>
                <Select value={editPriority} onValueChange={(v) => v && setEditPriority(v)}>
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
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(v) => v && setEditStatus(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-url">URL</Label>
              <Input
                id="edit-url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-deadline">Deadline</Label>
              <Input
                id="edit-deadline"
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
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

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Airdrop</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{airdrop.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
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
