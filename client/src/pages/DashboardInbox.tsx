import { Link } from "wouter";
import {
  Video,
  Mic,
  Mail,
  Clock,
  MessageCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { authedFetch } from "@/lib/api";
import type { BookingWithRequester } from "@shared/schema";
import { format, formatDistanceToNow } from "date-fns";

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

export default function DashboardInbox() {
  const { user } = useAuth();

  const { data: requests, isLoading } = useQuery<BookingWithRequester[]>({
    queryKey: ["/api/me/requests"],
    queryFn: async () => {
      const res = await authedFetch("/api/me/requests");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    enabled: !!user,
    staleTime: 15_000,
  });

  const messaged = requests?.filter((r) => r.message && r.message.length > 0) ?? [];

  return (
    <DashboardLayout>
      <p className="mb-1 text-xs text-zinc-600">
        <span className="text-emerald-500/60">Creator Portal</span>
        <span className="mx-1.5">/</span>
        Inbox
      </p>
      <h1 className="text-2xl font-bold tracking-tight text-white">Inbox</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Messages from users who booked sessions with you.
      </p>

      <div className="mt-6 space-y-3">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          </div>
        )}

        {!isLoading && messaged.length === 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-12 text-center">
            <Mail className="mx-auto h-10 w-10 text-zinc-700" />
            <p className="mt-3 text-sm text-zinc-500">
              No messages yet. Messages attached to booking requests will appear
              here.
            </p>
          </div>
        )}

        {messaged.map((req) => {
          const Icon = SESSION_TYPE_ICONS[req.sessionType] ?? MessageCircle;
          const initials = (req.requesterDisplayName ?? "U")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          const isUnread = req.status === "pending";

          return (
            <div
              key={req.id}
              className={cn(
                "rounded-xl border bg-[#0d0d0d] p-5 transition-colors",
                isUnread
                  ? "border-emerald-500/20"
                  : "border-white/[0.06]",
              )}
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="h-11 w-11">
                    <AvatarImage
                      src={req.requesterPhotoUrl ?? ""}
                      alt={req.requesterDisplayName ?? ""}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  {isUnread && (
                    <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#0d0d0d] bg-emerald-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {req.requesterDisplayName ??
                          req.requesterEmail ??
                          "User"}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Icon className="h-3 w-3" />
                        <span>
                          {SESSION_TYPE_LABELS[req.sessionType] ??
                            req.sessionType}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-600">
                      {formatDistanceToNow(new Date(req.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-medium text-zinc-400">
                    Re: {req.topic}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
                    {req.message}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <Link href="/dashboard/requests">
                  <button className="flex items-center gap-1 text-xs font-medium text-emerald-400 transition-colors hover:text-emerald-300">
                    View Request <ArrowRight className="h-3 w-3" />
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
