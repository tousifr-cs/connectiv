import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { ProConnectivLogo } from "@/components/ProConnectivLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Users,
  Globe,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Mail,
  Plus,
  Minus,
  X,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function SignalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3.14.69 4.22 1.78l-1.42 1.42A3.934 3.934 0 0012 7c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.73-.21-1.41-.56-2l1.45-1.45A5.96 5.96 0 0118 11c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6zm0 4a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  );
}

const PLATFORMS = [
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    placeholder: "facebook.com/username",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    placeholder: "instagram.com/username",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    placeholder: "linkedin.com/in/username",
  },
  { id: "x", name: "X.com", icon: Twitter, placeholder: "x.com/username" },
  {
    id: "telegram",
    name: "Telegram",
    icon: TelegramIcon,
    placeholder: "t.me/username",
  },
  {
    id: "signal",
    name: "Signal",
    icon: SignalIcon,
    placeholder: "signal.me/#p/+1234567890",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: WhatsAppIcon,
    placeholder: "wa.me/1234567890",
  },
  { id: "email", name: "Email", icon: Mail, placeholder: "hello@example.com" },
];

const FAQS = [
  {
    question: "How does the verification process work?",
    answer:
      "We verify profile ownership by asking the individual to add a unique temporary code to their social media bio. Once confirmed, the connection is established.",
  },
  {
    question: "What happens if they don't respond?",
    answer:
      "If the requested person does not respond or join within 7 days, your cryptocurrency attachment is automatically refunded to your wallet.",
  },
  {
    question: "Is my payment secure?",
    answer:
      "Yes, all payments are held in a secure escrow smart contract and only released once the conversation has been successfully completed.",
  },
  {
    question: "How are conversations conducted?",
    answer:
      "Conversations happen through our secure, encrypted video and messaging platform, ensuring privacy for both parties.",
  },
];

