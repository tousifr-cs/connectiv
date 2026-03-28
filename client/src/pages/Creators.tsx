import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useCreators } from "@/hooks/use-creators";
import { useAuth } from "@/hooks/use-auth";
import type { Creator } from "@shared/schema";
import {
  Search,
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const CATEGORIES = ["All", "Design", "Marketing", "Tech", "AI", "Business"];
const ITEMS_PER_PAGE = 5;

function getBadge(creator: Creator): string | null {
  if (creator.featured) return "TOP RATED";
  if (creator.isVerified) return "VERIFIED";
  if ((creator.totalSessions ?? 0) < 30) return "RISING STAR";
  return null;
}

function getReviewCount(id: number): number {
  return 20 + ((id * 47 + 11) % 130);
}

function getRating(id: number): number {
  const ratings = [4.9, 5.0, 4.8, 4.7, 4.9, 4.6, 4.8, 5.0];
  return ratings[id % ratings.length] ?? 4.8;
}

function StarRating({
  rating,
  interactive = false,
  onSelect,
}: {
  rating: number;
  interactive?: boolean;
  onSelect?: (val: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating
              ? "fill-[#00fc40] text-[#00fc40]"
              : "fill-white/10 text-white/20"
          } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
          onClick={() => interactive && onSelect?.(i)}
        />
      ))}
    </div>
  );
}

