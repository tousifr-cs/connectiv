import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  MessageCircle,
  Mail,
  DollarSign,
  Settings,
  Zap,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { Creator, BookingWithRequester } from "@shared/schema";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: MessageCircle, label: "Requests", href: "/dashboard/requests" },
  { icon: Mail, label: "Inbox", href: "/dashboard/inbox" },
  { icon: DollarSign, label: "Earnings", href: "/dashboard/earnings" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

function useCreatorProfile() {
  const { user, loading: authLoading } = useAuth();

  const { data, isLoading: queryLoading } = useQuery<Creator | null>({
    queryKey: ["/api/me/creator"],
    queryFn: async () => {
      const token = await user!.getIdToken();
      const res = await fetch("/api/me/creator", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch creator profile");
      return res.json();
    },
    enabled: !authLoading && !!user,
    retry: false,
    staleTime: 30_000,
  });

  return {
    creator: data ?? null,
    loading: authLoading || (!!user && queryLoading),
    user,
  };
}

function usePendingCount() {
  const { user } = useAuth();

  const { data } = useQuery<BookingWithRequester[]>({
    queryKey: ["/api/me/requests"],
    queryFn: async () => {
      const token = await user!.getIdToken();
      const res = await fetch("/api/me/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
    staleTime: 15_000,
  });

  return data?.filter((b) => b.status === "pending").length ?? 0;
}

function DashboardSidebar() {
  const [location] = useLocation();
  const pendingCount = usePendingCount();

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
          const isActive =
            location === item.href ||
            (item.href !== "/dashboard" && location.startsWith(item.href));
          const badge =
            item.href === "/dashboard/requests" && pendingCount > 0
              ? pendingCount
              : null;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
                {badge && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-black">
                    {badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl border border-white/[0.06] bg-[#111] p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
          Creator
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          Manage your sessions and earnings from here.
        </p>
      </div>
    </aside>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
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
          <div className="mb-6 flex items-start justify-between">
            <div />
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
          {children}
        </div>
      </main>
    </div>
  );
}

export { useCreatorProfile };
