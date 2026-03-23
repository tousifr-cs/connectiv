import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  MessageCircle,
  Mail,
  DollarSign,
  Settings,
  Zap,
  TrendingUp,
  AlertTriangle,
  Video,
  Mic,
  Clock,
  Bell,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import type { Creator } from "@shared/schema";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard", badge: null },
  { icon: MessageCircle, label: "Requests", href: "/dashboard/requests", badge: 12 },
  { icon: Mail, label: "Inbox", href: "/dashboard/inbox", badge: null },
  { icon: DollarSign, label: "Earnings", href: "/dashboard/earnings", badge: null },
  { icon: Settings, label: "Settings", href: "/dashboard/settings", badge: null },
];

const connectionRequests = [
  {
    id: 1,
    username: "@jordansmith_99",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan",
    type: "Requested 15m Video Call",
    topic: "Career Advice",
    price: 150.0,
    tag: "NEW" as const,
  },
  {
    id: 2,
    username: "@sarah_dev",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    type: "Requested 30m Audio Consultation",
    topic: "Portfolio Review",
    price: 275.0,
    tag: "RETURNING" as const,
  },
  {
    id: 3,
    username: "@marcus_v",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus",
    type: "Requested DM Bundle",
    topic: "Priority Access",
    price: 45.0,
    tag: null,
  },
  {
    id: 4,
    username: "@elena_peaks",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena",
    type: "Requested 60m Deep Dive",
    topic: "Scaling Teams",
    price: 500.0,
    tag: null,
  },
];

const earningsBreakdown = [
  { icon: Video, label: "Video Calls", amount: "$8,200", color: "text-emerald-400" },
  { icon: Mail, label: "DM Subscriptions", amount: "$3,150", color: "text-amber-400" },
  { icon: Mic, label: "Audio Consults", amount: "$1,100", color: "text-purple-400" },
];

function useCountdown(targetSeconds: number) {
  const [seconds, setSeconds] = useState(targetSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return {
    hours: String(hrs).padStart(2, "0"),
    minutes: String(mins).padStart(2, "0"),
    seconds: String(secs).padStart(2, "0"),
  };
}

function DashboardSidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[220px] flex-col border-r border-white/[0.06] bg-[#0a0a0a]">
      <Link href="/">
        <div className="flex cursor-pointer items-center gap-2.5 px-5 py-6 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20">
            <Zap className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">ProConnectiv</h1>
            <p className="text-[11px] text-emerald-400/80">Creator Portal</p>
          </div>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 px-3 pt-2">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href === "/dashboard" && location === "/dashboard");
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-black">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl border border-white/[0.06] bg-[#111] p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
          Pro Plan
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          Your subscription renews in 12 days.
        </p>
        <Button
          size="sm"
          className="mt-3 w-full bg-emerald-500 text-xs font-semibold text-black hover:bg-emerald-400"
        >
          Manage Plan
        </Button>
      </div>
    </aside>
  );
}

function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <Badge className="border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400">
            <TrendingUp className="mr-1 h-3 w-3" />
            +15.4%
          </Badge>
        </div>
        <p className="mt-3 text-xs text-zinc-500">Total Earnings</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-white">$12,450.00</p>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15">
            <MessageCircle className="h-5 w-5 text-blue-400" />
          </div>
          <Badge className="border-orange-500/30 bg-orange-500/10 text-xs text-orange-400">
            High priority
          </Badge>
        </div>
        <p className="mt-3 text-xs text-zinc-500">Pending Requests</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-white">12 Requests</p>
      </div>
    </div>
  );
}

function NextSessionCard() {
  const countdown = useCountdown(6322);

  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/60 via-[#0a1a10] to-[#0d0d0d] p-5">
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl" />
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
        Next Session In
      </p>
      <div className="mt-4 flex items-baseline justify-center gap-2">
        <TimeBlock value={countdown.hours} label="Hours" />
        <span className="text-2xl font-bold text-emerald-400">:</span>
        <TimeBlock value={countdown.minutes} label="Mins" />
        <span className="text-2xl font-bold text-emerald-400">:</span>
        <TimeBlock value={countdown.seconds} label="Secs" />
      </div>
    </div>
  );
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <span className="text-3xl font-bold tabular-nums text-white">{value}</span>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
    </div>
  );
}

