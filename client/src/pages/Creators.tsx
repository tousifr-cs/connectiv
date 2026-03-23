import { useState, useRef } from "react";
import { Link } from "wouter";
import { useCreators } from "@/hooks/use-creators";
import { CreatorCard } from "@/components/CreatorCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  Search,
  Loader2,
  Compass,
  TrendingUp,
  BarChart3,
  Users,
  MessageSquare,
  Settings,
  HelpCircle,
  Bell,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const MARKET_SECTORS = [
  "All Markets",
  "Technology",
  "Design",
  "Web3",
  "AI & ML",
  "Content Creation",
  "Marketing",
  "Finance",
  "Music",
  "Photography",
];

const SIDEBAR_NAV = [
  { name: "Discover", icon: Compass, href: "/creators" },
  { name: "Trending", icon: TrendingUp, href: "/creators" },
  { name: "Analytics", icon: BarChart3, href: "/dashboard" },
  { name: "My Network", icon: Users, href: "/creators" },
  { name: "Messages", icon: MessageSquare, href: "/creators" },
];

export default function Creators() {
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState("All Markets");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: creators, isLoading, isError } = useCreators(search);
  const { user } = useAuth();
  const sectorsRef = useRef<HTMLDivElement>(null);

  const filteredCreators = creators?.filter((creator) => {
    if (selectedSector === "All Markets") return true;
    const sector = selectedSector.toLowerCase();
    return (
      creator.bio.toLowerCase().includes(sector) ||
      creator.displayName.toLowerCase().includes(sector) ||
      (creator.categories || "").toLowerCase().includes(sector)
    );
  });

  const scrollSectors = (direction: "left" | "right") => {
    sectorsRef.current?.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  const initial =
    user?.displayName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <div className="min-h-screen bg-black text-white">
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
            className="font-bold text-lg tracking-tight text-white shrink-0"
          >
            ProConnectiv
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {["Discover", "Trending", "Network"].map((tab) => (
              <span
                key={tab}
                className={`text-sm font-medium cursor-pointer transition-colors ${
                  tab === "Discover"
                    ? "text-[#00fc40]"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {tab}
              </span>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Quick search..."
              className="h-9 pl-9 pr-4 w-48 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00fc40]/40 transition-colors"
            />
          </div>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-white/50" />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <UserCircle className="w-5 h-5 text-white/50" />
          </button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-3.5rem)]">
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
          {/* User Profile */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                <span className="text-sm font-bold text-white/60">
                  {initial}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.displayName || "Guest"}
                </p>
                <p className="text-[10px] font-bold tracking-widest text-[#00fc40]/60 uppercase">
                  {user ? "Elite Tier" : "Sign In"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {SIDEBAR_NAV.map((item) => {
              const isActive = item.name === "Discover";
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#00fc40] bg-[#00fc40]/5 border-l-2 border-[#00fc40]"
                      : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="p-3 space-y-1 border-t border-white/10">
            <Link href="/become-creator">
              <button className="w-full mb-3 py-2.5 rounded-lg btn-gradient-fade text-xs font-bold uppercase tracking-wider transition-all">
                Upgrade to Pro
              </button>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <span className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors cursor-pointer">
              <HelpCircle className="w-4 h-4" />
              Support
            </span>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-10">
              Find a Creator.
            </h1>

            {/* Search */}
            <div className="flex items-center gap-3 mb-10">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  placeholder="Search by name, niche, or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-[#00fc40]/40 transition-colors"
                />
              </div>
              <Button className="h-14 px-8 rounded-xl btn-gradient-fade font-bold uppercase text-sm tracking-wider shrink-0 border-0">
                Search
              </Button>
            </div>

            {/* Market Sectors */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                  Market Sectors
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => scrollSectors("left")}
                    className="p-1.5 rounded-md hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollSectors("right")}
                    className="p-1.5 rounded-md hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div
                ref={sectorsRef}
                className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1"
              >
                {MARKET_SECTORS.map((sector) => (
                  <button
                    key={sector}
                    onClick={() => setSelectedSector(sector)}
                    className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedSector === sector
                        ? "bg-[#00fc40] text-black"
                        : "bg-white/5 text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80"
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-8 h-8 text-[#00fc40] animate-spin mb-4" />
                <p className="text-white/40 text-sm">Finding creators...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-24">
                <p className="text-red-400">
                  Failed to load creators. Please try again.
                </p>
              </div>
            ) : filteredCreators && filteredCreators.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filteredCreators.map((creator, idx) => (
                  <CreatorCard key={creator.id} creator={creator} index={idx} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-5 h-5 text-white/30" />
                </div>
                <h3 className="text-lg font-bold mb-2">No creators found</h3>
                <p className="text-white/40 text-sm">
                  Try adjusting your search terms or sector.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
