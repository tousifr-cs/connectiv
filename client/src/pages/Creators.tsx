import { useState, useMemo, memo, useEffect } from "react";
import { Link } from "wouter";
import { useCreators } from "@/hooks/use-creators";
import { useDebounce } from "@/hooks/use-debounce";
import { Navbar } from "@/components/Navbar";
import { ProConnectivLogo } from "@/components/ProConnectivLogo";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Creator } from "@shared/schema";
import {
  Search,
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const CATEGORIES = ["All", "Design", "Marketing", "Tech", "Finance"] as const;
const ITEMS_PER_PAGE = 3;
const RATINGS_MAP = [4.9, 5.0, 4.8, 4.7, 4.9, 4.6, 4.8, 5.0];

function getCreatorRating(id: number): number {
  return RATINGS_MAP[id % RATINGS_MAP.length] ?? 4.8;
}

function getReviewCount(id: number): number {
  return 20 + ((id * 37 + 13) % 140);
}

function getCreatorBadge(creator: Creator): string | null {
  if (creator.isVerified) return "TOP RATED";
  if (creator.featured) return "RISING STAR";
  return null;
}

function getCreatorTitle(creator: Creator): string {
  if (creator.headline) return creator.headline.toUpperCase();
  const platform = creator.socialPlatform.charAt(0).toUpperCase() + creator.socialPlatform.slice(1);
  return `${creator.socialHandle} @ ${platform}`.toUpperCase();
}

function StarRating({
  rating,
  interactive = false,
  size = "sm",
  onSelect,
}: {
  rating: number;
  interactive?: boolean;
  size?: "sm" | "md";
  onSelect?: (r: number) => void;
}) {
  const dim = size === "md" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => onSelect?.(s)}
          className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
        >
          <Star
            className={`${dim} ${
              s <= Math.round(rating)
                ? "fill-primary text-primary"
                : "fill-transparent text-white/20"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

const ExpertCard = memo(function ExpertCard({ creator }: { creator: Creator }) {
  const rating = getCreatorRating(creator.id);
  const reviews = getReviewCount(creator.id);
  const badge = getCreatorBadge(creator);
  const title = getCreatorTitle(creator);

  return (
    <div className="group flex flex-col sm:flex-row gap-5 sm:gap-6 bg-[#111111] border border-white/[0.08] rounded-2xl p-4 sm:p-6 hover:border-primary/20 transition-all duration-300">
      <div className="relative shrink-0 self-center sm:self-start">
        <img
          src={creator.imageUrl}
          alt={creator.displayName}
          className="w-full sm:w-[140px] h-[200px] sm:h-[160px] rounded-xl object-cover"
        />
        {badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-primary text-black text-[10px] font-bold tracking-wider">
            {badge}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-1">
          <Link href={`/creator/${creator.id}`}>
            <h3 className="text-lg sm:text-xl font-extrabold tracking-[0.04em] uppercase hover:text-primary transition-colors cursor-pointer">
              {creator.displayName}
            </h3>
          </Link>
          <span className="text-lg sm:text-xl font-bold text-primary shrink-0">
            ${creator.price}/hr
          </span>
        </div>

        <p className="text-[11px] font-semibold tracking-[0.08em] text-white/40 uppercase mb-3">
          {title}
        </p>

        <p className="text-sm text-white/50 leading-relaxed line-clamp-2 mb-auto">
          {creator.bio}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-3">
            <StarRating rating={rating} />
            <span className="text-[11px] font-semibold tracking-[0.08em] text-white/40 uppercase">
              {reviews} Reviews
            </span>
          </div>

          <Link href={`/creator/${creator.id}`}>
            <button className="px-5 py-2 rounded-lg border-2 border-primary text-primary text-sm font-bold hover:bg-primary hover:text-black transition-colors duration-200">
              Book Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
});

function FilterPanel({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  thisWeek,
  onThisWeekChange,
  weekendsOnly,
  onWeekendsOnlyChange,
  minRating,
  onMinRatingChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  selectedCategory: string;
  onCategoryChange: (v: string) => void;
  priceRange: number[];
  onPriceRangeChange: (v: number[]) => void;
  thisWeek: boolean;
  onThisWeekChange: (v: boolean) => void;
  weekendsOnly: boolean;
  onWeekendsOnlyChange: (v: boolean) => void;
  minRating: number;
  onMinRatingChange: (v: number) => void;
}) {
  return (
    <div className="space-y-7">
      <h3 className="text-xs font-bold tracking-[0.15em] text-primary uppercase">
        Filters
      </h3>

      <div>
        <label className="text-sm font-semibold text-white/80 mb-2.5 block">
          Keyword
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-white/80 mb-3 block">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-primary text-black"
                  : "bg-white/[0.06] text-white/50 border border-white/[0.1] hover:text-white/70 hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-white/80 mb-4 block">
          Price Range
        </label>
        <Slider
          value={priceRange}
          onValueChange={onPriceRangeChange}
          min={0}
          max={500}
          step={10}
          className="mb-3"
        />
        <div className="flex justify-between text-xs text-white/35 font-medium">
          <span>$0</span>
          <span>{priceRange[0] >= 500 ? "$500+" : `$${priceRange[0]}`}</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-white/80 mb-3 block">
          Availability
        </label>
        <div className="space-y-3">
          <label className="flex items-center gap-2.5 cursor-pointer group/check">
            <Checkbox
              checked={thisWeek}
              onCheckedChange={(v) => onThisWeekChange(!!v)}
              className="border-white/20 data-[state=checked]:border-primary"
            />
            <span className="text-sm text-white/50 group-hover/check:text-white/70 transition-colors">
              This week
            </span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer group/check">
            <Checkbox
              checked={weekendsOnly}
              onCheckedChange={(v) => onWeekendsOnlyChange(!!v)}
              className="border-white/20 data-[state=checked]:border-primary"
            />
            <span className="text-sm text-white/50 group-hover/check:text-white/70 transition-colors">
              Weekends only
            </span>
          </label>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-white/80 mb-3 block">
          Min. Rating
        </label>
        <StarRating
          rating={minRating}
          size="md"
          interactive
          onSelect={(r) => onMinRatingChange(r === minRating ? 0 : r)}
        />
      </div>
    </div>
  );
}

export default function Creators() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([500]);
  const [thisWeek, setThisWeek] = useState(false);
  const [weekendsOnly, setWeekendsOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: creators, isLoading } = useCreators(debouncedSearch);

  const filteredCreators = useMemo(() => {
    if (!creators) return [];
    return creators.filter((c) => {
      if (selectedCategory !== "All") {
        const cat = selectedCategory.toLowerCase();
        const inCategories = (c.categories || "").toLowerCase().includes(cat);
        const inBio = c.bio.toLowerCase().includes(cat);
        const inName = c.displayName.toLowerCase().includes(cat);
        if (!inCategories && !inBio && !inName) return false;
      }
      if (priceRange[0] < 500 && c.price > priceRange[0]) return false;
      if (weekendsOnly && !c.availability?.toLowerCase().includes("weekend"))
        return false;
      if (minRating > 0 && Math.round(getCreatorRating(c.id)) < minRating)
        return false;
      return true;
    });
  }, [creators, selectedCategory, priceRange, weekendsOnly, minRating]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange, weekendsOnly, minRating, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredCreators.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCreators = filteredCreators.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const filterProps = {
    search,
    onSearchChange: setSearch,
    selectedCategory,
    onCategoryChange: setSelectedCategory,
    priceRange,
    onPriceRangeChange: setPriceRange,
    thisWeek,
    onThisWeekChange: setThisWeek,
    weekendsOnly,
    onWeekendsOnlyChange: setWeekendsOnly,
    minRating,
    onMinRatingChange: setMinRating,
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-10 sm:pt-14 pb-8 sm:pb-10">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black italic tracking-tight mb-3">
          FIND YOUR{" "}
          <span className="text-primary">EXPERT</span>
        </h1>
        <p className="text-sm sm:text-base text-white/45 max-w-lg leading-relaxed">
          Access curated insights from world-class professionals across design,
          technology, and business.
        </p>
      </section>

      {/* Main layout */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16 sm:pb-24">
        <div className="flex gap-8 lg:gap-10">
          {/* Desktop filter sidebar */}
          <aside className="hidden lg:block w-[220px] shrink-0">
            <div className="sticky top-[80px]">
              <FilterPanel {...filterProps} />
            </div>
          </aside>

          {/* Results column */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter trigger */}
            <div className="lg:hidden flex items-center gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <button className="h-10 w-10 rounded-lg bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white/50 hover:text-white transition-colors shrink-0">
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[280px] bg-[#0a0a0a] border-r border-white/[0.08] p-6"
                >
                  <FilterPanel {...filterProps} />
                </SheetContent>
              </Sheet>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-8 h-8 text-primary/60 animate-spin mb-3" />
                <p className="text-white/35 text-sm">Finding experts...</p>
              </div>
            ) : !filteredCreators.length ? (
              <div className="text-center py-24">
                <div className="w-14 h-14 bg-white/[0.04] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-white/15" />
                </div>
                <h3 className="text-lg font-bold mb-1.5">No experts found</h3>
                <p className="text-white/35 text-sm max-w-xs mx-auto">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 sm:space-y-5">
                  {paginatedCreators.map((creator) => (
                    <ExpertCard key={creator.id} creator={creator} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="flex items-center justify-center gap-2 mt-10 sm:mt-12">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safePage <= 1}
                      className="w-10 h-10 rounded-full border border-white/[0.1] flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-full text-sm font-semibold transition-colors duration-200 ${
                            page === safePage
                              ? "bg-primary text-black"
                              : "border border-white/[0.1] text-white/40 hover:text-white hover:border-white/25"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage >= totalPages}
                      className="w-10 h-10 rounded-full border border-white/[0.1] flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Become a Creator Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16 sm:pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111]">
          {/* Background accent glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-12 p-8 sm:p-10 lg:p-14">
            {/* Left — Text content */}
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-[0.15em] uppercase mb-5">
                Now Accepting Applications
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black italic tracking-tight mb-4">
                BECOME A{" "}
                <span className="text-primary">CREATOR</span>
              </h2>
              <p className="text-sm sm:text-base text-white/45 max-w-md leading-relaxed mx-auto lg:mx-0 mb-8">
                Turn your expertise into income. Set your own rates, build your
                audience, and connect with clients who value what you know.
              </p>

              {/* Stats row */}
              <div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-10 mb-8">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-extrabold text-white">$120</p>
                    <p className="text-[10px] text-white/35 tracking-wider uppercase font-medium">Avg / Hour</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-white/[0.08]" />
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-extrabold text-white">2,400+</p>
                    <p className="text-[10px] text-white/35 tracking-wider uppercase font-medium">Active Clients</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-white/[0.08] hidden sm:block" />
                <div className="hidden sm:flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-extrabold text-white">4.9</p>
                    <p className="text-[10px] text-white/35 tracking-wider uppercase font-medium">Avg Rating</p>
                  </div>
                </div>
              </div>

              <Link href="/become-creator">
                <button className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-primary text-black text-sm font-bold tracking-wide hover:brightness-110 transition-all duration-200">
                  Start Your Profile
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </div>

            {/* Right — Decorative visual */}
            <div className="hidden lg:flex flex-col items-center gap-4 shrink-0 w-[260px]">
              {/* Stacked avatar mosaic */}
              <div className="relative w-[220px] h-[180px]">
                <div className="absolute top-0 left-0 w-24 h-24 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/10">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                </div>
                <div className="absolute top-6 left-20 w-28 h-28 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary/40" />
                </div>
                <div className="absolute bottom-0 left-8 w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/[0.06]">
                  <Star className="w-8 h-8 fill-current" />
                </div>
              </div>
              <p className="text-[10px] font-semibold tracking-[0.15em] text-white/20 uppercase text-center">
                Join 500+ Experts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#060606]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10">
            <div className="col-span-2 sm:col-span-1">
              <Link href="/">
                <ProConnectivLogo size="sm" />
              </Link>
              <p className="text-[11px] text-white/25 mt-2 leading-relaxed uppercase tracking-wider max-w-[200px]">
                Empowering the next generation of builders through high-access
                knowledge.
              </p>
            </div>

            <div>
              <h4 className="text-[11px] font-bold tracking-[0.15em] text-primary uppercase mb-4">
                Explore
              </h4>
              <div className="flex flex-col gap-2">
                <Link href="/creators" className="text-sm text-white/40 hover:text-white transition-colors">
                  Browse Experts
                </Link>
                <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">
                  Gift Cards
                </Link>
                <Link href="/become-creator" className="text-sm text-white/40 hover:text-white transition-colors">
                  Apply to Expert
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold tracking-[0.15em] text-primary uppercase mb-4">
                Legal
              </h4>
              <div className="flex flex-col gap-2">
                <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold tracking-[0.15em] text-primary uppercase mb-4">
                Newsletter
              </h4>
              <input
                type="email"
                placeholder="Email address"
                className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div className="mt-10 pt-5 border-t border-white/[0.05]">
            <p className="text-[11px] text-white/15 tracking-wide">
              &copy; {new Date().getFullYear()} ProConnectiv. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
