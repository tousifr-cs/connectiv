import { useRoute } from "wouter";
import { useCreator } from "@/hooks/use-creators";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BadgeCheck, Calendar, Clock, Globe, Share2, Twitter, Linkedin, Instagram, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function CreatorProfile() {
  const [, params] = useRoute("/creator/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { data: creator, isLoading, isError } = useCreator(id);

  if (isLoading) return <ProfileSkeleton />;
  if (isError || !creator) return <ProfileNotFound />;

  const PlatformIcon = {
    twitter: Twitter,
    linkedin: Linkedin,
    instagram: Instagram,
  }[creator.socialPlatform] || Globe;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <Link href="/creators">
          <Button variant="ghost" className="mb-8 hover:text-primary pl-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Profile Info */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-white/5 shadow-2xl">
                  <img 
                    src={creator.imageUrl} 
                    alt={creator.displayName}
                    className="w-full h-full object-cover" 
                  />
                </div>
                {creator.isVerified && (
                  <div className="absolute -bottom-3 -right-3 bg-black rounded-full p-1 border-4 border-black">
                    <BadgeCheck className="w-8 h-8 text-primary fill-black" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4 pt-2">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2">{creator.displayName}</h1>
                  <a 
                    href={`https://${creator.socialPlatform}.com/${creator.socialHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    <PlatformIcon className="w-4 h-4 mr-2" />
                    @{creator.socialHandle}
                  </a>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-1">
                    Crypto
                  </Badge>
                  <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-1">
                    Engineering
                  </Badge>
                  <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-1">
                    Strategy
                  </Badge>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">About</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                  {creator.bio}
                </p>
              </div>
            </div>

            {/* Stats / Credentials Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-2xl font-bold text-white mb-1">500+</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Sessions</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-2xl font-bold text-white mb-1">4.9</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Rating</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-2xl font-bold text-white mb-1">100%</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Response</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-2xl font-bold text-white mb-1">24h</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Turnaround</div>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Card */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24">
              <Card className="glass-card border-white/10 overflow-hidden shadow-xl shadow-primary/5">
                <div className="h-2 w-full bg-gradient-to-r from-primary to-emerald-500" />
                <CardContent className="p-8 space-y-8">
                  
                  <div>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Book a Session
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 cursor-pointer transition-all duration-300">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-white group-hover:text-primary transition-colors">1:1 Consultation</span>
                          <Badge className="bg-primary/20 text-primary border-0">${creator.price}</Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground gap-4">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 30 mins</span>
                          <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Google Meet</span>
                        </div>
                      </div>

                      <div className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 cursor-pointer transition-all duration-300 opacity-70 hover:opacity-100">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-white group-hover:text-primary transition-colors">Priority Session</span>
                          <Badge className="bg-white/10 text-white border-0">${Math.floor(creator.price * 1.5)}</Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground gap-4">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 60 mins</span>
                          <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Google Meet</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full h-12 text-lg font-bold bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(0,255,0,0.3)] hover:shadow-[0_0_30px_rgba(0,255,0,0.5)] transition-all">
                      Book Now
                    </Button>
                    <div className="flex items-center justify-center text-xs text-muted-foreground gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      {creator.availability}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex justify-center">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white gap-2">
                      <Share2 className="w-4 h-4" /> Share Profile
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="container mx-auto max-w-6xl mt-20">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-40 h-40 rounded-3xl bg-white/5" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-12 w-3/4 bg-white/5" />
            <Skeleton className="h-6 w-1/3 bg-white/5" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-24 rounded-lg bg-white/5" />
              <Skeleton className="h-8 w-24 rounded-lg bg-white/5" />
            </div>
          </div>
        </div>
        <div className="mt-12 space-y-4">
          <Skeleton className="h-6 w-1/4 bg-white/5" />
          <Skeleton className="h-32 w-full bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Profile Not Found</h1>
      <Link href="/creators">
        <Button variant="outline" className="border-white/20 text-white">Back to Creators</Button>
      </Link>
    </div>
  );
}
