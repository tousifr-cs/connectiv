import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  MessageCircle,
  Mail,
  DollarSign,
  Settings,
  Loader2,
  ExternalLink,
  ArrowLeft,
  CalendarDays,
} from "lucide-react";
import { ProConnectivLogo } from "@/components/ProConnectivLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { Pro, BookingWithRequester } from "@shared/schema";

const manageItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: MessageCircle, label: "Requests", href: "/dashboard/requests", badgeKey: "requests" as const },
  { icon: Mail, label: "Inbox", href: "/dashboard/inbox" },
];

const businessItems = [
  { icon: DollarSign, label: "Earnings", href: "/dashboard/earnings" },
];

const accountItems = [
  { icon: Settings, label: "Pro Settings", href: "/dashboard/settings" },
];

function useProProfile() {
  const { user, loading: authLoading } = useAuth();

  const { data, isLoading: queryLoading } = useQuery<Pro | null>({
    queryKey: ["/api/me/pro"],
    queryFn: async () => {
      const res = await fetch("/api/me/pro", { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch pro profile");
      return res.json();
    },
    enabled: !authLoading && !!user,
    retry: false,
    staleTime: 30_000,
  });

  return {
    pro: data ?? null,
    loading: authLoading || (!!user && queryLoading),
    user,
  };
}

function usePendingCount() {
  const { user } = useAuth();

  const { data } = useQuery<BookingWithRequester[]>({
    queryKey: ["/api/me/requests"],
    queryFn: async () => {
      const res = await fetch("/api/me/requests", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
    staleTime: 15_000,
  });

  return data?.filter((b) => b.status === "pending").length ?? 0;
}

function NavItem({
  item,
  isActive,
  badge,
}: {
  item: { icon: typeof LayoutDashboard; label: string; href: string };
  isActive: boolean;
  badge?: number | null;
}) {
  return (
    <Link href={item.href}>
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
        {badge != null && badge > 0 && (
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-black">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}

function DashboardSidebar({ pro }: { pro: Pro }) {
  const [location] = useLocation();
  const pendingCount = usePendingCount();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[220px] flex-col border-r border-white/[0.06] bg-[#0a0a0a]">
      <Link href="/">
        <div className="flex cursor-pointer items-center gap-2.5 px-5 py-6 transition-opacity hover:opacity-80">
          <ProConnectivLogo size="sm" />
        </div>
      </Link>

      <nav className="flex-1 space-y-4 px-3 pt-2 overflow-y-auto">
        <div>
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Manage
          </p>
          <div className="space-y-0.5">
            {manageItems.map((item) => {
              const isActive =
                location === item.href ||
                (item.href !== "/dashboard" && location.startsWith(item.href));
              const badge = item.badgeKey === "requests" ? pendingCount : null;
              return <NavItem key={item.href} item={item} isActive={isActive} badge={badge} />;
            })}
          </div>
        </div>

        <div>
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Business
          </p>
          <div className="space-y-0.5">
            {businessItems.map((item) => {
              const isActive = location === item.href || location.startsWith(item.href);
              return <NavItem key={item.href} item={item} isActive={isActive} />;
            })}
          </div>
        </div>

        <div>
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Account
          </p>
          <div className="space-y-0.5">
            {accountItems.map((item) => {
              const isActive = location === item.href || location.startsWith(item.href);
              return <NavItem key={item.href} item={item} isActive={isActive} />;
            })}
            <Link href={`/pro/${pro.id}`}>
              <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 transition-colors">
                <ExternalLink className="h-[18px] w-[18px]" />
                <span>Public Profile</span>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <div className="border-t border-white/[0.06] px-3 py-3 space-y-1">
        <Link href="/inbox">
          <div className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors">
            <CalendarDays className="h-[16px] w-[16px]" />
            <span>Inbox</span>
          </div>
        </Link>
        <Link href="/pros">
          <div className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors">
            <ArrowLeft className="h-[16px] w-[16px]" />
            <span>Browse Pros</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { pro, loading, user } = useProProfile();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setLocation("/auth");
    } else if (!pro) {
      setLocation("/become-pro");
    }
  }, [loading, user, pro, setLocation]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!user || !pro) return null;

  const displayName = pro.displayName || user.displayName || "Pro";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex min-h-screen bg-black">
      <DashboardSidebar pro={pro} />
      <main className="ml-[220px] flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1200px] px-8 py-8">
          <div className="mb-6 flex items-start justify-between">
            <div />
            <Link href="/profile">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    {displayName}
                  </p>
                  <p className="text-xs text-emerald-400">Pro</p>
                </div>
                <Avatar className="h-10 w-10 ring-2 ring-emerald-500/40">
                  <AvatarImage
                    src={pro.imageUrl || user.photoURL || ""}
                    alt={displayName}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </div>
            </Link>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

export { useProProfile };
