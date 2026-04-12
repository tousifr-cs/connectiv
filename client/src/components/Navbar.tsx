import { Link, useLocation } from "wouter";
import { Menu, LogOut, User, CalendarDays, Zap, Settings, Mail, Wallet } from "lucide-react";
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
import type { Creator } from "@shared/schema";

function useCreatorStatus() {
  const { user, loading } = useAuth();

  const { data } = useQuery<Creator | null>({
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

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isCreator } = useCreatorStatus();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Creators", href: "/creators" },
    ...(user ? [{ name: "Inbox", href: isCreator ? "/dashboard/inbox" : "/inbox" }] : []),
  ];

  const initial = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
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
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === link.href ? "text-primary" : "text-muted-foreground"
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
              {isCreator && (
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-500/10 bg-transparent font-medium text-xs"
                  >
                    <Zap className="mr-1.5 h-3.5 w-3.5" />
                    Creator Portal
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-white/5 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCreator
                        ? "bg-emerald-500/20 border border-emerald-500/30"
                        : "bg-primary/20 border border-primary/30"
                    }`}>
                      <span className={`text-xs font-bold ${isCreator ? "text-emerald-400" : "text-primary"}`}>
                        {initial}
                      </span>
                    </div>
                    <span className="text-sm text-white/80 max-w-[120px] truncate">
                      {user.displayName || user.email}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 bg-[#0a0a0a] border-white/10">
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-medium text-white truncate">
                      {user.displayName || "User"}
                    </p>
                    <p className="text-xs text-white/40 truncate">{user.email}</p>
                    {isCreator && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        <Zap className="h-2.5 w-2.5" /> Creator
                      </span>
                    )}
                  </div>
                  <DropdownMenuSeparator className="bg-white/[0.06]" />

                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">
                      Account
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild className="cursor-pointer text-zinc-300 focus:text-white focus:bg-white/5">
                      <Link href="/profile" className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-zinc-500" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer text-zinc-300 focus:text-white focus:bg-white/5">
                      <Link href="/inbox" className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-2 text-zinc-500" />
                        Inbox
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer text-zinc-300 focus:text-white focus:bg-white/5">
                      <Link href="/wallet" className="flex items-center">
                        <Wallet className="w-4 h-4 mr-2 text-zinc-500" />
                        Wallet
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="bg-white/[0.06]" />

                  <DropdownMenuGroup>
                    {isCreator && (
                      <>
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">
                          Creator
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild className="cursor-pointer text-emerald-400 focus:text-emerald-300 focus:bg-emerald-500/10">
                          <Link href="/dashboard" className="flex items-center">
                            <Zap className="w-4 h-4 mr-2" />
                            Creator Portal
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer text-zinc-300 focus:text-white focus:bg-white/5">
                          <Link href="/dashboard/inbox" className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-zinc-500" />
                            Inbox
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer text-zinc-300 focus:text-white focus:bg-white/5">
                          <Link href="/dashboard/settings" className="flex items-center">
                            <Settings className="w-4 h-4 mr-2 text-zinc-500" />
                            Creator Settings
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="bg-white/[0.06]" />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/auth">
              <Button className="bg-primary text-black hover:bg-primary/90 font-bold rounded-lg px-6 transition-all">
                Sign up
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] border-l border-white/10 bg-black">
              <div className="flex flex-col gap-8 mt-10">
                {user && (
                  <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCreator
                        ? "bg-emerald-500/20 border border-emerald-500/30"
                        : "bg-primary/20 border border-primary/30"
                    }`}>
                      <span className={`text-sm font-bold ${isCreator ? "text-emerald-400" : "text-primary"}`}>
                        {initial}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.displayName || "User"}</p>
                      <p className="text-xs text-white/40 truncate">{user.email}</p>
                      {isCreator && (
                        <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <Zap className="h-2.5 w-2.5" /> Creator
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
                      className="text-lg font-medium text-white hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>

                {user && (
                  <>
                    <div className="h-px bg-white/10" />
                    <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">Account</p>
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
                    </div>
                    <div className="h-px bg-white/10" />
                    {isCreator && (
                      <div className="flex flex-col gap-3">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold">Creator</p>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                          onClick={() => setIsOpen(false)}
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
                        setIsOpen(false);
                      }}
                      className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 bg-transparent"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </Button>
                  ) : (
                    <>
                      <Link href="/auth" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full border-white/20 text-white hover:border-primary hover:text-primary bg-transparent">
                          Log In
                        </Button>
                      </Link>
                      <Link href="/auth" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-primary text-black font-bold">
                          Sign Up
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
