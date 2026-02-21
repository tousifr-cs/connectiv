import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle2, ShieldCheck, Users, Globe, Twitter, Instagram, Linkedin, Facebook, Mail, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const PLATFORMS = [
  { id: "facebook", name: "Facebook", icon: Facebook, placeholder: "facebook.com/username" },
  { id: "instagram", name: "Instagram", icon: Instagram, placeholder: "instagram.com/username" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, placeholder: "linkedin.com/in/username" },
  { id: "x", name: "X.com", icon: Twitter, placeholder: "x.com/username" },
  { id: "email", name: "Email", icon: Mail, placeholder: "hello@example.com" },
];

const FAQS = [
  {
    question: "How does the verification process work?",
    answer: "We verify profile ownership by asking the individual to add a unique temporary code to their social media bio. Once confirmed, the connection is established."
  },
  {
    question: "What happens if they don't respond?",
    answer: "If the requested person does not respond or join within 7 days, your cryptocurrency attachment is automatically refunded to your wallet."
  },
  {
    question: "Is my payment secure?",
    answer: "Yes, all payments are held in a secure escrow smart contract and only released once the conversation has been successfully completed."
  },
  {
    question: "How are conversations conducted?",
    answer: "Conversations happen through our secure, encrypted video and messaging platform, ensuring privacy for both parties."
  }
];

export default function Home() {
  const [profileUrl, setProfileUrl] = useState("");
  const [platformIndex, setPlatformIndex] = useState(0);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setPlatformIndex((prev) => (prev + 1) % PLATFORMS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const currentPlatform = PLATFORMS[platformIndex];

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileUrl) {
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
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none z-10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPlatform.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <currentPlatform.icon className="w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <Input 
                  placeholder={currentPlatform.placeholder}
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

      {/* Trust Grid - Old features preserved and enhanced */}
      <section className="py-24 border-t border-white/5 bg-black relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Built for Trust</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg">Our platform ensures every connection is secure, verified, and high-quality.</p>
          </div>
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

      {/* How it Works Section */}
      <section className="py-24 bg-black border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h4 className="text-primary font-medium mb-4">How it works</h4>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Simple Process from Request to Connection
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StepCard number="1" title="Request" description="Paste social profile and attach crypto payment" />
            <StepCard number="2" title="Verify" description="They verify ownership with unique code in bio" />
            <StepCard number="3" title="Connect" description="Schedule and join secure session" />
            <StepCard number="4" title="Complete" description="Payment released after conversation" />
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 bg-black border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Connect Directly with Verified Individuals</h2>
            <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
              Skip the noise and connect with real people who control the profiles you want to reach. 
              ProConnect verifies identity and arranges paid conversations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold mb-8 text-white">Without ProConnect</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 text-gray-400">
                  <X className="w-5 h-5 text-red-500 mt-1 shrink-0" />
                  <span>Send countless DMs that get ignored or marked as spam</span>
                </li>
              </ul>
            </div>
            <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20">
              <h3 className="text-xl font-bold mb-8 text-white">With ProConnect</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 text-white">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-1 shrink-0" />
                  <span>Get only verified conversations with profile owners</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-black border-t border-white/5 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">The Numbers Speak for Themselves</h2>
          <p className="text-gray-400 mb-16 max-w-2xl mx-auto">
            ProConnect enables verified connections at scale - helping professionals connect with the right people every day.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto mb-20">
            <div>
              <div className="text-5xl md:text-6xl font-bold text-primary mb-2">1,200+</div>
              <div className="text-gray-500">Connections made</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-bold text-primary mb-2">850+</div>
              <div className="text-gray-500">Verified profiles</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-bold text-primary mb-2">95%</div>
              <div className="text-gray-500">Response rate</div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <TestimonialCard 
              handle="@sarah_tech" 
              role="Tech Founder" 
              content="Finally got to speak with a VC I've been trying to reach for months. The verification process gave them confidence it was worth their time."
              color="bg-purple-500"
            />
            <TestimonialCard 
              handle="@marcus_dev" 
              role="Developer" 
              content="I monetize my expertise by taking verified calls. ProConnect handles everything - verification, scheduling, and payments. Love it!"
              color="bg-blue-500"
            />
            <TestimonialCard 
              handle="@alex_creator" 
              role="Content Creator" 
              content="Game changer for connecting with brands. The crypto payment system is transparent and the verification builds trust instantly."
              color="bg-green-500"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-black border-t border-white/5">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-white/10 rounded-xl px-6 bg-white/5">
                <AccordionTrigger className="text-white hover:text-primary transition-colors text-lg font-bold py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 text-base pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="text-center group">
      <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center mx-auto mb-6 text-primary font-bold group-hover:bg-primary group-hover:text-black transition-all duration-300">
        {number}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
}

function TestimonialCard({ handle, role, content, color }: { handle: string, role: string, content: string, color: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-left hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 rounded-full ${color}`} />
        <div>
          <div className="font-bold text-white">{handle}</div>
          <div className="text-gray-500 text-sm">{role}</div>
        </div>
      </div>
      <p className="text-gray-400 leading-relaxed italic">"{content}"</p>
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
