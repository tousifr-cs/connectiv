import { useState, useRef } from "react";
import { Link } from "wouter";
import { useCreators } from "@/hooks/use-creators";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Creator } from "@shared/schema";
import {
  Search,
  Loader2,
  Compass,
  Users,
  Eye,
  MessageCircle,
  Bell,
  Mail,
  Star,
  ChevronDown,
  SlidersHorizontal,
  Menu,
  Filter,
  BadgeCheck,
} from "lucide-react";

// ─── Mock data ───────────────────────────────────────────────────────────────

const SNEAK_PEEKS = [
  {
    id: 1,
    type: "SNIPPET",
    title: "Optimizing Node.js clusters",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=500&fit=crop",
    badgeClass: "bg-white/20",
  },
  {
    id: 2,
    type: "PREVIEW",
    title: "Design Critique Vol. 4",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=500&fit=crop",
    badgeClass: "bg-sky-600/90",
  },
  {
    id: 3,
    type: "SNIPPET",
    title: "Motion Design Basics",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=500&fit=crop",
    badgeClass: "bg-white/20",
  },
  {
    id: 4,
    type: "PUBLIC CALL",
    title: "Scaling React Apps",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=500&fit=crop",
    badgeClass: "bg-purple-600/90",
  },
  {
    id: 5,
    type: "SNIPPET",
    title: "Advanced Auth Flows",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=500&fit=crop",
    badgeClass: "bg-white/20",
  },
];

const CATEGORY_FILTERS = ["UI Design", "Marketing", "Frontend", "Strategy"];

const SIDEBAR_NAV = [
  { name: "Discover", icon: Compass, href: "/creators" },
  { name: "Network", icon: Users, href: "#" },
  { name: "Sneak-peeks", icon: Eye, href: "#" },
  { name: "Messages", icon: MessageCircle, href: "#" },
];

const HERO_SECTORS = [
  "All Markets",
  "Technology",
  "Design",
  "AI & ML",
  "Web3",
  "Marketing",
];

const SHOWCASE_CREATORS = [
  {
    name: "Alex Rivers",
    role: "Visual Engineer",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    response: 98,
    links: "4.2k",
    avgProj: "$2.5k",
    tags: ["AR/3D"],
  },
  {
    name: "Elena Chen",
    role: "AI Researcher",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    response: 100,
    links: "12k",
    avgProj: "$5.0k",
    tags: ["PYTORCH", "ML"],
  },
  {
    name: "Marcus Thorne",
    role: "Growth Strategist",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    response: 85,
    links: "850",
    avgProj: "$1.2k",
    rating: 4.9,
  },
];

const FEATURED_SHOWCASE = {
  name: "Sarah Jenkins",
  role: "Full-Stack Architect",
  avatar:
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=face",
  image:
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=800&fit=crop",
  bio: "Specializing in high-scale infrastructure and elegant UI solutions. Sarah has helped 50+ startups scale their engineering culture.",
};

