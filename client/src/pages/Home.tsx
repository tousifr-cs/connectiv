import { useState } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { ProConnectivLogo } from "@/components/ProConnectivLogo";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Users,
  ChevronDown,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Mail,
  X,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

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

const FAQ_AUTHOR = [
  "Federico",
  "Noah",
  "Ari",
  "Mina",
];

const HERO_FLOATING_NOTES = [
  {
    title: "Book Real Expertise",
    body: "Find verified professionals for live sessions, advice, and hands-on help when it matters.",
    className: "left-[5%] top-[22%]",
    duration: 8.5,
  },
  {
    title: "One Place for Every Conversation",
    body: "Requests, messages, and bookings stay organized so nothing slips through the cracks.",
    className: "right-[5%] top-[20%]",
    duration: 9.5,
  },
  {
    title: "Video That Feels Personal",
    body: "Connect face to face with secure calls built for trust and clarity, not endless back-and-forth.",
    className: "left-[8%] bottom-[21%]",
    duration: 10.5,
  },
  {
    title: "Grow as a Creator",
    body: "Set your profile, showcase your work, and turn your skills into steady client relationships.",
    className: "right-[8%] bottom-[18%]",
    duration: 11.5,
  },
];

export default function Home() {
  const [selectedPlatformId, setSelectedPlatformId] = useState("facebook");
  const [platformMenuOpen, setPlatformMenuOpen] = useState(false);
  const [profileLink, setProfileLink] = useState("");
  const [requestName, setRequestName] = useState("");
  const [activeFaq, setActiveFaq] = useState(0);
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const faqRotateYRaw = useTransform(pointerX, [-0.5, 0.5], [-5, 5]);
  const faqRotateXRaw = useTransform(pointerY, [-0.5, 0.5], [5, -5]);
  const faqMoveXRaw = useTransform(pointerX, [-0.5, 0.5], [-10, 10]);
  const faqMoveYRaw = useTransform(pointerY, [-0.5, 0.5], [-8, 8]);
  const faqRotateY = useSpring(faqRotateYRaw, { stiffness: 110, damping: 18, mass: 0.6 });
  const faqRotateX = useSpring(faqRotateXRaw, { stiffness: 110, damping: 18, mass: 0.6 });
  const faqMoveX = useSpring(faqMoveXRaw, { stiffness: 110, damping: 18, mass: 0.6 });
  const faqMoveY = useSpring(faqMoveYRaw, { stiffness: 110, damping: 18, mass: 0.6 });
  const [, setLocation] = useLocation();
  const activeFaqData = FAQS[activeFaq];
  const selectedPlatform = PLATFORMS.find((platform) => platform.id === selectedPlatformId) ?? PLATFORMS[0];

  const handleFaqPointerMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;
    pointerX.set(normalizedX);
    pointerY.set(normalizedY);
  };

  const handleFaqPointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedProfileLink = profileLink.trim();
    if (normalizedProfileLink) {
      setLocation(`/request?url=${encodeURIComponent(normalizedProfileLink)}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-zinc-100 selection:text-black flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative isolate flex-1 min-h-[180vh] flex flex-col items-center justify-start pt-28 pb-40 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-zinc-400/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,rgba(0,0,0,0)_58%)] pointer-events-none" />

        {HERO_FLOATING_NOTES.map((note, idx) => (
          <motion.div
            key={note.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{
              opacity: 1,
              y: [0, -8, 0],
            }}
            transition={{
              opacity: { delay: 0.2 + idx * 0.1, duration: 0.4 },
              y: { delay: 0.4 + idx * 0.1, duration: note.duration, repeat: Infinity, ease: "easeInOut" },
            }}
            className={`absolute z-10 hidden xl:block ${note.className}`}
          >
            <div className="w-56 rounded-2xl border border-zinc-800 bg-black/65 px-5 py-4 backdrop-blur-md">
              <p className="text-zinc-100 text-xl font-semibold leading-tight">{note.title}</p>
              <p className="text-zinc-500 text-sm leading-relaxed mt-2">{note.body}</p>
            </div>
          </motion.div>
        ))}

        <div className="container mx-auto px-4 text-center relative z-20 max-w-5xl space-y-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] text-zinc-100 max-w-4xl mx-auto"
          >
            Connect with Professionals Through <br />
            <span className="text-zinc-300">ProConnectiv</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Attach cryptocurrency to a social media profile and request a
            conversation. We verify profile ownership and arrange secure
            sessions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto w-full max-w-2xl"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-[30px] border border-zinc-800/90 bg-black/85 p-2.5 shadow-[0_30px_90px_rgba(0,0,0,0.65)] backdrop-blur-xl"
            >
              <div className="rounded-[24px] border border-zinc-800/80 bg-zinc-950/75 px-5 py-6 sm:px-8 sm:py-8 text-left">
                <div className="text-center mb-7">
                  <h3 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100">
                    Request a verified connection
                  </h3>
                  <p className="text-zinc-400 text-lg mt-4 max-w-lg mx-auto leading-relaxed">
                    Select a platform, paste the profile link, and submit your
                    request in seconds.
                  </p>
                </div>

                <form onSubmit={handleRequest} className="space-y-4">
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setPlatformMenuOpen((prev) => !prev)}
                      className="w-full h-12 rounded-xl border border-zinc-500 bg-zinc-900 px-4 flex items-center justify-between text-sm font-medium text-zinc-100 transition-all hover:border-zinc-400"
                    >
                      <span className="flex items-center gap-2">
                        <selectedPlatform.icon className="w-4 h-4" />
                        {selectedPlatform.name}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-300 transition-transform ${
                          platformMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {platformMenuOpen && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PLATFORMS.filter(
                          (platform) =>
                            platform.id !== "email" &&
                            platform.id !== selectedPlatformId,
                        ).map((platform) => (
                          <button
                            key={platform.id}
                            type="button"
                            onClick={() => {
                              setSelectedPlatformId(platform.id);
                              setPlatformMenuOpen(false);
                            }}
                            className="h-12 rounded-xl border px-4 flex items-center gap-2 text-sm font-medium transition-all border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:border-zinc-700"
                          >
                            <platform.icon className="w-4 h-4" />
                            {platform.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Input
                    placeholder={`Paste ${selectedPlatform.name} profile link`}
                    className="h-14 px-5 bg-zinc-950/85 border-zinc-700/80 text-zinc-100 rounded-2xl focus:border-zinc-500 focus:ring-zinc-500/20 transition-all text-lg"
                    value={profileLink}
                    onChange={(e) => setProfileLink(e.target.value)}
                    data-testid="input-request-profile-link"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                    <Input
                      placeholder="Your name (optional)"
                      className="h-14 px-5 bg-zinc-950/85 border-zinc-700/80 text-zinc-100 rounded-2xl focus:border-zinc-500 focus:ring-zinc-500/20 transition-all text-lg"
                      value={requestName}
                      onChange={(e) => setRequestName(e.target.value)}
                      data-testid="input-request-name"
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="h-14 px-8 text-lg font-semibold bg-zinc-700 text-zinc-100 hover:bg-zinc-600 rounded-2xl transition-all shadow-[0_10px_28px_rgba(24,24,27,0.5)]"
                      data-testid="button-request-connection"
                    >
                      Request Connection
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
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
                    className="flex items-center gap-3 text-zinc-500 hover:text-zinc-200 transition-colors shrink-0"
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

        <div className="text-center mt-8 pt-6 border-t border-zinc-900/80">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center justify-center gap-3"
          >
            <span className="text-zinc-400 text-sm font-medium">
              Join 1,200+ verified connections
            </span>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-black" />
              <div className="w-8 h-8 rounded-full bg-zinc-600 border-2 border-black" />
              <div className="w-8 h-8 rounded-full bg-zinc-500 border-2 border-black" />
              <div className="w-8 h-8 rounded-full bg-zinc-400 border-2 border-black" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Grid - Old features preserved and enhanced */}
      <section className="py-24 border-t border-zinc-900 bg-black relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Built for Trust
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-lg">
              Our platform ensures every connection is secure, verified, and
              high-quality.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShieldCheck className="w-10 h-10 text-zinc-300" />}
              title="Verified Experts Only"
              description="Every pro on our platform is manually verified to ensure you learn from legitimate industry leaders."
            />
            <FeatureCard
              icon={<Users className="w-10 h-10 text-zinc-300" />}
              title="1:1 Direct Access"
              description="Skip the cold DMs. Book focused, high-impact sessions directly with the people you admire."
            />
            <FeatureCard
              icon={<CheckCircle2 className="w-10 h-10 text-zinc-300" />}
              title="Satisfaction Guaranteed"
              description="If your session doesn't meet our quality standards, we offer a full refund. No questions asked."
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-black border-t border-zinc-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h4 className="text-zinc-300 font-medium mb-4">How it works</h4>
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
      <section className="py-24 bg-black border-t border-zinc-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Connect Directly with Verified Individuals
            </h2>
            <p className="text-zinc-400 max-w-3xl mx-auto text-lg leading-relaxed">
              Skip the noise and connect with real people who control the
              profiles you want to reach. ProConnectiv verifies identity and
              arranges paid conversations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800">
              <h3 className="text-xl font-bold mb-8 text-white">
                Without ProConnectiv
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 text-zinc-400">
                  <X className="w-5 h-5 text-zinc-500 mt-1 shrink-0" />
                  <span>
                    Send countless DMs that get ignored or marked as spam
                  </span>
                </li>
              </ul>
            </div>
            <div className="p-8 rounded-2xl bg-zinc-900/70 border border-zinc-600">
              <h3 className="text-xl font-bold mb-8 text-white">
                With ProConnectiv
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 text-white">
                  <CheckCircle2 className="w-5 h-5 text-zinc-300 mt-1 shrink-0" />
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
      <section className="py-24 bg-black border-t border-zinc-900 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            The Numbers Speak for Themselves
          </h2>
          <p className="text-zinc-400 mb-16 max-w-2xl mx-auto">
            ProConnectiv enables verified connections at scale - helping
            professionals connect with the right people every day.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto mb-20">
            <div>
              <div className="text-5xl md:text-6xl font-bold text-zinc-100 mb-2">
                1,200+
              </div>
              <div className="text-zinc-500">Connections made</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-bold text-zinc-100 mb-2">
                850+
              </div>
              <div className="text-zinc-500">Verified profiles</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-bold text-zinc-100 mb-2">
                95%
              </div>
              <div className="text-zinc-500">Response rate</div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <TestimonialCard
              handle="@sarah_tech"
              role="Tech Founder"
              content="Finally got to speak with a VC I've been trying to reach for months. The verification process gave them confidence it was worth their time."
            />
            <TestimonialCard
              handle="@marcus_dev"
              role="Developer"
              content="I monetize my expertise by taking verified calls. ProConnectiv handles everything - verification, scheduling, and payments. Love it!"
            />
            <TestimonialCard
              handle="@alex_creator"
              role="Content Creator"
              content="Game changer for connecting with brands. The crypto payment system is transparent and the verification builds trust instantly."
            />
          </div>
        </div>
      </section>

      {/* FAQ Workspace Section */}
      <section className="py-24 bg-black border-t border-zinc-900 relative overflow-hidden">
        <div className="absolute left-1/2 top-12 -translate-x-1/2 w-[860px] h-[360px] bg-zinc-400/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 grid gap-12 lg:grid-cols-[300px_1fr] items-start">
          <div className="lg:sticky lg:top-24 z-20">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 mb-4">Support</p>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-[0.95] tracking-tighter">
              Frequently
              <br />
              Asked
              <br />
              Questions
            </h2>
            <p className="text-zinc-400 mt-5 max-w-xs leading-relaxed">
              Detailed overview of features, functionality, and inner workings.
            </p>
            <Button
              variant="secondary"
              className="mt-8 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200 font-semibold"
            >
              Complete Docs
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            onMouseMove={reduceMotion ? undefined : handleFaqPointerMove}
            onMouseLeave={reduceMotion ? undefined : handleFaqPointerLeave}
            style={
              reduceMotion
                ? undefined
                : {
                    rotateX: faqRotateX,
                    rotateY: faqRotateY,
                    x: faqMoveX,
                    y: faqMoveY,
                  }
            }
            className="relative rounded-[28px] border border-zinc-800/80 bg-black/80 p-2.5 shadow-[0_34px_90px_rgba(0,0,0,0.62)] backdrop-blur-xl [transform-style:preserve-3d]"
          >
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : {
                      y: [0, -9, 0],
                      rotate: [0, -0.4, 0.4, 0],
                    }
              }
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 9.2, repeat: Infinity, ease: "easeInOut" }
              }
              className="rounded-[22px] border border-zinc-800/75 bg-zinc-950/80 p-4 sm:p-6 surface-noise"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                </div>
                <div className="flex items-center gap-2">
                  <ProConnectivLogo size="sm" showWordmark={false} className="opacity-70" />
                  <span className="text-xs uppercase tracking-[0.16em] text-zinc-600">faq workspace</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[280px_1fr]">
                <div className="space-y-3">
                  {FAQS.map((faq, i) => (
                    <motion.button
                      key={faq.question}
                      type="button"
                      onClick={() => setActiveFaq(i)}
                      whileHover={reduceMotion ? undefined : { x: 2 }}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${
                        activeFaq === i
                          ? "border-zinc-600 bg-zinc-900/80 shadow-[0_10px_35px_rgba(0,0,0,0.35)]"
                          : "border-zinc-800 bg-zinc-900/35 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400/80" />
                        {FAQ_AUTHOR[i] ?? "Federico"}
                      </div>
                      <p className={`font-semibold leading-snug ${activeFaq === i ? "text-zinc-100" : "text-zinc-300"}`}>
                        {faq.question}
                      </p>
                    </motion.button>
                  ))}
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black/45 p-5 sm:p-7 min-h-[320px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFaqData.question}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-xs font-bold">
                          PC
                        </div>
                        <div>
                          <p className="text-zinc-200 font-semibold leading-none">
                            {FAQ_AUTHOR[activeFaq] ?? "Federico"}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">Reply-To</p>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight text-zinc-100 mb-6">
                        {activeFaqData.question}
                      </h3>
                      <p className="text-zinc-400 leading-relaxed text-base">
                        {activeFaqData.answer}
                      </p>
                      <p className="text-zinc-600 text-xs mt-8">Sent from my iPhone</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
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
      <div className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center mx-auto mb-6 text-zinc-300 font-bold bg-zinc-950 group-hover:bg-zinc-100 group-hover:text-black transition-all duration-300">
        {number}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-zinc-500 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function TestimonialCard({
  handle,
  role,
  content,
}: {
  handle: string;
  role: string;
  content: string;
}) {
  return (
    <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-left hover:border-zinc-600 transition-all duration-300">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-zinc-600" />
        <div>
          <div className="font-bold text-white">{handle}</div>
          <div className="text-zinc-500 text-sm">{role}</div>
        </div>
      </div>
      <p className="text-zinc-400 leading-relaxed italic">"{content}"</p>
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
    <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 transition-all duration-300 group">
      <div className="mb-6 p-4 rounded-2xl bg-zinc-950 inline-block group-hover:scale-110 transition-transform duration-300 border border-zinc-800">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
