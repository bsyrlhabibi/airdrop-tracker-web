"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAirdrop, updateAirdrop, deleteAirdrop } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

  const { data: airdrop, isLoading } = useQuery({
    queryKey: ["airdrop", id],
    queryFn: () => getAirdrop(Number(id)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAirdrop(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airdrops"] });
      toast.success("Airdrop deleted");
      router.push("/airdrops");
    },
    onError: (err: Error) => toast.error(err.message),
  });

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
        <p className="text-gray-500">Airdrop not found</p>
        <Button variant="outline" className="mt-3" render={<Link href="/airdrops" />}>
          Back to Airdrops
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" render={<Link href="/airdrops" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{airdrop.name}</h1>
          <p className="text-sm text-gray-500">Global airdrop opportunity</p>
        </div>
        {airdrop.url && (
          <Button variant="outline" size="sm" render={<a href={airdrop.url} target="_blank" rel="noopener noreferrer" />}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Visit
          </Button>
        )}
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{airdrop.chain}</Badge>
              <Badge
                variant="secondary"
                className={cn("text-xs", priorityColors[airdrop.priority])}
              >
                {airdrop.priority}
              </Badge>
              <Badge
                variant="secondary"
                className={cn("text-xs", statusColors[airdrop.status])}
              >
                {airdrop.status}
              </Badge>
              {airdrop.category && (
                <Badge variant="outline" className="text-xs">
                  {airdrop.category}
                </Badge>
              )}
            </div>
            {airdrop.notes && (
              <p className="text-sm text-gray-600">{airdrop.notes}</p>
            )}
            {airdrop.deadline && (
              <p className="text-xs text-gray-500">
                Deadline: {new Date(airdrop.deadline).toLocaleDateString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info note */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-gray-500">
            This is a global airdrop catalog entry.
          </p>
          <p className="text-sm text-gray-500">
            Assign it to an account from the{" "}
            <Link href="/airdrops" className="text-blue-600 underline">
              Airdrops
            </Link>{" "}
            page to start tracking tasks.
          </p>
        </CardContent>
      </Card>

      {/* Delete */}
      <div className="flex justify-end">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Airdrop
        </Button>
      </div>
    </div>
  );
}
