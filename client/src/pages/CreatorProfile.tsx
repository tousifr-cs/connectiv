import { useState, useMemo } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useCreator } from "@/hooks/use-creators";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { authedFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  Users,
  Zap,
  MessageSquare,
  Settings,
  HelpCircle,
  Bell,
  Mail,
  Menu,
  X,
  ChevronDown,
  Loader2,
} from "lucide-react";

const LABEL_TO_SESSION_TYPE: Record<string, string> = {
  "15m Video Call": "video_call",
  "30m Audio Consultation": "audio_consult",
  "DM Bundle": "dm_bundle",
  "60m Deep Dive": "deep_dive",
  "1:1 Consultation": "video_call",
};

const SIDEBAR_NAV = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Creators", icon: Users, href: "/creators", active: true },
  { name: "Connections", icon: Zap, href: "/creators" },
  { name: "Messages", icon: MessageSquare, href: "/creators" },
  { name: "Settings", icon: Settings, href: "/dashboard" },
];

export default function CreatorProfile() {
  const [, params] = useRoute("/creator/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { data: creator, isLoading, isError } = useCreator(id);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [socialHandle, setSocialHandle] = useState("");
  const [connectionType, setConnectionType] = useState("");
  const [message, setMessage] = useState("");

  const bookingMutation = useMutation({
    mutationFn: async (data: {
      creatorId: number;
      sessionType: string;
      topic: string;
      message: string;
      price: number;
    }) => {
      const res = await authedFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request sent!",
        description: "The creator will review your request.",
      });
      setLocation("/dashboard");
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to send request",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const connectionTypes = useMemo(() => {
    if (!creator) return [];
    const types: { label: string; price: number }[] = [];
    if (creator.videoCallPrice)
      types.push({ label: "15m Video Call", price: creator.videoCallPrice });
    if (creator.audioConsultPrice)
      types.push({
        label: "30m Audio Consultation",
        price: creator.audioConsultPrice,
      });
    if (creator.dmBundlePrice)
      types.push({ label: "DM Bundle", price: creator.dmBundlePrice });
    if (creator.deepDivePrice)
      types.push({ label: "60m Deep Dive", price: creator.deepDivePrice });
    if (types.length === 0)
      types.push({ label: "1:1 Consultation", price: creator.price });
    return types;
  }, [creator]);

  if (isLoading) return <ProfileSkeleton />;
  if (isError || !creator) return <ProfileNotFound />;

  const selectedType = connectionType || connectionTypes[0]?.label || "";
  const selectedPrice =
    connectionTypes.find((t) => t.label === selectedType)?.price ||
    creator.price;

  const nameParts = creator.displayName.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  const categories = (creator.categories || "")
    .split(",")
    .filter(Boolean)
    .map((c) => c.trim().toUpperCase());
  const subtitle = creator.bio.split(".")[0];

  const initial =
    user?.displayName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 h-14 border-b border-white/10 bg-black/90 backdrop-blur-xl flex items-center px-4 lg:px-6">
        <div className="flex items-center gap-8 flex-1">
          <button
            className="lg:hidden p-1.5 hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <Link
            href="/"
            className="font-bold text-lg tracking-tight text-[#00fc40] shrink-0"
          >
            ProConnectiv
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {["Dashboard", "Creators", "Connections"].map((tab) => (
              <Link
                key={tab}
                href={
                  tab === "Dashboard"
                    ? "/dashboard"
                    : tab === "Creators"
                      ? "/creators"
                      : "/creators"
                }
                className={`text-sm font-medium transition-colors ${
                  tab === "Dashboard"
                    ? "text-[#00fc40]"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {tab}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-white/50" />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Mail className="w-5 h-5 text-white/50" />
          </button>
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
            <span className="text-xs font-bold text-white/60">{initial}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-14 z-40 lg:z-auto h-[calc(100vh-3.5rem)] w-[200px] bg-[#0a0a0a] border-r border-white/10 flex flex-col shrink-0 transition-transform duration-200 ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <nav className="flex-1 p-3 pt-6 space-y-1">
            {SIDEBAR_NAV.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? "text-[#00fc40] bg-[#00fc40]/5 border-l-2 border-[#00fc40]"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-3 space-y-2 border-t border-white/10">
            <Link href="/become-creator">
              <button className="w-full py-2.5 rounded-lg btn-gradient-fade text-xs font-bold uppercase tracking-wider">
                Upgrade to Pro
              </button>
            </Link>
            <span className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors cursor-pointer">
              <HelpCircle className="w-4 h-4" />
              Help Center
            </span>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Left: Creator Profile */}
              <div className="space-y-6">
                {/* Avatar */}
                <div className="w-28 h-28 rounded-lg overflow-hidden border-2 border-[#00fc40]/30 bg-white/10">
                  <img
                    src={creator.imageUrl}
                    alt={creator.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name */}
                <div>
                  <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-[0.9]">
                    {firstName}
                  </h1>
                  <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-[0.9] text-[#00fc40]">
                    {lastName}
                  </h1>
                  <p className="text-white/40 mt-3 text-sm">{subtitle}</p>
                </div>

                {/* Availability */}
                <div className="border-l-2 border-[#00fc40] pl-4 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1.5">
                    Availability
                  </p>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {creator.availability}
                  </p>
                </div>

                {/* Category Tags */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#00fc40]/15 text-[#00fc40] border border-[#00fc40]/30"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: Request Connection Form */}
              <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 lg:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">Request Connection</h2>
                  <Zap className="w-6 h-6 text-white/15" />
                </div>

                <div className="space-y-6">
                  {/* Social Handle */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 block">
                      Your Social Handle
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">
                        @
                      </span>
                      <input
                        type="text"
                        value={socialHandle}
                        onChange={(e) => setSocialHandle(e.target.value)}
                        placeholder="username"
                        className="w-full h-12 pl-9 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#00fc40]/40 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Connection Type */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 block">
                      Connection Type
                    </label>
                    <div className="relative">
                      <select
                        value={selectedType}
                        onChange={(e) => setConnectionType(e.target.value)}
                        className="w-full h-12 px-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white appearance-none focus:outline-none focus:border-[#00fc40]/40 transition-colors cursor-pointer"
                      >
                        {connectionTypes.map((type) => (
                          <option
                            key={type.label}
                            value={type.label}
                            className="bg-[#111]"
                          >
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    </div>
                  </div>

                  {/* Message / Topic */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 block">
                      Message / Topic
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Briefly describe what you'd like to discuss or achieve."
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#00fc40]/40 transition-colors resize-none"
                    />
                  </div>

                  {/* Total Fee */}
                  <div className="pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
                      Total Connection Fee
                    </p>
                    <div className="flex items-end justify-between">
                      <p className="text-3xl font-bold tracking-tight">
                        ${selectedPrice.toFixed(2)}
                      </p>
                      <p className="text-[11px] text-white/30">
                        includes platform insurance
                      </p>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    disabled={bookingMutation.isPending || !user || !message.trim()}
                    onClick={() => {
                      if (!user) {
                        setLocation("/auth");
                        return;
                      }
                      bookingMutation.mutate({
                        creatorId: creator.id,
                        sessionType: LABEL_TO_SESSION_TYPE[selectedType] ?? "video_call",
                        topic: message.trim().split("\n")[0].slice(0, 100) || "Session Request",
                        message: message.trim(),
                        price: selectedPrice,
                      });
                    }}
                    className="w-full py-4 rounded-lg btn-gradient-fade text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {bookingMutation.isPending && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    Send Request
                  </button>

                  <p className="text-center text-[11px] text-white/25 leading-relaxed">
                    Requests are usually responded to within 48 hours. Fees are
                    held in escrow until completion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 lg:px-6 py-4 flex items-center justify-between text-xs text-white/25">
        <span>&copy; 2024 ProConnectiv. Built for the Neon Monolith.</span>
        <span className="hover:text-white/50 cursor-pointer transition-colors">
          Terms of Service
        </span>
      </footer>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="space-y-6 w-full max-w-md px-4">
        <Skeleton className="w-28 h-28 rounded-lg bg-white/5" />
        <Skeleton className="h-10 w-3/4 bg-white/5" />
        <Skeleton className="h-6 w-1/2 bg-white/5" />
        <Skeleton className="h-20 w-full bg-white/5 rounded-xl" />
      </div>
    </div>
  );
}

function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Profile Not Found</h1>
      <Link href="/creators">
        <Button
          variant="outline"
          className="border-white/20 text-white"
        >
          Back to Creators
        </Button>
      </Link>
    </div>
  );
}
