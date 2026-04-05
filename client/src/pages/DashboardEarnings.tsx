import {
  DollarSign,
  Video,
  Mic,
  Mail,
  Clock,
  TrendingUp,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { authedFetch } from "@/lib/api";
import type { EarningsStats, BookingWithRequester } from "@shared/schema";
import { format } from "date-fns";

const SESSION_TYPE_LABELS: Record<string, string> = {
  video_call: "Video Calls",
  audio_consult: "Audio Consultations",
  dm_bundle: "DM Bundles",
  deep_dive: "Deep Dives",
};

const SESSION_TYPE_ICONS: Record<string, typeof Video> = {
  video_call: Video,
  audio_consult: Mic,
  dm_bundle: Mail,
  deep_dive: Clock,
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  video_call: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  audio_consult: { bg: "bg-purple-500/15", text: "text-purple-400" },
  dm_bundle: { bg: "bg-amber-500/15", text: "text-amber-400" },
  deep_dive: { bg: "bg-blue-500/15", text: "text-blue-400" },
};

export default function DashboardEarnings() {
  const { user } = useAuth();

  const { data: earnings, isLoading: earningsLoading } =
    useQuery<EarningsStats>({
      queryKey: ["/api/me/earnings"],
      queryFn: async () => {
        const res = await authedFetch("/api/me/earnings");
        if (!res.ok) throw new Error("Failed");
        return res.json();
      },
      enabled: !!user,
      staleTime: 30_000,
    });

  const { data: requests } = useQuery<BookingWithRequester[]>({
    queryKey: ["/api/me/requests"],
    queryFn: async () => {
      const res = await authedFetch("/api/me/requests");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
    staleTime: 15_000,
  });

  const completedRequests =
    requests?.filter((r) => r.status === "completed") ?? [];
  const pendingEarnings =
    requests
      ?.filter((r) => r.status === "accepted")
      .reduce((sum, r) => sum + r.price, 0) ?? 0;

  return (
    <DashboardLayout>
      <p className="mb-1 text-xs text-zinc-600">
        <span className="text-emerald-500/60">Creator Portal</span>
        <span className="mx-1.5">/</span>
        Earnings
      </p>
      <h1 className="text-2xl font-bold tracking-tight text-white">
        Earnings
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Track your revenue from completed sessions.
      </p>

      {earningsLoading ? (
        <div className="mt-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="mt-3 text-xs text-zinc-500">Total Earned</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-white">
                ${(earnings?.totalEarnings ?? 0).toLocaleString()}.00
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <p className="mt-3 text-xs text-zinc-500">Pending Payout</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-white">
                ${pendingEarnings.toLocaleString()}.00
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <p className="mt-3 text-xs text-zinc-500">Completed Sessions</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-white">
                {earnings?.completedCount ?? 0}
              </p>
            </div>
          </div>

          {/* Breakdown by type */}
          <h2 className="mt-8 text-lg font-bold text-white">
            Breakdown by Type
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(earnings?.breakdownByType ?? []).length === 0 && (
              <div className="col-span-full rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-8 text-center">
                <DollarSign className="mx-auto h-8 w-8 text-zinc-700" />
                <p className="mt-3 text-sm text-zinc-500">
                  Complete sessions to see your earnings breakdown.
                </p>
              </div>
            )}
            {earnings?.breakdownByType.map((item) => {
              const Icon = SESSION_TYPE_ICONS[item.sessionType] ?? DollarSign;
              const colors = TYPE_COLORS[item.sessionType] ?? TYPE_COLORS.video_call;

              return (
                <div
                  key={item.sessionType}
                  className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        colors.bg,
                      )}
                    >
                      <Icon className={cn("h-5 w-5", colors.text)} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        {SESSION_TYPE_LABELS[item.sessionType] ??
                          item.sessionType}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {item.count} session{item.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-white">
                      ${item.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent completed */}
          <h2 className="mt-8 text-lg font-bold text-white">
            Recent Completed Sessions
          </h2>
          <div className="mt-4 space-y-2">
            {completedRequests.length === 0 && (
              <p className="text-sm text-zinc-500">
                No completed sessions yet.
              </p>
            )}
            {completedRequests.slice(0, 10).map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-4 rounded-lg border border-white/[0.06] bg-[#0d0d0d] px-4 py-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {req.requesterDisplayName ??
                      req.requesterEmail ??
                      "User"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {SESSION_TYPE_LABELS[req.sessionType] ?? req.sessionType}{" "}
                    &middot; {req.topic}
                  </p>
                </div>
                <span className="text-xs text-zinc-600">
                  {format(new Date(req.updatedAt), "MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1 text-sm font-bold text-emerald-400">
                  <ArrowUpRight className="h-3.5 w-3.5" />$
                  {req.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
