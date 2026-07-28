import { Link, useLocation } from "wouter";
import {
  Menu,
  LogOut,
  User,
  CalendarDays,
  Zap,
  Settings,
  Mail,
  Wallet,
  ChevronRight,
  Shield,
} from "lucide-react";
import { ProConnectivLogo } from "@/components/ProConnectivLogo";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { authedFetch } from "@/lib/api";
import type { Pro } from "@shared/schema";
import { cn } from "@/lib/utils";

function isRequestsActive(location: string) {
  return (
    location.startsWith("/requests") ||
    location === "/post" ||
    location.startsWith("/jobs")
  );
}

function useCreatorStatus() {
  const { user, loading } = useAuth();

  const { data } = useQuery<Pro | null>({
    queryKey: ["/api/me/creator"],
    queryFn: async () => {
      const res = await authedFetch("/api/me/creator");
      if (res.status === 404) return null;
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !loading && !!user,
    retry: false,
    staleTime: 60_000,
  });

  return { isCreator: !!data, creator: data ?? null };
}

function NavLink({
  href,
  active,
  children,
  badge,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  badge?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("nav-polygon-link", active && "nav-polygon-link-active")}
    >
      <span className="inline-flex items-center gap-1.5">
        {children}
        {badge && (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#7b3fe4]" />
        )}
      </span>
    </Link>
  );
}

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isCreator } = useCreatorStatus();

  const inboxHref = isCreator ? "/dashboard/inbox" : "/inbox";
  const requestsActive = isRequestsActive(location);

  const initial =
    user?.displayName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  const closeMobile = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-black">
      <div className="mx-auto flex h-[60px] w-full max-w-[1440px] items-center px-5 lg:px-10">
        <Link
          href="/"
          className="group flex shrink-0 cursor-pointer items-center"
        >
          <ProConnectivLogo size="nav" />
        </Link>

        {/* Desktop Nav */}
        <div className="ml-8 hidden flex-1 items-center gap-7 lg:flex xl:gap-9">
          <NavLink href="/post" active={location === "/post"} badge>
            Post a request
          </NavLink>
          <NavLink
            href="/requests"
            active={requestsActive && location !== "/post"}
          >
            Browse requests
          </NavLink>
          {user && (
            <NavLink href={inboxHref} active={location === inboxHref}>
              Inbox
            </NavLink>
          )}
          <NavLink href="/support" active={location.startsWith("/support")}>
            Help
          </NavLink>
        </div>

        {/* Desktop Actions */}
        <div className="ml-auto hidden items-center gap-7 md:flex">
          {user ? (
            <>
              {isCreator && (
                <Link href="/dashboard" className="nav-polygon-link">
                  Creator portal
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full px-1 py-1 transition-opacity hover:opacity-70">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5">
                      <span className="text-[10px] font-semibold text-white">
                        {initial}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-60 border-white/10 bg-black"
                >
                  <div className="px-3 py-2.5">
                    <p className="truncate text-sm font-medium text-white">
                      {user.displayName || "User"}
                    </p>
                    <p className="truncate text-xs text-white/50">
                      {user.email}
                    </p>
                    {isCreator && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
                        <Zap className="h-2.5 w-2.5" /> Creator
                      </span>
                    )}
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />

                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Account
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer text-white/80 focus:bg-white/10 focus:text-white"
                    >
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-white/40" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer text-white/80 focus:bg-white/10 focus:text-white"
                    >
                      <Link href="/inbox" className="flex items-center">
                        <CalendarDays className="mr-2 h-4 w-4 text-white/40" />
                        Inbox
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer text-white/80 focus:bg-white/10 focus:text-white"
                    >
                      <Link href="/wallet" className="flex items-center">
                        <Wallet className="mr-2 h-4 w-4 text-white/40" />
                        Wallet
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer text-amber-400 focus:text-amber-300 focus:bg-amber-500/10"
                      >
                        <Link href="/admin" className="flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="bg-white/10" />

                  <DropdownMenuGroup>
                    {isCreator && (
                      <>
                        <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                          Creator
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          asChild
                          className="cursor-pointer text-white focus:bg-white/10"
                        >
                          <Link href="/dashboard" className="flex items-center">
                            <Zap className="mr-2 h-4 w-4" />
                            Creator Portal
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          className="cursor-pointer text-white/80 focus:bg-white/10 focus:text-white"
                        >
                          <Link
                            href="/dashboard/inbox"
                            className="flex items-center"
                          >
                            <Mail className="mr-2 h-4 w-4 text-white/40" />
                            Inbox
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          className="cursor-pointer text-white/80 focus:bg-white/10 focus:text-white"
                        >
                          <Link
                            href="/dashboard/settings"
                            className="flex items-center"
                          >
                            <Settings className="mr-2 h-4 w-4 text-white/40" />
                            Creator Settings
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="cursor-pointer text-white/80 focus:bg-white/10 focus:text-white"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/auth" className="nav-polygon-link">
                Log in
              </Link>
              <Link href="/auth" className="btn-polygon-cta">
                Sign up
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="ml-auto md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] border-l border-zinc-800 bg-black"
            >
              <div className="mt-10 flex flex-col gap-8">
                {user && (
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5">
                      <span className="text-sm font-bold text-white">
                        {initial}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {user.displayName || "User"}
                      </p>
                      <p className="truncate text-xs text-white/50">
                        {user.email}
                      </p>
                      {isCreator && (
                        <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
                          <Zap className="h-2.5 w-2.5" /> Creator
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-5">
                  {[
                    { href: "/post", label: "Post a request" },
                    { href: "/requests", label: "Browse requests" },
                    { href: "/support", label: "Help" },
                    ...(user ? [{ href: inboxHref, label: "Inbox" }] : []),
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-[13px] font-medium uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-70"
                      onClick={closeMobile}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {user && (
                  <>
                    <div className="h-px bg-white/10" />
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Account
                    </p>
                    <div className="flex flex-col gap-3">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 text-sm text-white/70 transition-colors hover:text-white"
                        onClick={closeMobile}
                      >
                        <User className="h-4 w-4 text-white/40" /> My Profile
                      </Link>
                      <Link
                        href="/inbox"
                        className="flex items-center gap-3 text-sm text-white/70 transition-colors hover:text-white"
                        onClick={closeMobile}
                      >
                        <CalendarDays className="h-4 w-4 text-white/40" /> Inbox
                      </Link>
                      <Link
                        href="/wallet"
                        className="flex items-center gap-3 text-sm text-white/70 transition-colors hover:text-white"
                        onClick={closeMobile}
                      >
                        <Wallet className="h-4 w-4 text-white/40" /> Wallet
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <Shield className="h-4 w-4" /> Admin
                        </Link>
                      )}
                    </div>
                    <div className="h-px bg-white/10" />
                    {isCreator && (
                      <div className="flex flex-col gap-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                          Creator
                        </p>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 text-sm text-white transition-colors hover:text-white/80"
                          onClick={closeMobile}
                        >
                          <Zap className="h-4 w-4" /> Creator Portal
                        </Link>
                      </div>
                    )}
                  </>
                )}

                <div className="h-px bg-white/10" />
                <div className="flex flex-col gap-4">
                  {user ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        signOut();
                        closeMobile();
                      }}
                      className="w-full border-white/20 bg-transparent text-white/80 hover:border-white/40 hover:bg-white/5 hover:text-white"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  ) : (
                    <>
                      <Link href="/auth" onClick={closeMobile}>
                        <Button
                          variant="outline"
                          className="w-full border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/5"
                        >
                          Log in
                        </Button>
                      </Link>
                      <Link href="/auth" onClick={closeMobile}>
                        <span className="btn-polygon-cta w-full justify-center">
                          Sign up
                          <ChevronRight
                            className="h-3.5 w-3.5"
                            strokeWidth={2.5}
                          />
                        </span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
