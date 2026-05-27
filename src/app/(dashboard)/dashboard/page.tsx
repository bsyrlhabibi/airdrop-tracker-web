"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboard, getAirdrops } from "@/lib/api";
import { exportToExcel } from "@/lib/export";
import { StatsCard } from "@/components/stats-card";
import { AirdropCard } from "@/components/airdrop-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Rocket,
  CheckCircle2,
  Clock,
  Wallet,
  Activity,
  Plus,
  Users,
  Download,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  const { data: airdrops, isLoading: airdropsLoading } = useQuery({
    queryKey: ["airdrops"],
    queryFn: () => getAirdrops(),
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
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Overview of your airdrop tracking
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportToExcel} className="flex-1 sm:flex-none">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button render={<Link href="/airdrops" />} className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            New Airdrop
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatsCard
          title="Total Airdrops"
          value={stats?.total_airdrops ?? 0}
          icon={Rocket}
          description={`${stats?.active_airdrops ?? 0} active`}
        />
        <StatsCard
          title="Total Tasks"
          value={stats?.total_tasks ?? 0}
          icon={Activity}
          description={`${stats?.pending_tasks ?? 0} pending · ${stats?.ongoing_tasks ?? 0} ongoing · ${stats?.missed_tasks ?? 0} missed`}
        />
        <StatsCard
          title="Completed"
          value={stats?.completed_tasks ?? 0}
          icon={CheckCircle2}
          description={
            stats?.total_tasks
              ? `${Math.round(
                  ((stats.completed_tasks ?? 0) / stats.total_tasks) * 100
                )}%`
              : "0%"
          }
        />
        <StatsCard
          title="Wallets"
          value={stats?.total_wallets ?? 0}
          icon={Wallet}
          description={`${stats?.total_accounts ?? 0} accounts`}
        />
      </div>

      {/* Per-Account Stats */}
      {stats?.accounts && stats.accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Per Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {stats.accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div
                    className="mt-0.5 h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: acc.color }}
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-900">
                      {acc.name}
                    </span>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                      <span>
                        <Rocket className="mr-1 inline h-3 w-3" />
                        {acc.active_airdrops}/{acc.total_airdrops} airdrops
                      </span>
                      <span>
                        <CheckCircle2 className="mr-1 inline h-3 w-3" />
                        {acc.completed_tasks}/{acc.total_tasks} tasks
                      </span>
                      <span>
                        <Clock className="mr-1 inline h-3 w-3" />
                        {acc.pending_tasks} pending · {acc.ongoing_tasks} ongoing · {acc.missed_tasks} missed
                      </span>
                      <span>
                        <Wallet className="mr-1 inline h-3 w-3" />
                        {acc.total_wallets} wallets
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Airdrops */}
      {recentAirdrops.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Airdrops
            </h2>
            <Button variant="ghost" size="sm" render={<Link href="/airdrops" />}>
              View all
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {recentAirdrops.map((airdrop) => (
              <AirdropCard key={airdrop.id} airdrop={airdrop} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