function ConnectionRequestCard({
  request,
}: {
  request: (typeof connectionRequests)[number];
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#0d0d0d] px-4 py-3.5">
      <Avatar className="h-10 w-10">
        <AvatarImage src={request.avatar} alt={request.username} />
        <AvatarFallback>{request.username[1].toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{request.username}</span>
          {request.tag === "NEW" && (
            <Badge className="border-none bg-emerald-500 px-1.5 py-0 text-[10px] font-bold text-black">
              NEW
            </Badge>
          )}
          {request.tag === "RETURNING" && (
            <Badge className="border-none bg-zinc-600 px-1.5 py-0 text-[10px] font-bold text-zinc-200">
              RETURNING
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-xs text-zinc-500">
          {request.type} &middot; Topic: {request.topic}
        </p>
      </div>

      <p className="text-lg font-bold text-white">${request.price.toFixed(2)}</p>

      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-emerald-500 text-xs font-semibold text-black hover:bg-emerald-400"
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-zinc-700 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          Decline
        </Button>
      </div>
    </div>
  );
}

function UpcomingReminders() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
      <h3 className="text-sm font-semibold text-white">Upcoming Reminders</h3>
      <div className="mt-4 rounded-lg border border-white/[0.06] bg-[#111] p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
            <Bell className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Call with @it_steve</p>
            <p className="mt-0.5 text-xs text-zinc-500">Today at 4:30 PM (EST)</p>
            <p className="mt-2 text-xs italic text-zinc-400">
              "Discussing React architecture patterns for high-traffic sites."
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="mt-4 w-full border-zinc-700 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          Prepare Session
        </Button>
      </div>
    </div>
  );
}

function EarningsBreakdown() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-5">
      <h3 className="text-sm font-semibold text-white">Earnings Breakdown</h3>
      <div className="mt-4 space-y-3">
        {earningsBreakdown.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#111] px-4 py-3"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                item.label === "Video Calls" && "bg-emerald-500/15",
                item.label === "DM Subscriptions" && "bg-amber-500/15",
                item.label === "Audio Consults" && "bg-purple-500/15"
              )}
            >
              <item.icon className={cn("h-4 w-4", item.color)} />
            </div>
            <span className="flex-1 text-sm text-zinc-300">{item.label}</span>
            <span className="text-sm font-bold text-white">{item.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProTipCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 to-[#0d0d0d] p-5">
      <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
        Pro Tip
      </p>
      <p className="mt-2 text-sm text-zinc-300">
        Increase your rates by 10% for weekend sessions to maximize yield.
      </p>
    </div>
  );
}

function useCreatorProfile() {
  const { user, loading: authLoading } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/me/creator", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && !cancelled) {
          setCreator(await res.json());
        }
      } catch {
        // not a creator or network error
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  return { creator, loading: authLoading || loading, user };
}

export default function Dashboard() {
  const { creator, loading, user } = useCreatorProfile();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setLocation("/auth");
    } else if (!creator) {
      setLocation("/become-creator");
    }
  }, [loading, user, creator, setLocation]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!user || !creator) return null;

  const displayName = creator.displayName || user.displayName || "Creator";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex min-h-screen bg-black">
      <DashboardSidebar />

      <main className="ml-[220px] flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1200px] px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Dashboard Overview
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Welcome back, {displayName.split(" ")[0]}. Your connection rate is up 12% this week.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{displayName}</p>
                <p className="text-xs text-emerald-400">Status: Online</p>
              </div>
              <Avatar className="h-10 w-10 ring-2 ring-emerald-500/40">
                <AvatarImage
                  src={creator.imageUrl || user.photoURL || ""}
                  alt={displayName}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_auto]">
            <div className="lg:col-span-2">
              <StatsCards />
            </div>
            <div className="w-full lg:w-[260px]">
              <NextSessionCard />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {/* Left Column */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  Active Connection Requests
                </h2>
                <button className="text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300">
                  View All
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {connectionRequests.map((req) => (
                  <ConnectionRequestCard key={req.id} request={req} />
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <UpcomingReminders />
              <EarningsBreakdown />
              <ProTipCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
