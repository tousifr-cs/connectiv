import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        
        {/* Abstract Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8 hover:border-primary/50 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Now live with 500+ verified pros
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
            Learn from the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-emerald-400 to-green-600">
              Verified Best.
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Direct access to world-class experts in crypto, engineering, and design. 
            Book 1:1 sessions instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/creators">
              <Button size="lg" className="h-14 px-8 text-lg font-bold bg-primary text-black hover:bg-primary/90 rounded-full shadow-[0_0_30px_rgba(0,255,0,0.4)] hover:shadow-[0_0_50px_rgba(0,255,0,0.6)] transition-all scale-100 hover:scale-105">
                Explore Pros
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-white/20 text-white bg-transparent hover:bg-white/10 rounded-full">
              Become a Pro
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Grid */}
      <section className="py-20 border-t border-white/5 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShieldCheck className="w-10 h-10 text-primary" />}
              title="Verified Experts Only"
              description="Every pro on our platform is manually verified to ensure you learn from legitimate industry leaders."
            />
            <FeatureCard 
              icon={<Users className="w-10 h-10 text-primary" />}
              title="1:1 Direct Access"
              description="Skip the cold DMs. Book focused, high-impact sessions directly with the people you admire."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="w-10 h-10 text-primary" />}
              title="Satisfaction Guaranteed"
              description="If your session doesn't meet our quality standards, we offer a full refund. No questions asked."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all duration-300 group">
      <div className="mb-6 p-4 rounded-2xl bg-black inline-block group-hover:scale-110 transition-transform duration-300 border border-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
