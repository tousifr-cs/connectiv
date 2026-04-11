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
import type { BookingWithRequester, BookingStatus } from "@shared/schema";
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
  pending: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  accepted: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  declined: "border-red-500/30 bg-red-500/10 text-red-400",
  completed: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  cancelled: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
};

type FilterTab = "all" | "pending" | "accepted" | "completed" | "declined";

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

  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: BookingStatus;
    }) => {
      const res = await authedFetch(`/api/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me/earnings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update request status.",
        variant: "destructive",
      });
    },
  });

  const filtered =
    filter === "all" ? requests : requests?.filter((r) => r.status === filter);

  const tabs: { label: string; value: FilterTab; count?: number }[] = [
    { label: "All", value: "all", count: requests?.length },
    {
      label: "Pending",
      value: "pending",
      count: requests?.filter((r) => r.status === "pending").length,
    },
    {
      label: "Accepted",
      value: "accepted",
      count: requests?.filter((r) => r.status === "accepted").length,
    },
    {
      label: "Completed",
      value: "completed",
      count: requests?.filter((r) => r.status === "completed").length,
    },
    {
      label: "Declined",
      value: "declined",
      count: requests?.filter((r) => r.status === "declined").length,
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
                : `No ${filter} requests.`}
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
                        STATUS_STYLES[request.status] ?? STATUS_STYLES.pending,
                      )}
                    >
                      {request.status}
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
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <p className="text-lg font-bold text-white">
                    ${request.price.toLocaleString()}
                  </p>

                  {request.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          statusMutation.mutate({
                            id: request.id,
                            status: "accepted",
                          })
                        }
                        disabled={statusMutation.isPending}
                        className="bg-emerald-500 text-xs font-semibold text-black hover:bg-emerald-400"
                      >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          statusMutation.mutate({
                            id: request.id,
                            status: "declined",
                          })
                        }
                        disabled={statusMutation.isPending}
                        className="border-zinc-700 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        <X className="mr-1 h-3.5 w-3.5" />
                        Decline
                      </Button>
                    </div>
                  )}

                  {request.status === "accepted" && request.roomId && (
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

                  {request.status === "accepted" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        statusMutation.mutate({
                          id: request.id,
                          status: "completed",
                        })
                      }
                      disabled={statusMutation.isPending}
                      className="border-zinc-700 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      Mark Complete
                    </Button>
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
