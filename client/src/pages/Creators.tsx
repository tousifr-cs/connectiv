import { useState } from "react";
import { useCreators } from "@/hooks/use-creators";
import { Navbar } from "@/components/Navbar";
import { CreatorCard } from "@/components/CreatorCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Creators() {
  const [search, setSearch] = useState("");
  const { data: creators, isLoading, isError } = useCreators(search);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      <Navbar />

      <main className="container mx-auto px-4 py-12 md:py-20">
        
        {/* Hero Header */}
        <div className="max-w-4xl mx-auto text-center mb-16 space-y-6">
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
            Book 1:1 sessions, code reviews, and career advice from verified experts in crypto, engineering, and design.
          </motion.p>
        </div>

        {/* Search & Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mb-16"
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
          ) : creators && creators.length > 0 ? (
            creators.map((creator, idx) => (
              <CreatorCard key={creator.id} creator={creator} index={idx} />
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No pros found</h3>
              <p className="text-muted-foreground">Try adjusting your search terms.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
