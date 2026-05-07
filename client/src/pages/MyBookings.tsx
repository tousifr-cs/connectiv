import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Video,
  Mic,
  Mail,
  Clock,
  CalendarDays,
  ArrowRight,
  Loader2,
  Inbox,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Send,
  ExternalLink,
  ShieldCheck,
  CircleDollarSign,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { authedFetch } from "@/lib/api";
import type { BookingWithPro, ConnectionRequest } from "@shared/schema";
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

const SUPPORT_EMAIL = "hello@proconnectiv.com";

const BOOKING_STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  payment_pending: {
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-400",
    label: "Payment Pending",
  },
  payment_received: {
    bg: "bg-primary/10 border-primary/30",
    text: "text-primary",
    label: "Paid",
  },
  session_completed: {
    bg: "bg-blue-500/10 border-blue-500/30",
    text: "text-blue-400",
    label: "Session Completed",
  },
  payout_pending: {
    bg: "bg-violet-500/10 border-violet-500/30",
    text: "text-violet-300",
    label: "Payout Processing",
  },
  payout_sent: {
    bg: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-400",
    label: "Payout Sent",
  },
  payout_failed: {
    bg: "bg-red-500/10 border-red-500/30",
    text: "text-red-400",
    label: "Payout Issue",
  },
  refunded: {
    bg: "bg-zinc-500/10 border-zinc-500/30",
    text: "text-zinc-300",
    label: "Refunded",
  },
  cancelled: {
    bg: "bg-zinc-500/10 border-zinc-500/30",
    text: "text-zinc-400",
    label: "Cancelled",
  },
  booking_created: {
    bg: "bg-zinc-500/10 border-zinc-500/30",
    text: "text-zinc-400",
    label: "Created",
  },
};

const PRO_RESPONSE_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  pending: {
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-400",
    label: "Awaiting Pro Review",
  },
  accepted: {
    bg: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-400",
    label: "Accepted",
  },
  declined: {
    bg: "bg-red-500/10 border-red-500/30",
    text: "text-red-400",
    label: "Declined",
  },
};

type TabFilter = "all" | "upcoming" | "pending" | "past";
type ViewMode = "bookings" | "requests";

const PLATFORM_ICONS: Record<string, typeof Globe> = {
  Facebook: Facebook,
  Instagram: Instagram,
  LinkedIn: Linkedin,
  "X.com": Twitter,
  Email: Mail,
};

const CR_STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-400", label: "Pending" },
  accepted: { bg: "bg-primary/10 border-primary/30", text: "text-primary", label: "Accepted" },
  declined: { bg: "bg-red-500/10 border-red-500/30", text: "text-red-400", label: "Declined" },
  completed: { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-400", label: "Completed" },
  expired: { bg: "bg-zinc-500/10 border-zinc-500/30", text: "text-zinc-400", label: "Expired" },
};

const CONNECTION_TYPE_LABELS: Record<string, string> = {
  video: "Video Call",
  voice: "Voice Call",
  text: "Text Chat",
};

