import { Link } from "wouter";
import { type Creator } from "@shared/schema";
import { BadgeCheck, Twitter, Linkedin, Instagram, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface CreatorCardProps {
  creator: Creator;
  index: number;
}

export function CreatorCard({ creator, index }: CreatorCardProps) {
  const PlatformIcon = {
    twitter: Twitter,
    linkedin: Linkedin,
    instagram: Instagram,
  }[creator.socialPlatform] || Twitter;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link href={`/creator/${creator.id}`}>
        <Card className="group relative h-full glass-card overflow-hidden hover:border-primary/50 transition-colors duration-300 cursor-pointer">
          
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="p-6 flex flex-col h-full relative z-10">
            
            {/* Header: Avatar & Badge */}
            <div className="flex justify-between items-start mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-primary transition-colors duration-300">
                  <img 
                    src={creator.imageUrl} 
                    alt={creator.displayName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {creator.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-black rounded-full p-0.5">
                    <BadgeCheck className="w-5 h-5 text-primary fill-black" />
                  </div>
                )}
              </div>
              <Badge variant="outline" className="bg-white/5 border-white/10 text-white/80 hover:bg-white/10 transition-colors">
                <PlatformIcon className="w-3 h-3 mr-1.5" />
                {creator.socialHandle}
              </Badge>
            </div>

            {/* Content */}
            <div className="mb-6 flex-grow">
              <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors duration-200 truncate">
                {creator.displayName}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                {creator.bio}
              </p>
            </div>

            {/* Footer: Price & Action */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Starting at</span>
                <span className="text-lg font-bold text-white">${creator.price}</span>
              </div>
              <Button size="icon" className="rounded-full bg-white/10 hover:bg-primary hover:text-black transition-all duration-300 group-hover:scale-110">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
