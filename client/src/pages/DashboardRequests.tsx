import { useState } from "react";
import { Link } from "wouter";
import {
  Video,
  Mic,
  Mail,
  Clock,
  Check,
  X,
  Loader2,
  MessageCircle,
  CircleDollarSign,
  ArrowUpRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authedFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { BookingWithRequester } from "@shared/schema";
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

const STATUS_STYLES: Record<string, string> = {
  payment_pending: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  payment_received: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  session_completed: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  payout_pending: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  payout_sent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  payout_failed: "border-red-500/30 bg-red-500/10 text-red-400",
  refunded: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  cancelled: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
};

const PRO_RESPONSE_STYLES: Record<string, string> = {
  pending: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  accepted: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  declined: "border-red-500/30 bg-red-500/10 text-red-400",
};

type FilterTab = "all" | "awaiting_payment" | "awaiting_response" | "accepted" | "settled";

export default function DashboardRequests() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterTab>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: requests, isLoading } = useQuery<BookingWithRequester[]>({
    queryKey: ["/api/me/requests"],
    queryFn: async () => {
      const res = await authedFetch("/api/me/requests");
      if (!res.ok) throw new Error("Failed to load requests");
      return res.json();
    },
    enabled: !!user,
    staleTime: 10_000,
  });

  const proResponseMutation = useMutation({
    mutationFn: async ({
      id,
      proResponseStatus,
    }: {
      id: string;
      proResponseStatus: "accepted" | "declined";
    }) => {
      const res = await authedFetch(`/api/bookings/${id}/pro-response`, {
        method: "POST",
        body: JSON.stringify({ proResponseStatus }),
      });
      if (!res.ok) throw new Error("Failed to update booking response");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me/earnings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update booking response.",
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authedFetch(`/api/bookings/${id}/complete`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to complete session");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me/earnings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark the session as complete.",
        variant: "destructive",
      });
    },
  });

  const filtered = requests?.filter((r) => {
    if (filter === "all") return true;
    if (filter === "awaiting_payment") return r.status === "payment_pending";
    if (filter === "awaiting_response") {
      return r.status === "payment_received" && r.proResponseStatus === "pending";
    }
    if (filter === "accepted") {
      return r.status === "payment_received" && r.proResponseStatus === "accepted";
    }
    return ["session_completed", "payout_pending", "payout_sent", "payout_failed", "refunded", "cancelled"].includes(r.status);
  });

  const tabs: { label: string; value: FilterTab; count?: number }[] = [
    { label: "All", value: "all", count: requests?.length },
    {
      label: "Awaiting Payment",
      value: "awaiting_payment",
      count: requests?.filter((r) => r.status === "payment_pending").length,
    },
    {
      label: "Awaiting Response",
      value: "awaiting_response",
      count:
        requests?.filter(
          (r) => r.status === "payment_received" && r.proResponseStatus === "pending",
        ).length,
    },
    {
      label: "Accepted",
      value: "accepted",
      count:
        requests?.filter(
          (r) => r.status === "payment_received" && r.proResponseStatus === "accepted",
        ).length,
    },
    {
      label: "Settled",
      value: "settled",
      count:
        requests?.filter((r) =>
          ["session_completed", "payout_pending", "payout_sent", "payout_failed", "refunded", "cancelled"].includes(r.status),
        ).length,
    },
  ];

  return (
    <DashboardLayout>
      <p className="mb-1 text-xs text-zinc-600">
        <span className="text-emerald-500/60">Pro Portal</span>
        <span className="mx-1.5">/</span>
        Requests
      </p>
      <h1 className="text-2xl font-bold tracking-tight text-white">
        Connection Requests
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Manage incoming session requests from users.
      </p>

      {/* Filter tabs */}
      <div className="mt-6 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              filter === tab.value
                ? "bg-emerald-500/15 text-emerald-400"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
            )}
          >
            {tab.label}
            {(tab.count ?? 0) > 0 && (
              <span className="ml-1.5 text-zinc-600">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Requests list */}
      <div className="mt-6 space-y-3">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          </div>
        )}

        {!isLoading && (!filtered || filtered.length === 0) && (
          <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-12 text-center">
            <MessageCircle className="mx-auto h-10 w-10 text-zinc-700" />
            <p className="mt-3 text-sm text-zinc-500">
              {filter === "all"
                ? "No requests yet. They'll appear here when users book sessions."
                : `No ${filter.replaceAll("_", " ")} requests.`}
            </p>
          </div>
        )}

        {filtered?.map((request) => {
          const Icon = SESSION_TYPE_ICONS[request.sessionType] ?? MessageCircle;
          const initials = (request.requesterDisplayName ?? "U")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          const lifecycleLabel =
            request.status === "payment_pending"
              ? "Awaiting customer payment"
              : request.status === "payment_received"
                ? "Paid and ready for review"
                : request.status === "session_completed"
                  ? "Session completed"
                  : request.status === "payout_pending"
                    ? "Payout queued"
                    : request.status === "payout_sent"
                      ? "Payout sent"
                      : request.status === "payout_failed"
                        ? "Payout issue"
                        : request.status === "refunded"
                          ? "Refunded"
                          : "Cancelled";

          return (
            <div
              key={request.id}
              className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5"
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-11 w-11">
                  <AvatarImage
                    src={request.requesterPhotoUrl ?? ""}
                    alt={request.requesterDisplayName ?? ""}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {request.requesterDisplayName ??
                        request.requesterEmail ??
                        "Anonymous User"}
                    </span>
                    <Badge
                      className={cn(
                        "text-[10px] font-bold capitalize",
                        STATUS_STYLES[request.status] ?? STATUS_STYLES.payment_pending,
                      )}
                    >
                      {lifecycleLabel}
                    </Badge>
                    <Badge
                      className={cn(
                        "text-[10px] font-bold capitalize",
                        PRO_RESPONSE_STYLES[request.proResponseStatus] ??
                          PRO_RESPONSE_STYLES.pending,
                      )}
                    >
                      {request.proResponseStatus}
                    </Badge>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <Icon className="h-3.5 w-3.5" />
                    <span>
                      {SESSION_TYPE_LABELS[request.sessionType] ??
                        request.sessionType}
                    </span>
                    <span>&middot;</span>
                    <span>{request.topic}</span>
                  </div>

                  {request.message && (
                    <p className="mt-2 text-xs text-zinc-400 line-clamp-2">
                      {request.message}
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-4 text-xs text-zinc-600">
                    <span>
                      {format(new Date(request.createdAt), "MMM d, yyyy")}
                    </span>
                    {request.scheduledAt && (
                      <span>
                        Scheduled:{" "}
                        {format(new Date(request.scheduledAt), "MMM d, h:mm a")}
                      </span>
                    )}
                    {request.paymentReceivedAt && (
                      <span>
                        Paid: {format(new Date(request.paymentReceivedAt), "MMM d")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <p className="text-lg font-bold text-white">
                    {request.currency} ${request.grossAmount.toLocaleString()}
                  </p>

                  {request.status === "payment_received" &&
                    request.proResponseStatus === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          proResponseMutation.mutate({
                            id: request.id,
                            proResponseStatus: "accepted",
                          })
                        }
                        disabled={proResponseMutation.isPending}
                        className="bg-emerald-500 text-xs font-semibold text-black hover:bg-emerald-400"
                      >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          proResponseMutation.mutate({
                            id: request.id,
                            proResponseStatus: "declined",
                          })
                        }
                        disabled={proResponseMutation.isPending}
                        className="border-zinc-700 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        <X className="mr-1 h-3.5 w-3.5" />
                        Decline
                      </Button>
                    </div>
                  )}

                  {request.status === "payment_pending" && (
                    <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 px-3 py-2 text-right text-xs text-orange-300">
                      Waiting for admin-confirmed Payoneer payment before you can
                      respond.
                    </div>
                  )}

                  {request.proResponseStatus === "accepted" &&
                    request.status === "payment_received" &&
                    request.roomId && (
                    <Link href={`/video-call/${request.roomId}`}>
                      <Button
                        size="sm"
                        className="bg-emerald-500 text-xs font-semibold text-black hover:bg-emerald-400"
                      >
                        <Video className="mr-1 h-3.5 w-3.5" />
                        Join Call
                      </Button>
                    </Link>
                    )}

                  {request.proResponseStatus === "accepted" &&
                    request.status === "payment_received" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeMutation.mutate(request.id)}
                      disabled={completeMutation.isPending}
                      className="border-zinc-700 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      Mark Session Complete
                    </Button>
                    )}

                  {(request.status === "payout_pending" ||
                    request.status === "payout_sent") && (
                    <div className="flex items-center gap-1 text-xs text-emerald-300">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      {request.status === "payout_sent"
                        ? "Your payout was marked sent"
                        : `Expected payout: ${request.currency} $${request.proPayoutAmount.toLocaleString()}`}
                    </div>
                  )}

                  {request.status === "payment_received" && (
                    <div className="flex items-center gap-1 text-xs text-blue-300">
                      <CircleDollarSign className="h-3.5 w-3.5" />
                      Customer payment confirmed
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
