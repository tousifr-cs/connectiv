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

function useProStatus() {
  const { user, loading } = useAuth();

  const { data } = useQuery<Pro | null>({
    queryKey: ["/api/me/pro"],
    queryFn: async () => {
      const res = await authedFetch("/api/me/pro");
      if (res.status === 404) return null;
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !loading && !!user,
    retry: false,
    staleTime: 60_000,
  });

  return { isPro: !!data, pro: data ?? null };
}

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isPro } = useProStatus();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Pros", href: "/pros" },
    { name: "For Pros", href: "/for-pros" },
    ...(user
      ? [
          {
            name: "Inbox",
            href: isPro ? "/dashboard/inbox" : "/inbox",
          },
        ]
      : []),
    ...(user?.role === "admin" ? [{ name: "Admin", href: "/admin" }] : []),
  ];

  const initial =
    user?.displayName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  const menuItemClass =
    "cursor-pointer text-zinc-300 focus:text-white focus:bg-zinc-900";
  const menuItemClassProPortal =
    "cursor-pointer text-emerald-400 focus:text-emerald-300 focus:bg-emerald-500/10";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <ProConnectivLogo size="sm" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-zinc-100 ${
                location === link.href ? "text-zinc-100" : "text-zinc-400"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {isPro && (
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="border-zinc-700 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-900 bg-transparent font-medium text-xs"
                  >
                    <Zap className="mr-1.5 h-3.5 w-3.5" />
                    Pro Portal
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-zinc-900 transition-colors">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isPro
                          ? "bg-emerald-500/20 border border-emerald-500/30"
                          : "bg-zinc-900 border border-zinc-700"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold ${
                          isPro ? "text-emerald-400" : "text-zinc-200"
                        }`}
                      >
                        {initial}
                      </span>
                    </div>
                    <span className="text-sm text-zinc-300 max-w-[120px] truncate">
                      {user.displayName || user.email}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-60 bg-[#0a0a0a] border-zinc-800"
                >
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-medium text-white truncate">
                      {user.displayName || "User"}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    {isPro && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        <Zap className="h-2.5 w-2.5" /> Pro
                      </span>
                    )}
                  </div>
                  <DropdownMenuSeparator className="bg-zinc-800" />

                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">
                      Account
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild className={menuItemClass}>
                      <Link href="/profile" className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-zinc-500" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className={menuItemClass}>
                      <Link href="/inbox" className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-2 text-zinc-500" />
                        Inbox
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className={menuItemClass}>
                      <Link href="/wallet" className="flex items-center">
                        <Wallet className="w-4 h-4 mr-2 text-zinc-500" />
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

                  <DropdownMenuSeparator className="bg-zinc-800" />

                  <DropdownMenuGroup>
                    {isPro && (
                      <>
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">
                          Pro
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild className={menuItemClassProPortal}>
                          <Link href="/dashboard" className="flex items-center">
                            <Zap className="w-4 h-4 mr-2" />
                            Pro Portal
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className={menuItemClass}>
                          <Link
                            href="/dashboard/inbox"
                            className="flex items-center"
                          >
                            <Mail className="w-4 h-4 mr-2 text-zinc-500" />
                            Inbox
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className={menuItemClass}>
                          <Link
                            href="/dashboard/settings"
                            className="flex items-center"
                          >
                            <Settings className="w-4 h-4 mr-2 text-zinc-500" />
                            Pro Settings
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="text-zinc-300 focus:text-white focus:bg-zinc-900 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/auth">
              <Button className="bg-zinc-100 text-black hover:bg-zinc-200 font-bold rounded-lg px-6 transition-all">
                Join
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-zinc-100">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] border-l border-zinc-800 bg-black"
            >
              <div className="flex flex-col gap-8 mt-10">
                {user && (
                  <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isPro
                          ? "bg-emerald-500/20 border border-emerald-500/30"
                          : "bg-zinc-900 border border-zinc-700"
                      }`}
                    >
                      <span
                        className={`text-sm font-bold ${
                          isPro ? "text-emerald-400" : "text-zinc-200"
                        }`}
                      >
                        {initial}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      {isPro && (
                        <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <Zap className="h-2.5 w-2.5" /> Pro
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={
                        link.name === "Pros"
                          ? "group inline-flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-900/75 px-3.5 py-3 text-base font-semibold text-zinc-100 hover:border-zinc-500 transition-colors"
                          : "text-lg font-medium text-zinc-100 hover:text-white transition-colors"
                      }
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                      {link.name === "Pros" && (
                        <span className="rounded-full border border-zinc-600 bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-zinc-300">
                          Explore
                        </span>
                      )}
                    </Link>
                  ))}
                </div>

                {user && (
                  <>
                    <div className="h-px bg-zinc-800" />
                    <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">
                      Account
                    </p>
                    <div className="flex flex-col gap-3">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="h-4 w-4 text-zinc-500" /> My Profile
                      </Link>
                      <Link
                        href="/inbox"
                        className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <CalendarDays className="h-4 w-4 text-zinc-500" /> Inbox
                      </Link>
                      <Link
                        href="/wallet"
                        className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <Wallet className="h-4 w-4 text-zinc-500" /> Wallet
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
                    <div className="h-px bg-zinc-800" />
                    {isPro && (
                      <div className="flex flex-col gap-3">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">
                          Pro
                        </p>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 text-sm text-zinc-200 hover:text-white transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <Zap className="h-4 w-4" /> Pro Portal
                        </Link>
                      </div>
                    )}
                  </>
                )}

                <div className="h-px bg-zinc-800" />
                <div className="flex flex-col gap-4">
                  {user ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-500 bg-transparent"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </Button>
                  ) : (
                    <>
                      <Link href="/auth" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full border-zinc-700 text-zinc-200 hover:border-zinc-500 hover:text-white bg-transparent"
                        >
                          Log In
                        </Button>
                      </Link>
                      <Link href="/auth" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-zinc-100 text-black font-bold hover:bg-zinc-200">
                          Join
                        </Button>
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