export default function Home() {
  const [profileUrl, setProfileUrl] = useState("");
  const [platformIndex, setPlatformIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentPlatform = PLATFORMS[platformIndex];

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileUrl) {
      setLocation(`/request?url=${encodeURIComponent(profileUrl)}`);
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
            <span className="text-primary">Verified Conversations</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Attach cryptocurrency to a social media profile and request a
            conversation. We verify profile ownership and arrange secure
            sessions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto w-full space-y-4"
          >
            <form onSubmit={handleRequest} className="space-y-4">
              <div className="relative group" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="absolute left-0 top-0 bottom-0 flex items-center gap-1 pl-4 pr-2 z-20 rounded-l-xl hover:bg-white/5 transition-colors"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPlatform.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center"
                    >
                      <currentPlatform.icon className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </AnimatePresence>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""} animate-pulse`} />
                </button>
                <Input
                  placeholder={currentPlatform.placeholder}
                  className="h-14 pl-16 bg-black border-white/20 text-white rounded-xl focus:border-primary focus:ring-primary/20 transition-all text-lg"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  data-testid="input-profile-url"
                />

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-[calc(100%+4px)] bg-black border border-white/15 rounded-xl overflow-hidden z-30 shadow-2xl shadow-black/50"
                    >
                      {PLATFORMS.map((p, i) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setPlatformIndex(i);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            i === platformIndex
                              ? "bg-primary/10 text-primary"
                              : "text-gray-400 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <p.icon className="w-5 h-5 shrink-0" />
                          <span className="text-sm font-medium">{p.name}</span>
                          <span className="text-xs text-gray-600 ml-auto">{p.placeholder}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
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
          </motion.div>
        </div>

        {/* Platform Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full mt-8 overflow-hidden py-6 relative"
        >
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
          <div className="flex animate-marquee gap-12 items-center w-max">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex gap-12 items-center">
                {PLATFORMS.map((p) => (
                  <div
                    key={`${setIdx}-${p.id}`}
                    className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors shrink-0"
                  >
                    <p.icon className="w-7 h-7" />
                    <span className="text-sm font-medium whitespace-nowrap">
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="text-center mt-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-gray-500"
          >
            No charge today. Cancel anytime.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 flex items-center justify-center gap-4"
          >
            <span className="text-gray-400 text-sm font-medium">
              Join 1,200+ verified connections
            </span>
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
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Built for Trust
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg">
              Our platform ensures every connection is secure, verified, and
              high-quality.
            </p>
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
            <StepCard
              number="1"
              title="Request"
              description="Paste social profile and attach crypto payment"
            />
            <StepCard
              number="2"
              title="Verify"
              description="They verify ownership with unique code in bio"
            />
            <StepCard
              number="3"
              title="Connect"
              description="Schedule and join secure session"
            />
            <StepCard
              number="4"
              title="Complete"
              description="Payment released after conversation"
            />
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 bg-black border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Connect Directly with Verified Individuals
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
              Skip the noise and connect with real people who control the
              profiles you want to reach. ProConnectiv verifies identity and
              arranges paid conversations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-bold mb-8 text-white">
                Without ProConnectiv
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 text-gray-400">
                  <X className="w-5 h-5 text-red-500 mt-1 shrink-0" />
                  <span>
                    Send countless DMs that get ignored or marked as spam
                  </span>
                </li>
              </ul>
            </div>
            <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20">
              <h3 className="text-xl font-bold mb-8 text-white">
                With ProConnectiv
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 text-white">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-1 shrink-0" />
                  <span>
                    Get only verified conversations with profile owners
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-black border-t border-white/5 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            The Numbers Speak for Themselves
          </h2>
          <p className="text-gray-400 mb-16 max-w-2xl mx-auto">
            ProConnectiv enables verified connections at scale - helping
            professionals connect with the right people every day.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto mb-20">
            <div>
              <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                1,200+
              </div>
              <div className="text-gray-500">Connections made</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                850+
              </div>
              <div className="text-gray-500">Verified profiles</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                95%
              </div>
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
              content="I monetize my expertise by taking verified calls. ProConnectiv handles everything - verification, scheduling, and payments. Love it!"
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
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-white/10 rounded-xl px-6 bg-white/5"
              >
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
              <Link href="/" className="mb-4 block">
                <ProConnectivLogo size="sm" />
              </Link>
              <p className="text-gray-500 text-sm max-w-xs">
                The world's first platform for paid, verified conversations with
                anyone on social media.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <Link
                    href="/creators"
                    className="hover:text-primary transition-colors"
                  >
                    Browse Pros
                  </Link>
                </li>
                <li>
                  <button className="hover:text-primary transition-colors">
                    How it Works
                  </button>
                </li>
                <li>
                  <button className="hover:text-primary transition-colors">
                    Pricing
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <button className="hover:text-primary transition-colors">
                    Help Center
                  </button>
                </li>
                <li>
                  <button className="hover:text-primary transition-colors">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button className="hover:text-primary transition-colors">
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Connect</h4>
              <div className="flex gap-4 text-gray-500">
                <button className="hover:text-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                </button>
                <button className="hover:text-primary transition-colors">
                  <Instagram className="w-5 h-5" />
                </button>
                <button className="hover:text-primary transition-colors">
                  <Linkedin className="w-5 h-5" />
                </button>
                <button className="hover:text-primary transition-colors">
                  <Facebook className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center text-gray-600 text-xs">
            © 2026 ProConnectiv. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center group">
      <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center mx-auto mb-6 text-primary font-bold group-hover:bg-primary group-hover:text-black transition-all duration-300">
        {number}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function TestimonialCard({
  handle,
  role,
  content,
  color,
}: {
  handle: string;
  role: string;
  content: string;
  color: string;
}) {
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

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all duration-300 group">
      <div className="mb-6 p-4 rounded-2xl bg-black inline-block group-hover:scale-110 transition-transform duration-300 border border-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
