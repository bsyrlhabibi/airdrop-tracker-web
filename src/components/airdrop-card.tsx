"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Airdrop } from "@/lib/types";
import { ExternalLink } from "lucide-react";

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

export function AirdropCard({ airdrop }: { airdrop: Airdrop }) {
  return (
    <Link href={`/airdrops/${airdrop.id}`}>
      <Card className="transition-shadow hover:shadow-md cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base">{airdrop.name}</CardTitle>
            {airdrop.url && (
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {airdrop.chain}
            </Badge>
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
          {airdrop.category && (
            <p className="text-xs text-muted-foreground">
              {airdrop.category}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