const VERIFIED_SHOWCASE = {
  name: "Leon Vance",
  role: "UI/UX Designer",
  avatar:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  response: 92,
  links: "3.1k",
  avgProj: "$3.2k",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RATINGS = [4.9, 5.0, 4.8, 4.7, 4.9, 4.6, 4.8, 5.0];

function getRating(id: number): string {
  return (RATINGS[id % RATINGS.length] ?? 4.8).toFixed(1);
}

function getSessionCount(id: number): number {
  return 40 + ((id * 37 + 13) % 200);
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function SidebarContents({ activePath }: { activePath: string }) {
  return (
    <>
      <div className="px-5 pt-6 pb-4">
        <Link href="/">
          <span className="text-lg font-bold text-white tracking-tight cursor-pointer">
            ProConnectiv
          </span>
        </Link>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30 mt-0.5">
          Professional Discovery
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {SIDEBAR_NAV.map((item) => {
          const isActive = activePath === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-white/[0.08] text-white border-l-2 border-white/40 -ml-px"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                }`}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 m-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <p className="text-xs text-white/50 leading-relaxed mb-3">
          Get unlimited access to top creators.
        </p>
        <button className="w-full py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white/70 text-xs font-bold uppercase tracking-wider hover:bg-white/[0.1] transition-colors">
          Upgrade to Pro
        </button>
      </div>
    </>
  );
}

// ─── Wave pattern for showcase cards ─────────────────────────────────────────

function WavePattern({ variant = 0 }: { variant?: number }) {
  const v = variant * 15;
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 400 160"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d={`M0 ${100 + (v % 20)} Q100 ${60 + (v % 15)} 200 ${100 + (v % 20)} T400 ${100 + (v % 20)}`}
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="1.5"
      />
      <path
        d={`M0 ${80 + (v % 18)} Q120 ${45 + (v % 12)} 240 ${80 + (v % 18)} T400 ${80 + (v % 18)}`}
        stroke="rgba(255,255,255,0.035)"
        strokeWidth="1"
      />
      <path
        d={`M0 ${60 + (v % 16)} Q140 ${30 + (v % 10)} 280 ${60 + (v % 16)} T400 ${60 + (v % 16)}`}
        stroke="rgba(255,255,255,0.025)"
        strokeWidth="1"
      />
      <path
        d={`M0 ${120 + (v % 14)} Q80 ${90 + (v % 12)} 160 ${120 + (v % 14)} T400 ${120 + (v % 14)}`}
        stroke="rgba(255,255,255,0.02)"
        strokeWidth="1"
      />
    </svg>
  );
}

// ─── Creator card ────────────────────────────────────────────────────────────

function CreatorCard({ creator }: { creator: Creator }) {
  const rating = getRating(creator.id);
  const sessions = getSessionCount(creator.id);

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-colors flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={creator.imageUrl}
          alt={creator.displayName}
          className="w-12 h-12 rounded-full object-cover border border-white/10 shrink-0"
        />
        <div className="flex items-center gap-3 ml-auto shrink-0">
          <div className="flex items-center gap-0.5">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold">{rating}</span>
          </div>
          <span className="text-[11px] text-white/35 font-medium">
            {sessions}+ SESSIONS
          </span>
        </div>
      </div>

      <h3 className="text-base font-bold mb-0.5">{creator.displayName}</h3>
      <p className="text-xs text-white/45 mb-2">
        {creator.headline || creator.socialHandle}
      </p>
      <p className="text-xs text-white/35 leading-relaxed line-clamp-2 mb-4 flex-1">
        {creator.bio}
      </p>

      <div className="flex gap-2.5">
        <Link href={`/creator/${creator.id}`} className="flex-1">
          <button className="w-full py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs font-semibold text-white/70 hover:text-white hover:border-white/15 transition-colors">
            View Profile
          </button>
        </Link>
        <Link href={`/creator/${creator.id}`} className="flex-1">
          <button className="w-full py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs font-semibold text-white/70 hover:bg-white/[0.1] transition-colors">
            Book Now
          </button>
        </Link>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function Creators() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState("All Markets");
  const [visibleCount, setVisibleCount] = useState(5);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { data: creators, isLoading } = useCreators(search);
  const sneakPeeksRef = useRef<HTMLDivElement>(null);

  const initial =
    user?.displayName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  const filteredCreators = creators?.filter((creator) => {
    if (!selectedCategory) return true;
    const cat = selectedCategory.toLowerCase();
    return (
      creator.bio.toLowerCase().includes(cat) ||
      creator.displayName.toLowerCase().includes(cat) ||
      (creator.categories || "").toLowerCase().includes(cat)
    );
  });

  const visibleCreators = filteredCreators?.slice(0, visibleCount) || [];
  const hasMore = (filteredCreators?.length || 0) > visibleCount;

  return (
    <div className="h-screen bg-[#080a0f] text-white flex overflow-hidden">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-[220px] flex-col border-r border-white/[0.06] bg-[#0a0c11] shrink-0">
        <SidebarContents activePath="/creators" />
      </aside>

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-14 border-b border-white/[0.06] bg-[#080a0f]/90 backdrop-blur-xl flex items-center px-4 lg:px-6 gap-4 shrink-0">
          {/* Mobile sidebar trigger */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden p-2 -ml-2 text-white/60 hover:text-white">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[260px] bg-[#0a0c11] border-r border-white/[0.06] p-0 flex flex-col"
            >
              <SidebarContents activePath="/creators" />
            </SheetContent>
          </Sheet>

          {/* Brand (mobile fallback) */}
          <Link href="/" className="lg:hidden shrink-0">
            <span className="font-bold text-white text-sm">
              ProConnectiv
            </span>
          </Link>

          {/* Global search */}
          <div className="hidden sm:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                type="text"
                placeholder="Search creators, skills, or sessions..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-5 ml-auto">
            <Link
              href="/creators"
              className="hidden md:block text-sm text-white/50 hover:text-white transition-colors"
            >
              Browse
            </Link>
            <Link
              href="#"
              className="hidden md:block text-sm text-white/50 hover:text-white transition-colors"
            >
              Pricing
            </Link>

            <div className="flex items-center gap-2.5">
              <button className="relative p-1.5 text-white/40 hover:text-white/70 transition-colors">
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-white/50 rounded-full" />
              </button>
              <button className="p-1.5 text-white/40 hover:text-white/70 transition-colors">
                <Mail className="w-[18px] h-[18px]" />
              </button>
              {user ? (
                <Link href="/profile">
                  <div className="w-8 h-8 rounded-full bg-white/[0.08] border-2 border-white/20 flex items-center justify-center cursor-pointer">
                    <span className="text-xs font-bold text-white">
                      {initial}
                    </span>
                  </div>
                </Link>
              ) : (
                <Link href="/auth">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center cursor-pointer">
                    <span className="text-xs text-white/50">?</span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* ── Scrollable content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1100px] px-4 lg:px-8 py-6 lg:py-8 space-y-10">
            {/* ════ HERO ════ */}
            <section>
              <div className="flex items-start justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
                    Find a Creator
                  </h1>
                  <p className="text-base text-white/50 max-w-lg leading-relaxed">
                    Connect with high-performance digital architects and visual
                    engineers for your next project.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-sm text-white/40 shrink-0 mt-2">
                  <Filter className="w-4 h-4" />
                  <span>
                    Showing{" "}
                    <span className="text-white/70 font-medium">
                      {creators?.length
                        ? `${creators.length.toLocaleString()} available`
                        : "..."}
                    </span>{" "}
                    creators
                  </span>
                </div>
              </div>

              {/* Search bar */}
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-2 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
                  <input
                    type="text"
                    placeholder="Search by name, niche, or expertise..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-transparent text-base text-white placeholder:text-white/30 focus:outline-none"
                  />
                </div>
                <div className="hidden md:flex items-center gap-1 px-4 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/50 cursor-pointer hover:border-white/15 transition-colors">
                  Location
                  <ChevronDown className="w-3.5 h-3.5 ml-1 text-white/30" />
                </div>
                <button className="h-12 px-6 rounded-xl bg-white/[0.08] border border-white/[0.1] text-sm font-bold text-white hover:bg-white/[0.12] transition-colors whitespace-nowrap shrink-0">
                  Search Hub
                </button>
              </div>

              {/* Sector pills */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {HERO_SECTORS.map((sector) => (
                  <button
                    key={sector}
                    onClick={() => setSelectedSector(sector)}
                    className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedSector === sector
                        ? "bg-white/[0.12] text-white border border-white/[0.15]"
                        : "bg-white/[0.04] text-white/50 border border-white/[0.08] hover:text-white/70 hover:border-white/15"
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </section>

            {/* ════ SHOWCASE CREATORS ════ */}
            <section>
              {/* Top row: 3 showcase cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                {SHOWCASE_CREATORS.map((c, idx) => (
                  <div
                    key={c.name}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-colors cursor-pointer"
                  >
                    {/* Wave header with avatar + info */}
                    <div className="h-[160px] bg-[#111318] relative">
                      <WavePattern variant={idx} />
                      <div className="absolute bottom-4 left-4 flex items-center gap-3">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white/10"
                        />
                        <div>
                          <h3 className="text-base font-bold text-white">
                            {c.name}
                          </h3>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                            {c.role}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats + actions */}
                    <div className="px-4 pt-5 pb-4">
                      <div className="grid grid-cols-3 mb-5">
                        <div className="text-center">
                          <p className="text-[10px] text-white/35 mb-0.5">
                            Response
                          </p>
                          <p className="text-sm font-bold">{c.response}%</p>
                        </div>
                        <div className="text-center border-x border-white/[0.06]">
                          <p className="text-[10px] text-white/35 mb-0.5">
                            Links
                          </p>
                          <p className="text-sm font-bold">{c.links}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-white/35 mb-0.5">
                            Avg Proj
                          </p>
                          <p className="text-sm font-bold">{c.avgProj}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-1.5">
                          {c.tags?.map((t) => (
                            <span
                              key={t}
                              className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] font-medium text-white/50"
                            >
                              {t}
                            </span>
                          ))}
                          {c.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold">
                                {c.rating}
                              </span>
                            </div>
                          )}
                        </div>
                        <button className="px-5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-white/70 hover:text-white hover:border-white/15 transition-colors">
                          Connect Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom row: featured + verified */}
              <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5">
                {/* Featured showcase */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-colors">
                  <div className="flex flex-col sm:flex-row h-full">
                    <div className="sm:w-[38%] shrink-0">
                      <img
                        src={FEATURED_SHOWCASE.image}
                        alt={FEATURED_SHOWCASE.name}
                        className="w-full h-[220px] sm:h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={FEATURED_SHOWCASE.avatar}
                          alt={FEATURED_SHOWCASE.name}
                          className="w-12 h-12 rounded-full object-cover border border-white/10"
                        />
                        <div>
                          <h3 className="text-lg font-bold">
                            {FEATURED_SHOWCASE.name}
                          </h3>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                            {FEATURED_SHOWCASE.role}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-white/40 leading-relaxed mb-5">
                        {FEATURED_SHOWCASE.bio}
                      </p>
                      <div className="flex gap-3">
                        <button className="px-5 py-2.5 rounded-lg bg-white/[0.08] border border-white/[0.1] text-xs font-bold text-white hover:bg-white/[0.12] transition-colors">
                          Request Consultation
                        </button>
                        <button className="px-5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-white/70 hover:text-white hover:border-white/15 transition-colors">
                          View Portfolio
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verified showcase */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-colors cursor-pointer">
                  <div className="h-[160px] bg-[#111318] relative">
                    <WavePattern variant={4} />
                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                      <img
                        src={VERIFIED_SHOWCASE.avatar}
                        alt={VERIFIED_SHOWCASE.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white/10"
                      />
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {VERIFIED_SHOWCASE.name}
                        </h3>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                          {VERIFIED_SHOWCASE.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pt-5 pb-4">
                    <div className="grid grid-cols-3 mb-5">
                      <div className="text-center">
                        <p className="text-[10px] text-white/35 mb-0.5">
                          Response
                        </p>
                        <p className="text-sm font-bold">
                          {VERIFIED_SHOWCASE.response}%
                        </p>
                      </div>
                      <div className="text-center border-x border-white/[0.06]">
                        <p className="text-[10px] text-white/35 mb-0.5">
                          Links
                        </p>
                        <p className="text-sm font-bold">
                          {VERIFIED_SHOWCASE.links}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-white/35 mb-0.5">
                          Avg Proj
                        </p>
                        <p className="text-sm font-bold">
                          {VERIFIED_SHOWCASE.avgProj}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-white/60">
                        <BadgeCheck className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          Verified Pro
                        </span>
                      </div>
                      <button className="px-5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-white/70 hover:text-white hover:border-white/15 transition-colors">
                        Connect Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ════ SEARCH + FILTERS ════ */}
            <section>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                  <input
                    type="text"
                    placeholder="Find creators by specialty, name or location..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  {CATEGORY_FILTERS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === cat ? null : cat
                        )
                      }
                      className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                        selectedCategory === cat
                          ? "bg-white/[0.12] text-white border border-white/[0.15]"
                          : "bg-white/[0.06] text-white/50 hover:text-white/70 border border-white/[0.08] hover:border-white/15"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <button className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60 transition-colors shrink-0">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </section>

            {/* ════ SNEAK-PEEKS ════ */}
            <section>
              <h2 className="text-lg font-bold mb-4">Sneak-peeks</h2>
              <div
                ref={sneakPeeksRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
              >
                {SNEAK_PEEKS.map((peek) => (
                  <div
                    key={peek.id}
                    className="shrink-0 w-[175px] h-[220px] rounded-xl overflow-hidden relative group cursor-pointer"
                  >
                    <img
                      src={peek.image}
                      alt={peek.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white ${peek.badgeClass} mb-1.5`}
                      >
                        {peek.type}
                      </span>
                      <p className="text-xs font-medium text-white/90 leading-tight">
                        {peek.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ════ TOP CREATORS ════ */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold">Top Creators</h2>
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <span>Sort by:</span>
                  <button className="flex items-center gap-1 text-white/70 hover:text-white font-medium transition-colors">
                    Most Relevant <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-7 h-7 text-white/50 animate-spin mb-3" />
                  <p className="text-white/40 text-sm">Finding creators...</p>
                </div>
              ) : !filteredCreators?.length ? (
                <div className="text-center py-20">
                  <div className="w-12 h-12 bg-white/[0.04] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-5 h-5 text-white/25" />
                  </div>
                  <h3 className="text-base font-bold mb-1">
                    No creators found
                  </h3>
                  <p className="text-white/40 text-sm">
                    Try adjusting your search or filters.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visibleCreators.map((creator) => (
                    <CreatorCard key={creator.id} creator={creator} />
                  ))}
                </div>
              )}

              {/* Load more */}
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setVisibleCount((c) => c + 5)}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-white/60 hover:text-white hover:border-white/15 transition-colors"
                  >
                    Load More Creators <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
