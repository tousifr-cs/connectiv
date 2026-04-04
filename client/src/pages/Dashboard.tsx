import { Link } from "wouter";
import {
  DollarSign,
  MessageCircle,
  TrendingUp,
  Video,
  Mail,
  Mic,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashboardLayout, useCreatorProfile } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { authedFetch } from "@/lib/api";
import type { BookingWithRequester, EarningsStats } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

const SESSION_TYPE_LABELS: Record<string, string> = {
  video_call: "Video Call",
  audio_consult: "Audio Consultation",
  dm_bundle: "DM Bundle",
  deep_dive: "Deep Dive",
};

const SESSION_TYPE_ICONS: Record<string, typeof Video> = {
  video_call: Video,
  audio_consult: Mic,
  dm_bundle: Mail,
  deep_dive: Clock,
};

function DashboardOverview() {
  const { creator } = useCreatorProfile();
  const { user } = useAuth();

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

  const { data: earnings } = useQuery<EarningsStats>({
    queryKey: ["/api/me/earnings"],
    queryFn: async () => {
      const res = await authedFetch("/api/me/earnings");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  const pendingRequests = requests?.filter((r) => r.status === "pending") ?? [];
  const acceptedRequests = requests?.filter((r) => r.status === "accepted") ?? [];
  const displayName =
    creator?.displayName || user?.displayName || "Creator";

  const earningsBreakdown = earnings?.breakdownByType ?? [];

  return (
    <>
      <p className="mb-1 text-xs text-zinc-600">
        <span className="text-emerald-500/60">Creator Portal</span>
        <span className="mx-1.5">/</span>
        Overview
      </p>
      <h1 className="text-2xl font-bold tracking-tight text-white">
        Dashboard Overview
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Welcome back, {displayName.split(" ")[0]}.
        {pendingRequests.length > 0 &&
          ` You have ${pendingRequests.length} pending request${pendingRequests.length > 1 ? "s" : ""}.`}
      </p>

      {/* Stats Row */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            {earnings && earnings.completedCount > 0 && (
              <Badge className="border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400">
                <TrendingUp className="mr-1 h-3 w-3" />
                {earnings.completedCount} completed
              </Badge>
            )}
          </div>
          <p className="mt-3 text-xs text-zinc-500">Total Earnings</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-white">
            ${(earnings?.totalEarnings ?? 0).toLocaleString()}.00
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15">
              <MessageCircle className="h-5 w-5 text-blue-400" />
            </div>
            {pendingRequests.length > 0 && (
              <Badge className="border-orange-500/30 bg-orange-500/10 text-xs text-orange-400">
                Action needed
              </Badge>
            )}
          </div>
          <p className="mt-3 text-xs text-zinc-500">Pending Requests</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-white">
            {pendingRequests.length} Request{pendingRequests.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/15">
              <Video className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <p className="mt-3 text-xs text-zinc-500">Upcoming Sessions</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-white">
            {acceptedRequests.length} Session{acceptedRequests.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: Recent requests */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              Recent Connection Requests
            </h2>
            <Link href="/dashboard/requests">
              <button className="flex items-center gap-1 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {pendingRequests.length === 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-8 text-center">
                <MessageCircle className="mx-auto h-8 w-8 text-zinc-600" />
                <p className="mt-3 text-sm text-zinc-500">
                  No pending requests right now.
                </p>
              </div>
            )}
            {pendingRequests.slice(0, 4).map((req) => (
              <RequestPreviewCard key={req.id} request={req} />
            ))}
          </div>
        </div>

        {/* Right: Earnings breakdown */}
        <div className="space-y-4">
          <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
            <h3 className="text-sm font-semibold text-white">
              Earnings Breakdown
            </h3>
            <div className="mt-4 space-y-3">
              {earningsBreakdown.length === 0 && (
                <p className="text-xs text-zinc-500">
                  Complete sessions to see earnings breakdown.
                </p>
              )}
              {earningsBreakdown.map((item) => {
                const Icon =
                  SESSION_TYPE_ICONS[item.sessionType] ?? DollarSign;
                return (
                  <div
                    key={item.sessionType}
                    className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#111] px-4 py-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                      <Icon className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="flex-1 text-sm text-zinc-300">
                      {SESSION_TYPE_LABELS[item.sessionType] ?? item.sessionType}
                    </span>
                    <span className="text-sm font-bold text-white">
                      ${item.total.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {acceptedRequests.length > 0 && (
            <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 to-[#0d0d0d] p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                Next Session
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                {SESSION_TYPE_LABELS[acceptedRequests[0].sessionType]} with{" "}
                {acceptedRequests[0].requesterDisplayName ?? "a user"}
              </p>
              {acceptedRequests[0].roomId && (
                <Link href={`/video-call/${acceptedRequests[0].roomId}`}>
                  <Button
                    size="sm"
                    className="mt-3 w-full bg-emerald-500 text-xs font-semibold text-black hover:bg-emerald-400"
                  >
                    Join Session
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function RequestPreviewCard({ request }: { request: BookingWithRequester }) {
  const initials = (request.requesterDisplayName ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#0d0d0d] px-4 py-3.5">
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={request.requesterPhotoUrl ?? ""}
          alt={request.requesterDisplayName ?? ""}
        />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">
            {request.requesterDisplayName ?? request.requesterEmail ?? "User"}
          </span>
          <Badge className="border-none bg-emerald-500 px-1.5 py-0 text-[10px] font-bold text-black">
            NEW
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-zinc-500">
          {SESSION_TYPE_LABELS[request.sessionType] ?? request.sessionType}{" "}
          &middot; {request.topic}
        </p>
      </div>

      <p className="text-lg font-bold text-white">
        ${request.price.toLocaleString()}
      </p>
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
}
