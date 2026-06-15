import { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { CapabilitiesStaircase } from "@/components/CapabilitiesStaircase";
import { EscrowExplainer } from "@/components/EscrowExplainer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChevronDown,
  Briefcase,
  Link2,
  Search,
  Instagram,
  Linkedin,
  CalendarClock,
  BadgeDollarSign,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    question: "How do I post a request?",
    answer:
      "Click Post a request, describe what you need, pick a session length (15, 30, or 60 minutes), set a budget, and publish. Posting is free.",
  },
  {
    question: "How do pros respond to my request?",
    answer:
      "Verified pros browse open requests and submit an offer to help. You compare proposals and pick the person who fits best.",
  },
  {
    question: "When am I charged?",
    answer:
      "Only after you pick a pro and proceed to payment. Your funds go into escrow and are released after the video session is complete.",
  },
  {
    question: "What session lengths are available?",
    answer: "15, 30, or 60 minute video sessions. You choose the length when posting your request.",
  },
  {
    question: "What is Direct connect?",
    answer:
      "A beta path for reaching a specific person off-platform. Paste their LinkedIn, X, or portfolio URL and ProConnectiv attempts to secure a paid conversation. For most needs, posting a request is faster.",
  },
];

const HELP_PATHS = [
  {
    title: "Post a request",
    description: "Describe what you need and set a budget for a short video session.",
    href: "/post",
    icon: Briefcase,
    badge: null,
  },
  {
    title: "Browse Experts",
    description: "Find the right expert for your needs.",
    href: "/requests",
    icon: Search,
    badge: null,
  },
  {
    title: "Direct connect",
    description: "Paste a profile URL to reach someone specific off-platform.",
    href: "/request",
    icon: Link2,
    badge: "Beta",
  },
] as const;

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

const ACTIVITY_PILLS = [
  "15–60 min video sessions",
  "Escrow-protected payments",
  "Verified pros only",
] as const;

const HERO_SOCIAL_LINKS = [
  { name: "Reddit", href: "https://www.reddit.com/", icon: RedditIcon },
  { name: "LinkedIn", href: "https://www.linkedin.com/", icon: Linkedin },
  { name: "Instagram", href: "https://www.instagram.com/", icon: Instagram },
] as const;

const STACK_FEATURES = [
  {
    number: "01",
    title: "Payments",
    kicker: "Escrow-protected checkout for every video session",
    copy: "When money moves between clients and experts, you cannot afford chargebacks, weekend delays, or unclear handoffs. ProConnectiv holds funds in escrow until your session is complete.",
    href: "/support/escrow",
    icon: Link2,
  },
  {
    number: "02",
    title: "Scheduling",
    kicker: "Book 15, 30, or 60 minute sessions in one flow",
    copy: "Pick a time that works, confirm the session, and join from the same place you posted your request. No back-and-forth email threads — just a clear calendar and a video room when it is time.",
    href: "/support",
    icon: CalendarClock,
  },
  {
    number: "03",
    title: "Low cost",
    kicker: "Short sessions priced for focused expert help",
    copy: "You set the budget when you post. Pros offer at your range, so you pay for the time you need — not a full retainer. Transparent pricing from request to payout.",
    href: "/post",
    icon: BadgeDollarSign,
  },
] as const;

const CUSTOMER_BENEFITS = [
  {
    number: "01",
    label: "Verified experts",
    copy: "Every expert is identity-reviewed before they can offer on your request. Real people with real expertise — not bots or cold outreach.",
    image: "/benefits/benefit-01.png",
  },
  {
    number: "02",
    label: "Focused sessions",
    copy: "15, 30, or 60 minute video calls built for one problem at a time. Get a clear answer, then get back to work.",
    image: "/benefits/benefit-02.png",
  },
  {
    number: "03",
    label: "Escrow protection",
    copy: "Pick your expert first. Payment stays in escrow until the video session is complete — so you are never paying blind.",
    image: "/benefits/benefit-03.png",
  },
  {
    number: "04",
    label: "Open request board",
    copy: "Post what you need once. Verified experts come to you with proposals — you compare and choose who fits best.",
    image: "/benefits/benefit-04.png",
  },
  {
    number: "05",
    label: "Transparent pricing",
    copy: "Set your budget when you post. Compare offers side by side before you commit — no surprise invoices later.",
    image: "/benefits/benefit-05.png",
  },
  {
    number: "06",
    label: "Built for video",
    copy: "Scheduling, messaging, and video calls in one place. Show up, talk face to face, and move on with confidence.",
    image: "/benefits/benefit-06.png",
  },
] as const;

