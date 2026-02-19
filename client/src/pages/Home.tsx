import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle2, ShieldCheck, Users, Globe, Twitter, Instagram, Linkedin, Facebook } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [profileUrl, setProfileUrl] = useState("");
  const [, setLocation] = useLocation();

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileUrl) {
      // In a real app, this would validate the URL and redirect to a request flow
      setLocation("/creators");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center pt-20 pb-32 overflow-hidden">
        {/* Abstract Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[1.1] text-white"
          >
            Connect with Anyone Through <br />
            <span className="text-primary">
              Verified Conversations
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Attach cryptocurrency to a social media profile and request a conversation. We verify profile ownership and arrange secure sessions.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto w-full space-y-4"
          >
            <form onSubmit={handleRequest} className="space-y-4">
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="twitter.com/username" 
                  className="h-14 pl-12 bg-black border-white/20 text-white rounded-xl focus:border-primary focus:ring-primary/20 transition-all text-lg"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  data-testid="input-profile-url"
                />
              </div>
              <Button 
                type="submit"
                size="lg" 
                className="w-full h-14 text-lg font-bold bg-primary text-black hover:bg-primary/90 rounded-xl shadow-[0_0_20px_rgba(0,255,0,0.2)] hover:shadow-[0_0_30px_rgba(0,255,0,0.4)] transition-all"
                data-testid="button-request-connection"
              >
                Request Connection
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
            <p className="text-sm text-gray-500">No charge today. Cancel anytime.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 flex items-center justify-center gap-4"
          >
            <span className="text-gray-400 text-sm font-medium">Join 1,200+ verified connections</span>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-black" />
              <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-black" />
              <div className="w-8 h-8 rounded-full bg-primary border-2 border-black" />
              <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-black" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="text-xl font-bold text-primary mb-4 block">ProConnect</Link>
              <p className="text-gray-500 text-sm max-w-xs">
                The world's first platform for paid, verified conversations with anyone on social media.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/creators" className="hover:text-primary transition-colors">Browse Pros</Link></li>
                <li><button className="hover:text-primary transition-colors">How it Works</button></li>
                <li><button className="hover:text-primary transition-colors">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><button className="hover:text-primary transition-colors">Help Center</button></li>
                <li><button className="hover:text-primary transition-colors">Terms of Service</button></li>
                <li><button className="hover:text-primary transition-colors">Privacy Policy</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Connect</h4>
              <div className="flex gap-4 text-gray-500">
                <button className="hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></button>
                <button className="hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></button>
                <button className="hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></button>
                <button className="hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center text-gray-600 text-xs">
            © 2026 ProConnect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
