import { useState, useMemo } from "react";
import { useCreators } from "@/hooks/use-creators";
import { useDebounce } from "@/hooks/use-debounce";
import { Navbar } from "@/components/Navbar";
import { CreatorCard } from "@/components/CreatorCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Loader2, TrendingUp, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = ["All", "Tech", "Design", "Crypto", "Marketing", "Business"];
const TRENDING_TAGS = ["React", "DeFi", "UI/UX", "AI", "Solidity", "Growth"];

export default function Creators() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Bolt: Debounce search to avoid redundant API calls on every keystroke
  const debouncedSearch = useDebounce(search, 300);
  const { data: creators, isLoading, isError } = useCreators(debouncedSearch);

  // Bolt: Memoize filtered results to prevent expensive re-filtering on every render
  const filteredCreators = useMemo(() => {
    if (!creators) return [];
    const lowerCategory = selectedCategory.toLowerCase();
    return creators.filter(creator => {
      if (selectedCategory === "All") return true;
      return creator.bio.toLowerCase().includes(lowerCategory) ||
             creator.displayName.toLowerCase().includes(lowerCategory);
    });
  }, [creators, selectedCategory]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      <Navbar />

      <main className="container mx-auto px-4 py-12 md:py-20">
        
        {/* Hero Header */}
        <div className="max-w-4xl mx-auto text-center mb-12 space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight"
          >
            Connect with the world's <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 text-glow">
              top verified pros
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Book 1:1 sessions, code reviews, and career advice from verified experts.
          </motion.p>
        </div>

        {/* Trending Tags */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-8 flex flex-wrap items-center justify-center gap-3"
        >
          <div className="flex items-center gap-2 text-sm text-primary font-bold mr-2">
            <TrendingUp className="w-4 h-4" />
            <span>Trending:</span>
          </div>
          {TRENDING_TAGS.map((tag) => (
            <Badge 
              key={tag} 
              variant="outline" 
              className="bg-white/5 border-white/10 hover:border-primary/50 cursor-pointer transition-colors px-3 py-1"
              onClick={() => setSearch(tag)}
            >
              #{tag}
            </Badge>
          ))}
        </motion.div>

        {/* Search & Category Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto mb-16 space-y-6"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search by name, role, or company..." 
              className="h-14 pl-12 pr-14 rounded-2xl bg-white/5 border-white/10 text-lg focus:border-primary/50 focus:ring-primary/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button 
              size="icon"
              variant="ghost" 
              className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-white/10 hover:text-primary rounded-xl"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                className={`rounded-full px-6 ${
                  selectedCategory === cat 
                  ? "bg-primary text-black hover:bg-primary/90" 
                  : "bg-white/5 border-white/10 hover:border-primary/50 text-white"
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Finding pros...</p>
            </div>
          ) : isError ? (
            <div className="col-span-full text-center py-20">
              <p className="text-red-400">Failed to load creators. Please try again.</p>
            </div>
          ) : filteredCreators && filteredCreators.length > 0 ? (
            <>
              {filteredCreators.map((creator, idx) => (
                <CreatorCard key={creator.id} creator={creator} index={idx} />
              ))}
              <div className="col-span-full flex justify-center mt-12">
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 px-8 h-12 rounded-xl">
                  See More Creators
                </Button>
              </div>
            </>
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No pros found</h3>
              <p className="text-muted-foreground">Try adjusting your search terms or category.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