function ExpertCard({ creator }: { creator: Creator }) {
  const badge = getBadge(creator);
  const reviews = getReviewCount(creator.id);
  const rating = getRating(creator.id);
  const pricePerHour = creator.videoCallPrice ?? creator.price;

  return (
    <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-5 sm:p-6 hover:border-[#00fc40]/30 transition-all duration-300 group">
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
        {/* Avatar */}
        <div className="relative w-[140px] h-[160px] sm:w-[160px] sm:h-[180px] rounded-xl overflow-hidden shrink-0 self-center sm:self-start">
          <img
            src={creator.imageUrl}
            alt={creator.displayName}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          />
          {badge && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider bg-[#00fc40] text-black">
              {badge}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-1">
            <h3 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide text-white group-hover:text-[#00fc40] transition-colors">
              {creator.displayName}
            </h3>
            <span className="text-lg sm:text-xl font-bold text-[#00fc40] shrink-0">
              ${pricePerHour}/hr
            </span>
          </div>

          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white/50 mb-3">
            {creator.headline || creator.socialHandle}
            {creator.categories && (
              <span className="text-white/30">
                {" "}
                @ {creator.categories.split(",")[0]?.trim()}
              </span>
            )}
          </p>

          <p className="text-sm text-white/45 leading-relaxed line-clamp-2 mb-4">
            {creator.bio}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <StarRating rating={Math.round(rating)} />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                {reviews} Reviews
              </span>
            </div>

            <Link href={`/creator/${creator.id}`}>
              <button className="px-6 py-2.5 rounded-lg border-2 border-[#00fc40] text-[#00fc40] text-sm font-bold hover:bg-[#00fc40] hover:text-black transition-all duration-200">
                Book Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSidebar({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  availThisWeek,
  setAvailThisWeek,
  availWeekends,
  setAvailWeekends,
  minRating,
  setMinRating,
}: {
  search: string;
  setSearch: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  priceRange: number;
  setPriceRange: (v: number) => void;
  availThisWeek: boolean;
  setAvailThisWeek: (v: boolean) => void;
  availWeekends: boolean;
  setAvailWeekends: (v: boolean) => void;
  minRating: number;
  setMinRating: (v: number) => void;
}) {
  return (
    <div className="space-y-7">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#00fc40] mb-4">
          Filters
        </h3>

        {/* Keyword */}
        <label className="block text-sm font-medium text-white/70 mb-2">
          Keyword
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-white/[0.04] border border-white/[0.1] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00fc40]/50 transition-colors"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-3">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-[#00fc40] text-black"
                  : "bg-white/[0.06] text-white/50 border border-white/[0.1] hover:text-white/70 hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-3">
          Price Range
        </label>
        <input
          type="range"
          min={0}
          max={500}
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#00fc40] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00fc40] [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <div className="flex items-center justify-between mt-2 text-xs text-white/40">
          <span>$0</span>
          <span className="text-white/70 font-semibold">${priceRange}+</span>
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-3">
          Availability
        </label>
        <div className="space-y-2.5">
          <label className="flex items-center gap-3 cursor-pointer group/check">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                availThisWeek
                  ? "bg-[#00fc40] border-[#00fc40]"
                  : "border-white/20 group-hover/check:border-white/40"
              }`}
              onClick={() => setAvailThisWeek(!availThisWeek)}
            >
              {availThisWeek && (
                <svg
                  className="w-3 h-3 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm text-white/60">This week</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group/check">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                availWeekends
                  ? "bg-[#00fc40] border-[#00fc40]"
                  : "border-white/20 group-hover/check:border-white/40"
              }`}
              onClick={() => setAvailWeekends(!availWeekends)}
            >
              {availWeekends && (
                <svg
                  className="w-3 h-3 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm text-white/60">Weekends only</span>
          </label>
        </div>
      </div>

      {/* Min Rating */}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-3">
          Min. Rating
        </label>
        <StarRating rating={minRating} interactive onSelect={setMinRating} />
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const maxVisible = 3;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-full border border-white/[0.1] flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
            currentPage === page
              ? "bg-[#00fc40] text-black"
              : "border border-white/[0.1] text-white/50 hover:text-white hover:border-white/30"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-full border border-white/[0.1] flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#080808] mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/">
              <span className="text-xl font-extrabold text-white tracking-tight cursor-pointer">
                ProConnectiv
              </span>
            </Link>
            <p className="text-xs text-white/35 leading-relaxed mt-3 max-w-[200px] uppercase tracking-wide">
              Empowering the next generation of builders through high-access
              knowledge.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#00fc40] mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/creators"
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  Browse Experts
                </Link>
              </li>
              <li>
                <Link
                  href="/become-creator"
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  Apply to Expert
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#00fc40] mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-sm text-white/50 cursor-pointer hover:text-white transition-colors">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-sm text-white/50 cursor-pointer hover:text-white transition-colors">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#00fc40] mb-4">
              Newsletter
            </h4>
            <div className="relative">
              <input
                type="email"
                placeholder="Email address"
                className="w-full h-10 px-4 pr-10 rounded-lg bg-white/[0.04] border border-white/[0.1] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00fc40]/50 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.06] text-center">
          <p className="text-xs text-white/25 uppercase tracking-wider">
            &copy; {new Date().getFullYear()} ProConnectiv. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Creators() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState(500);
  const [availThisWeek, setAvailThisWeek] = useState(false);
  const [availWeekends, setAvailWeekends] = useState(false);
  const [minRating, setMinRating] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { user, signOut } = useAuth();
  const { data: creators, isLoading } = useCreators(search);

  const filteredCreators = useMemo(() => {
    if (!creators) return [];
    return creators.filter((creator) => {
      if (selectedCategory !== "All") {
        const cat = selectedCategory.toLowerCase();
        const matches =
          creator.bio.toLowerCase().includes(cat) ||
          creator.displayName.toLowerCase().includes(cat) ||
          (creator.categories || "").toLowerCase().includes(cat) ||
          (creator.headline || "").toLowerCase().includes(cat);
        if (!matches) return false;
      }
      const price = creator.videoCallPrice ?? creator.price;
      if (price > priceRange && priceRange < 500) return false;
      return true;
    });
  }, [creators, selectedCategory, priceRange]);

  const totalPages = Math.max(1, Math.ceil(filteredCreators.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCreators = filteredCreators.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <span className="text-lg font-extrabold text-white tracking-tight cursor-pointer">
                ProConnectiv
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/creators"
                className="text-sm font-semibold text-[#00fc40]"
              >
                Experts
              </Link>
              <span className="text-sm text-white/50 hover:text-white cursor-pointer transition-colors">
                Categories
              </span>
              <span className="text-sm text-white/50 hover:text-white cursor-pointer transition-colors">
                For Business
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  My Profile
                </Link>
                <button
                  onClick={signOut}
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link href="/auth">
                  <button className="px-5 py-2 rounded-lg bg-[#00fc40] text-black text-sm font-bold hover:bg-[#00fc40]/90 transition-colors">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Link href="/">
              <button className="p-2 text-white/60 hover:text-white">
                <Menu className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight italic">
          FIND YOUR{" "}
          <span className="text-[#00fc40]">EXPERT</span>
        </h1>
        <p className="text-sm sm:text-base text-white/50 mt-3 max-w-lg leading-relaxed">
          Access curated insights from world-class professionals across design,
          technology, and business.
        </p>
      </section>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="flex gap-8">
          {/* ── Filter sidebar (desktop) ── */}
          <aside className="hidden lg:block w-[240px] shrink-0">
            <div className="sticky top-24">
              <FilterSidebar
                search={search}
                setSearch={setSearch}
                selectedCategory={selectedCategory}
                setSelectedCategory={(v) => {
                  setSelectedCategory(v);
                  setCurrentPage(1);
                }}
                priceRange={priceRange}
                setPriceRange={(v) => {
                  setPriceRange(v);
                  setCurrentPage(1);
                }}
                availThisWeek={availThisWeek}
                setAvailThisWeek={setAvailThisWeek}
                availWeekends={availWeekends}
                setAvailWeekends={setAvailWeekends}
                minRating={minRating}
                setMinRating={setMinRating}
              />
            </div>
          </aside>

          {/* ── Mobile filter trigger ── */}
          <div className="lg:hidden fixed bottom-6 right-6 z-40">
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <button className="w-14 h-14 rounded-full bg-[#00fc40] text-black flex items-center justify-center shadow-lg shadow-[#00fc40]/20 hover:scale-105 transition-transform">
                  <Search className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[300px] bg-[#0a0a0a] border-r border-white/[0.08] p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">Filters</h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1 text-white/40 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterSidebar
                  search={search}
                  setSearch={setSearch}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={(v) => {
                    setSelectedCategory(v);
                    setCurrentPage(1);
                  }}
                  priceRange={priceRange}
                  setPriceRange={(v) => {
                    setPriceRange(v);
                    setCurrentPage(1);
                  }}
                  availThisWeek={availThisWeek}
                  setAvailThisWeek={setAvailThisWeek}
                  availWeekends={availWeekends}
                  setAvailWeekends={setAvailWeekends}
                  minRating={minRating}
                  setMinRating={setMinRating}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* ── Expert cards ── */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-8 h-8 text-[#00fc40] animate-spin mb-3" />
                <p className="text-white/40 text-sm">Finding experts...</p>
              </div>
            ) : !filteredCreators.length ? (
              <div className="text-center py-24">
                <div className="w-14 h-14 bg-white/[0.04] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-white/25" />
                </div>
                <h3 className="text-lg font-bold mb-1">No experts found</h3>
                <p className="text-white/40 text-sm">
                  Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedCreators.map((creator) => (
                    <ExpertCard key={creator.id} creator={creator} />
                  ))}
                </div>

                <Pagination
                  currentPage={safeCurrentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
