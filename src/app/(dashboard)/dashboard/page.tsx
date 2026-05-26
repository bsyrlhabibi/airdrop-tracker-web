"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboard, getAirdrops } from "@/lib/api";
import { StatsCard } from "@/components/stats-card";
import { AirdropCard } from "@/components/airdrop-card";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  CheckCircle2,
  Clock,
  Wallet,
  Activity,
  Plus,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  const { data: airdrops, isLoading: airdropsLoading } = useQuery({
    queryKey: ["airdrops"],
    queryFn: getAirdrops,
  });

  if (statsLoading || airdropsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const recentAirdrops = (airdrops ?? []).slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your airdrop activity
          </p>
        </div>
        <Link href="/airdrops">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Airdrop
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Airdrops"
          value={stats?.total_airdrops ?? 0}
          icon={Rocket}
        />
        <StatsCard
          title="Active"
          value={stats?.active_airdrops ?? 0}
          icon={Activity}
          description="Currently tracking"
        />
        <StatsCard
          title="Tasks Completed"
          value={stats?.completed_tasks ?? 0}
          icon={CheckCircle2}
          description={`of ${stats?.total_tasks ?? 0} total`}
        />
        <StatsCard
          title="Pending Tasks"
          value={stats?.pending_tasks ?? 0}
          icon={Clock}
          description="Awaiting completion"
        />
        <StatsCard
          title="Wallets"
          value={stats?.total_wallets ?? 0}
          icon={Wallet}
        />
      </div>

      {/* Recent airdrops */}
      {recentAirdrops.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Airdrops
            </h2>
            <Link href="/airdrops">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentAirdrops.map((airdrop) => (
              <AirdropCard key={airdrop.id} airdrop={airdrop} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {recentAirdrops.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Rocket className="mb-4 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium text-gray-900">
            No airdrops yet
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Start tracking your first airdrop
          </p>
          <Link href="/airdrops">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Airdrop
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