export default function MyBookings() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("requests");

  if (!authLoading && !user) {
    setLocation("/auth");
    return null;
  }

  const { data: bookings, isLoading } = useQuery<BookingWithPro[]>({
    queryKey: ["/api/me/bookings"],
    queryFn: async () => {
      const res = await authedFetch("/api/me/bookings");
      if (!res.ok) throw new Error("Failed to load bookings");
      return res.json();
    },
    enabled: !!user,
    staleTime: 15_000,
  });

  const { data: connectionReqs, isLoading: crLoading } = useQuery<
    ConnectionRequest[]
  >({
    queryKey: ["/api/me/connection-requests"],
    queryFn: async () => {
      const res = await authedFetch("/api/me/connection-requests");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    enabled: !!user,
    staleTime: 15_000,
  });

  const filtered = (bookings ?? []).filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "upcoming") return b.proResponseStatus === "accepted" && b.status === "payment_received";
    if (activeTab === "pending") {
      return b.status === "payment_pending" || b.proResponseStatus === "pending";
    }
    return ["session_completed", "payout_pending", "payout_sent", "payout_failed", "refunded", "cancelled"].includes(b.status) || b.proResponseStatus === "declined";
  });

  const filteredCR = (connectionReqs ?? []).filter((r) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return r.status === "pending";
    if (activeTab === "upcoming") return r.status === "accepted";
    return ["completed", "declined", "expired"].includes(r.status);
  });

  const bookingTabs: { id: TabFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: bookings?.length ?? 0 },
    {
      id: "upcoming",
      label: "Upcoming",
      count:
        bookings?.filter(
          (b) =>
            b.proResponseStatus === "accepted" && b.status === "payment_received",
        ).length ?? 0,
    },
    {
      id: "pending",
      label: "Pending",
      count:
        bookings?.filter(
          (b) =>
            b.status === "payment_pending" || b.proResponseStatus === "pending",
        ).length ?? 0,
    },
    {
      id: "past",
      label: "Past",
      count:
        bookings?.filter(
          (b) =>
            [
              "session_completed",
              "payout_pending",
              "payout_sent",
              "payout_failed",
              "refunded",
              "cancelled",
            ].includes(b.status) || b.proResponseStatus === "declined",
        ).length ?? 0,
    },
  ];

  const crTabs: { id: TabFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: connectionReqs?.length ?? 0 },
    { id: "pending", label: "Pending", count: connectionReqs?.filter((r) => r.status === "pending").length ?? 0 },
    { id: "upcoming", label: "Accepted", count: connectionReqs?.filter((r) => r.status === "accepted").length ?? 0 },
    { id: "past", label: "Past", count: connectionReqs?.filter((r) => ["completed", "declined", "expired"].includes(r.status)).length ?? 0 },
  ];

  const tabs = viewMode === "bookings" ? bookingTabs : crTabs;
  const loading = viewMode === "bookings" ? isLoading : crLoading;

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto max-w-[900px] px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              My Sessions
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Track your connection requests and pro bookings.
            </p>
          </div>
          <Link href="/request">
            <Button
              size="sm"
              className="bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              New Request
            </Button>
          </Link>
        </div>

        {/* View mode toggle */}
        <div className="mt-6 flex gap-1 rounded-lg border border-white/[0.06] bg-[#0a0a0a] p-1">
          <button
            onClick={() => { setViewMode("requests"); setActiveTab("all"); }}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              viewMode === "requests"
                ? "bg-primary/15 text-primary"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            Connection Requests
            {(connectionReqs?.length ?? 0) > 0 && (
              <span className="ml-1.5 text-xs text-primary/60">
                {connectionReqs?.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setViewMode("bookings"); setActiveTab("all"); }}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              viewMode === "bookings"
                ? "bg-primary/15 text-primary"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            Pro Bookings
            {(bookings?.length ?? 0) > 0 && (
              <span className="ml-1.5 text-xs text-primary/60">
                {bookings?.length}
              </span>
            )}
          </button>
        </div>

        {/* Status filter tabs */}
        <div className="mt-3 flex gap-1 rounded-lg border border-white/[0.06] bg-[#0a0a0a] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-white/[0.08] text-white"
                  : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  "ml-1.5 text-xs",
                  activeTab === tab.id ? "text-primary" : "text-zinc-600",
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="mt-6 space-y-3">
          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {!loading && viewMode === "requests" && filteredCR.length === 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-12 text-center">
              <Send className="mx-auto h-10 w-10 text-zinc-700" />
              <p className="mt-3 text-sm text-zinc-500">
                {activeTab === "all"
                  ? "No connection requests yet. Start by requesting a connection."
                  : `No ${activeTab} requests.`}
              </p>
              {activeTab === "all" && (
                <Link href="/">
                  <Button
                    variant="outline"
                    className="mt-4 border-white/10 text-white hover:border-primary/50 hover:text-primary bg-transparent"
                  >
                    Request a Connection <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          )}

          {!loading && viewMode === "bookings" && filtered.length === 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-12 text-center">
              <Inbox className="mx-auto h-10 w-10 text-zinc-700" />
              <p className="mt-3 text-sm text-zinc-500">
                {activeTab === "all"
                  ? "No bookings yet. Browse pros to get started."
                  : `No ${activeTab} bookings.`}
              </p>
              {activeTab === "all" && (
                <Link href="/pros">
                  <Button
                    variant="outline"
                    className="mt-4 border-white/10 text-white hover:border-primary/50 hover:text-primary bg-transparent"
                  >
                    Explore Pros <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          )}

          {viewMode === "requests" &&
            filteredCR.map((req) => (
              <ConnectionRequestCard key={req.id} request={req} />
            ))}

          {viewMode === "bookings" &&
            filtered.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: BookingWithPro }) {
  const Icon = SESSION_TYPE_ICONS[booking.sessionType] ?? CalendarDays;
  const status =
    BOOKING_STATUS_STYLES[booking.status] ?? BOOKING_STATUS_STYLES.booking_created;
  const proResponse =
    PRO_RESPONSE_STYLES[booking.proResponseStatus] ??
    PRO_RESPONSE_STYLES.pending;
  const initials = booking.proDisplayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5 transition-colors hover:border-white/[0.1]">
      <div className="flex items-start gap-4">
        <Link href={`/pro/${booking.proId}`}>
          <Avatar className="h-12 w-12 cursor-pointer ring-1 ring-white/10">
            <AvatarImage src={booking.proImageUrl} alt={booking.proDisplayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href={`/pro/${booking.proId}`}>
                <span className="text-sm font-semibold text-white hover:text-emerald-400 transition-colors cursor-pointer">
                  {booking.proDisplayName}
                </span>
              </Link>
              <span className="text-xs text-zinc-600">@{booking.proUsername}</span>
            </div>
            <Badge className={cn("border text-[10px] font-bold", status.bg, status.text)}>
              {status.label}
            </Badge>
          </div>

          <div className="mt-1.5 flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Icon className="h-3 w-3" />
              {SESSION_TYPE_LABELS[booking.sessionType] ?? booking.sessionType}
            </span>
            <span>
              {booking.currency} ${booking.grossAmount.toLocaleString()}
            </span>
            <span>
              {formatDistanceToNow(new Date(booking.createdAt), { addSuffix: true })}
            </span>
          </div>

          <p className="mt-2 text-sm text-zinc-400">{booking.topic}</p>
          {booking.message && (
            <p className="mt-1 text-xs text-zinc-600 line-clamp-2">{booking.message}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge className={cn("border text-[10px] font-bold", proResponse.bg, proResponse.text)}>
              {proResponse.label}
            </Badge>
            {booking.scheduledAt && (
              <span className="text-xs text-zinc-500">
                {format(new Date(booking.scheduledAt), "MMM d, yyyy • h:mm a")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
              Booking Reference
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-300">{booking.id}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
              Payment Provider
            </p>
            <p className="mt-1 text-sm text-white">Payoneer hosted payment</p>
          </div>
        </div>

        {booking.status === "payment_pending" && (
          <div className="mt-4 rounded-xl border border-primary/15 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  Complete payment securely to lock in this session
                </p>
                <p className="mt-1 text-xs leading-6 text-zinc-400">
                  You’ll complete payment on Payoneer’s secure page and return
                  here after payment. Once payment is confirmed, the pro can
                  review and accept the booking.
                </p>
                <div className="mt-3 grid gap-2 text-xs text-zinc-400 sm:grid-cols-2">
                  <p>Session: {SESSION_TYPE_LABELS[booking.sessionType] ?? booking.sessionType}</p>
                  <p>Pro: {booking.proDisplayName}</p>
                  <p>
                    Amount: {booking.currency} $
                    {booking.grossAmount.toLocaleString()}
                  </p>
                  <p>
                    Scheduled for:{" "}
                    {booking.scheduledAt
                      ? format(new Date(booking.scheduledAt), "MMM d, yyyy • h:mm a")
                      : "To be confirmed"}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {booking.paymentRequestLink ? (
                    <Button
                      asChild
                      size="sm"
                      className="bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      <a
                        href={booking.paymentRequestLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Pay securely with Payoneer
                        <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled
                      className="bg-primary/50 text-xs font-semibold text-primary-foreground"
                    >
                      Awaiting Payoneer payment link
                    </Button>
                  )}
                  <Link href={`/bookings/${booking.id}/payment`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 bg-transparent text-xs text-white hover:border-primary/50 hover:text-primary"
                    >
                      View payment details
                    </Button>
                  </Link>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-zinc-500">
                  <Link href="/policies#terms" className="hover:text-white">
                    Terms
                  </Link>
                  <Link href="/policies#privacy" className="hover:text-white">
                    Privacy
                  </Link>
                  <Link href="/policies#refund-policy" className="hover:text-white">
                    Refund Policy
                  </Link>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="hover:text-white"
                  >
                    Support: {SUPPORT_EMAIL}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {booking.status === "payment_received" && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
            <CircleDollarSign className="h-4 w-4" />
            Payment received. The pro can now review your request and confirm the session.
          </div>
        )}

        {booking.proResponseStatus === "declined" && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            This booking was declined. If payment was collected, the admin will
            handle the refund according to the refund policy.
          </div>
        )}

        {booking.proResponseStatus === "accepted" &&
          booking.status === "payment_received" &&
          booking.roomId && (
            <div className="mt-4 flex justify-end">
              <Link href={`/video-call/${booking.roomId}`}>
                <Button
                  size="sm"
                  className="bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Video className="mr-1.5 h-3.5 w-3.5" />
                  Join Session
                </Button>
              </Link>
            </div>
          )}
      </div>
    </div>
  );
}

function ConnectionRequestCard({ request }: { request: ConnectionRequest }) {
  const PlatformIcon = PLATFORM_ICONS[request.platform] ?? Globe;
  const status =
    CR_STATUS_STYLES[request.status] ?? CR_STATUS_STYLES.pending;

  const truncatedUrl =
    request.profileUrl.length > 40
      ? request.profileUrl.slice(0, 40) + "..."
      : request.profileUrl;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5 transition-colors hover:border-white/[0.1]">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20 shrink-0">
          <PlatformIcon className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                {request.platform}
              </span>
              {request.status === "pending" && (
                <Badge className="border-none bg-amber-500 px-1.5 py-0 text-[10px] font-bold text-black">
                  AWAITING
                </Badge>
              )}
            </div>
            <Badge
              className={cn(
                "border text-[10px] font-bold",
                status.bg,
                status.text,
              )}
            >
              {status.label}
            </Badge>
          </div>

          <p className="mt-0.5 text-xs text-zinc-500 truncate">
            {truncatedUrl}
          </p>

          <div className="mt-1.5 flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Video className="h-3 w-3" />
              {CONNECTION_TYPE_LABELS[request.connectionType] ??
                request.connectionType}
            </span>
            <span>{request.duration} min</span>
            <span>${request.amount}</span>
            <span>
              {formatDistanceToNow(new Date(request.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {request.messageText && (
            <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
              {request.messageText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