export default function Home() {
  const [activeFaq, setActiveFaq] = useState(0);
  const activeFaqData = FAQS[activeFaq];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-zinc-100 selection:text-black flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="hero-section relative flex min-h-[100dvh] flex-col overflow-hidden bg-black">
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
        >
          <source src="/hero-bg.webm" type="video/webm" />
        </video>

        <div className="pointer-events-none absolute inset-0 bg-black/50" aria-hidden />

        <div
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 90% 70% at 30% 50%, black 20%, transparent 70%)",
          }}
        />

        <aside aria-label="Social links" className="hero-social-rail">
          {HERO_SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
            >
              <Icon />
            </a>
          ))}
        </aside>

        <div className="hero-content relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center pb-16 pt-[calc(60px+48px)]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex w-full flex-col items-center text-center"
          >
            <p className="hero-stat-badge">12,000+ sessions completed</p>

            <h1 className="hero-title">
              Get
              <br />
              connected 
              <br />
              fast
            </h1>

            <p className="hero-lead">Secure payments. Secure outcomes.</p>

            <div className="hero-actions">
              <Link href="/post" className="w-full sm:w-auto">
                <Button variant="ghost" className="btn-hero-primary">
                  Post a request
                  <ArrowRight className="!h-4 !w-4" strokeWidth={2.25} />
                </Button>
              </Link>
              <Link href="/pros" className="w-full sm:w-auto">
                <Button variant="ghost" className="btn-hero-secondary">
                  Browse experts
                  <ChevronDown className="!h-4 !w-4" strokeWidth={2.25} />
                </Button>
              </Link>
            </div>

            <ul className="hero-activity-pills" aria-label="Platform highlights">
              {ACTIVITY_PILLS.map((pill) => (
                <li key={pill} className="hero-activity-pill">
                  {pill}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Three ways to get help */}
      <section className="py-20 border-t border-zinc-900 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-100">
              Escrow ai for video sessions
            </h2>
            <p className="text-zinc-400 mt-3 max-w-lg mx-auto">
              Pick the path that matches what you are trying to do.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto justify-items-stretch md:justify-items-center">
            {HELP_PATHS.map((path) => (
              <Link key={path.href} href={path.href} className="group w-full md:w-56">
                <div className="help-path-card h-full bg-black/65 px-6 py-5 md:px-5 md:py-4 backdrop-blur-md transition-[filter] hover:brightness-110">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <path.icon className="h-6 w-6 md:h-5 md:w-5 text-zinc-300 shrink-0" strokeWidth={1.75} />
                    {path.badge && (
                      <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        {path.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl md:text-xl font-semibold leading-tight text-zinc-100">
                    {path.title}
                  </h3>
                  <p className="text-base md:text-sm text-zinc-500 leading-relaxed mt-2">
                    {path.description}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-4 text-sm text-zinc-500 group-hover:text-zinc-200 transition-colors">
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CapabilitiesStaircase />

      {/* Customer benefits */}
      <section className="customer-benefits-section border-t border-zinc-900 bg-black">
        <div className="customer-benefits-inner">
          <header className="customer-benefits-header">
            <span className="customer-benefits-badge">For customers</span>
            <h2 className="customer-benefits-title">
              Bringing <span className="customer-benefits-muted">human</span> experts{" "}
              <span className="customer-benefits-muted">closer</span>
            </h2>
          </header>

          {CUSTOMER_BENEFITS.map((benefit, index) => (
            <BenefitCard key={benefit.number} benefit={benefit} index={index} />
          ))}

          <p className="customer-benefits-footer">
            Built for people who would rather talk to an expert than scroll for answers.
          </p>
        </div>
      </section>

      {/* Onboard + Wallet Infrastructure */}
      <section className="onboard-stack-section border-t border-zinc-900">
        <div className="onboard-hero-block">
          <h2 className="onboard-hero-title">
            Onboard right now to share your expertise
          </h2>
          <p className="onboard-hero-lead">
            A single place to reach clients who need your skills, with escrow-protected
            video sessions worldwide.
          </p>
          <Link href="/requests" className="onboard-hero-cta">
            Join as an expert
            <ArrowRight className="!h-4 !w-4" strokeWidth={2.25} />
          </Link>
        </div>

        <div className="onboard-stack-divider" aria-hidden />

        <div className="stack-features">
          {STACK_FEATURES.map((feature) => (
            <StackFeatureSection key={feature.number} {...feature} />
          ))}
        </div>

      </section>

      {/* Escrow callout */}
      <section className="py-16 border-t border-zinc-900 bg-black">
        <div className="container mx-auto px-4 max-w-3xl">
          <EscrowExplainer />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-black border-t border-zinc-900 relative overflow-hidden">
        <div className="absolute left-1/2 top-12 -translate-x-1/2 w-[860px] h-[360px] bg-zinc-400/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 grid gap-12 lg:grid-cols-[280px_1fr] items-start">
          <div className="lg:sticky lg:top-24 z-20">
            <span className="customer-benefits-badge">Support</span>
            <h2 className="customer-benefits-title">
              Frequently
              <br />
              Asked
              <br />
              Questions
            </h2>
            <p className="faq-lead">
              Common questions about posting requests, payments, and sessions.
            </p>
            <Link href="/support">
              <Button
                variant="secondary"
                className="mt-8 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200 font-semibold"
              >
                Visit Help Center
              </Button>
            </Link>
          </div>

          <div className="faq-panel surface-noise bg-zinc-950/80 p-4 sm:p-6">
            <div className="relative z-[1] grid gap-4 md:grid-cols-[260px_1fr]">
              <div className="space-y-2">
                {FAQS.map((faq, i) => (
                  <button
                    key={faq.question}
                    type="button"
                    onClick={() => setActiveFaq(i)}
                    className={`w-full border p-4 text-left transition-all ${
                      activeFaq === i
                        ? "border-zinc-600 bg-zinc-900/80"
                        : "border-zinc-800 bg-zinc-900/35 hover:border-zinc-700"
                    }`}
                  >
                    <p
                      className={`faq-question leading-snug ${
                        activeFaq === i ? "faq-question--active" : "faq-question--inactive"
                      }`}
                    >
                      {faq.question}
                    </p>
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/45 p-5 sm:p-7 min-h-[240px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFaqData.question}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="faq-answer-title">
                      {activeFaqData.question}
                    </h3>
                    <p className="faq-answer-copy">
                      {activeFaqData.answer}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function BenefitCard({
  benefit,
  index,
}: {
  benefit: (typeof CUSTOMER_BENEFITS)[number];
  index: number;
}) {
  return (
    <article className={`benefit-card benefit-card--${index + 1} surface-noise`}>
      <span className="benefit-card-notch" aria-hidden />
      <span className="benefit-card-label">{benefit.label}</span>
      <img
        src={benefit.image}
        alt=""
        className="benefit-card-graphic"
        loading="lazy"
        decoding="async"
        aria-hidden
      />
      <div className="benefit-card-body">
        <span className="benefit-card-num">{benefit.number}</span>
        <p className="benefit-card-copy">{benefit.copy}</p>
      </div>
    </article>
  );
}

function StackFeatureSection({
  number,
  title,
  kicker,
  copy,
  href,
  icon: Icon,
}: {
  number: string;
  title: string;
  kicker: string;
  copy: string;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <div className="stack-feature-section surface-noise">
      <div className="stack-feature-bar">
        <span className="stack-num-badge">{number}</span>
        <Link href={href} className="stack-explore-btn">
          Explore
          <span className="stack-explore-arrow" aria-hidden>
            <ArrowRight className="h-3 w-3" strokeWidth={2} />
          </span>
        </Link>
      </div>

      <div className="stack-feature-grid">
        <div className="stack-feature-left">
          <span className="stack-num-badge stack-num-desktop">{number}</span>
          <div className="stack-feature-head">
            <div className="stack-icon-box stack-icon-mobile">
              <Icon className="h-10 w-10 text-white/90" strokeWidth={1.1} aria-hidden />
            </div>
            <div className="stack-feature-titles">
              <h3 className="stack-feature-title">{title}</h3>
              <p className="stack-feature-kicker">{kicker}</p>
            </div>
          </div>
        </div>

        <div className="stack-feature-right">
          <div className="stack-feature-detail-header">
            <span className="wallet-status-dot stack-status-desktop" aria-hidden />
            <Link href={href} className="stack-explore-btn stack-explore-desktop">
              Explore
              <span className="stack-explore-arrow" aria-hidden>
                <ArrowRight className="h-3 w-3" strokeWidth={2} />
              </span>
            </Link>
          </div>
          <div className="stack-icon-box stack-icon-desktop">
            <Icon className="h-10 w-10 text-white/90" strokeWidth={1.1} aria-hidden />
          </div>
          <p className="stack-feature-copy">{copy}</p>
        </div>
      </div>
    </div>
  );
}
