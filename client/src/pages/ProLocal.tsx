import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  CheckCircle2,
  ChartColumnBig,
  CircleDollarSign,
  Clock3,
  Handshake,
  Inbox,
  MessageSquareMore,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const PRO_METRICS = [
  { stat: "$30B+", label: "AUM influenced through advisory introductions" },
  { stat: "~50K", label: "Monthly investor matches across the network" },
  { stat: "64%", label: "Prospects currently without a dedicated advisor" },
  { stat: "83%", label: "Investors near retirement or already retired" },
] as const;

const PRO_TOOLS = [
  {
    title: "Automated follow-up",
    description: "Keep every lead warm with structured nurturing flows after each intro call.",
    icon: MessageSquareMore,
  },
  {
    title: "Unified inbox",
    description: "See chats, call outcomes, and profile notes in one searchable view.",
    icon: Inbox,
  },
  {
    title: "Calendar + booking sync",
    description: "Avoid back-and-forth scheduling with connected availability and reminders.",
    icon: Clock3,
  },
  {
    title: "Conversion analytics",
    description: "Track response rate, meetings booked, close rate, and estimated pipeline value.",
    icon: ChartColumnBig,
  },
  {
    title: "Payment protection",
    description: "Secure payouts and transparent records for every completed engagement.",
    icon: CircleDollarSign,
  },
  {
    title: "Compliance-first trust",
    description: "Identity checks, verification signals, and audit-ready activity trails.",
    icon: ShieldCheck,
  },
] as const;

const HOW_IT_WORKS = [
  {
    title: "Create your pro profile",
    description: "Show your expertise, preferred client types, and service areas in minutes.",
  },
  {
    title: "Get matched with qualified leads",
    description: "Receive intros from investors actively searching for trusted guidance.",
  },
  {
    title: "Convert meetings into recurring clients",
    description: "Use built-in tools to follow up faster and grow long-term client relationships.",
  },
] as const;

const FAQS = [
  {
    question: "How quickly can I start receiving intros?",
    answer: "Most approved pros begin receiving matched opportunities within 3 to 7 days.",
  },
  {
    question: "Do I need to be fully registered to apply?",
    answer: "You can apply now, but your profile goes live only after verification requirements are met.",
  },
  {
    question: "Can I set my own pricing and availability?",
    answer: "Yes. You control your schedule, intro windows, and service pricing from your dashboard.",
  },
] as const;

export default function ProLocal() {
  const [aumGoal, setAumGoal] = useState(5000000);
  const [closeRate, setCloseRate] = useState(15);
  const [avgClientValue, setAvgClientValue] = useState(12000);

  const calculator = useMemo(() => {
    const leadVolume = Math.max(6, Math.round(aumGoal / 220000));
    const expectedClients = Math.max(1, Math.round((leadVolume * closeRate) / 100));
    const monthlyRevenue = expectedClients * avgClientValue;
    return { leadVolume, expectedClients, monthlyRevenue };
  }, [aumGoal, closeRate, avgClientValue]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-zinc-100 selection:text-black flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-zinc-800/80">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/pro-local-hero.png)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/70 to-[#0a0a0a]" />
        <div className="relative container mx-auto px-4 pt-24 pb-20 md:pt-32 md:pb-24 max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.9fr]">
            <div>
              <Badge className="mb-5 border-zinc-700 bg-zinc-900/70 text-zinc-200 hover:bg-zinc-900/70">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                High-intent investor referrals for ambitious pros
              </Badge>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.08]">
                A smarter way to attract clients and grow your AUM.
              </h1>
              <p className="mt-6 text-lg text-zinc-300 max-w-2xl leading-relaxed">
                ProConnectiv matches professionals with qualified prospects and gives you
                tools to nurture faster, stay organized, and close more high-value work.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/become-pro">
                  <Button className="rounded-lg bg-zinc-100 text-black hover:bg-zinc-200 font-semibold px-6 h-11 gap-2">
                    Apply as a Pro
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pros">
                  <Button
                    variant="outline"
                    className="rounded-lg border-zinc-700 bg-zinc-950/60 text-zinc-100 hover:bg-zinc-900 hover:border-zinc-600 h-11 px-6"
                  >
                    Explore active creators
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="border-zinc-700 bg-zinc-950/80 p-5 sm:p-6">
              <h2 className="text-2xl font-bold text-white">Schedule your intro call</h2>
              <p className="mt-1.5 text-sm text-zinc-400">
                Share a few details and we will match you with relevant opportunities.
              </p>
              <form className="mt-5 space-y-3">
                <Input placeholder="First name" className="bg-zinc-900/70 border-zinc-700 text-zinc-100 placeholder:text-zinc-500" />
                <Input placeholder="Last name" className="bg-zinc-900/70 border-zinc-700 text-zinc-100 placeholder:text-zinc-500" />
                <Input type="email" placeholder="Work email" className="bg-zinc-900/70 border-zinc-700 text-zinc-100 placeholder:text-zinc-500" />
                <Input placeholder="Phone number" className="bg-zinc-900/70 border-zinc-700 text-zinc-100 placeholder:text-zinc-500" />
                <Input placeholder="Company name" className="bg-zinc-900/70 border-zinc-700 text-zinc-100 placeholder:text-zinc-500" />
                <label className="flex items-start gap-2 rounded-md border border-zinc-700 bg-zinc-900/70 p-3 text-xs text-zinc-400">
                  <input type="checkbox" className="mt-0.5 accent-zinc-100" />
                  I understand profile activation is subject to verification and platform review.
                </label>
                <Button className="w-full rounded-md h-10 bg-zinc-100 text-black hover:bg-zinc-200 font-semibold">
                  Apply as a Pro
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Proof strip */}
      <section className="border-b border-zinc-800/80 bg-[#070b1e]">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 py-10 md:grid-cols-2 lg:grid-cols-4">
            {PRO_METRICS.map((metric) => (
              <div key={metric.label} className="border-l-2 border-orange-500 pl-4">
                <p className="text-4xl font-bold tracking-tight text-zinc-100">{metric.stat}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300/90">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-16 md:py-20 border-b border-zinc-800/80">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <Badge className="border-zinc-700 bg-zinc-900/70 text-zinc-300 hover:bg-zinc-900/70">ROI Calculator</Badge>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white">Estimate your monthly upside in under a minute</h2>
            <p className="mt-3 text-zinc-400">
              Adjust your goals to project expected lead flow, client conversions, and monthly revenue impact.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-zinc-800 bg-zinc-950/60 p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-zinc-300 mb-1">Annual AUM growth goal ($)</p>
                <Input
                  type="number"
                  value={aumGoal}
                  onChange={(e) => setAumGoal(Number(e.target.value) || 0)}
                  className="bg-zinc-900 border-zinc-700"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-300 mb-1">Expected close rate (%)</p>
                <Input
                  type="number"
                  value={closeRate}
                  onChange={(e) => setCloseRate(Number(e.target.value) || 0)}
                  className="bg-zinc-900 border-zinc-700"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-300 mb-1">Average first-year client value ($)</p>
                <Input
                  type="number"
                  value={avgClientValue}
                  onChange={(e) => setAvgClientValue(Number(e.target.value) || 0)}
                  className="bg-zinc-900 border-zinc-700"
                />
              </div>
            </Card>

            <Card className="border-zinc-700 bg-[#032d4a] p-6 text-zinc-100">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <span className="text-sm uppercase tracking-wide text-zinc-300">Recommended lead volume</span>
                  <span className="text-2xl font-bold">{calculator.leadVolume}/month</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <span className="text-sm uppercase tracking-wide text-zinc-300">Estimated new clients</span>
                  <span className="text-2xl font-bold">{calculator.expectedClients}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-wide text-zinc-300">Projected monthly revenue</span>
                  <span className="text-3xl font-extrabold">${calculator.monthlyRevenue.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-16 md:py-20 border-b border-zinc-800/80">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center">AMP gives you more than just referrals</h2>
          <p className="mt-2 text-zinc-400 text-center max-w-2xl mx-auto">
            Everything you need to follow up, stay organized, and turn introductions into long-term clients.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {PRO_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card key={tool.title} className="border-zinc-800 bg-zinc-950/60 p-6 hover:border-zinc-700 transition-colors">
                  <Icon className="h-5 w-5 text-orange-400" />
                  <h3 className="mt-4 text-lg font-semibold text-zinc-100">{tool.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{tool.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 border-b border-zinc-800/80">
        <div className="container mx-auto px-4 grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">How ProConnectiv helps you grow</h2>
            <p className="mt-4 text-zinc-400 leading-relaxed max-w-xl">
              Our matching system connects you with serious prospects, then gives you the workflow
              stack to respond faster and close with confidence.
            </p>
            <Link href="/become-pro">
              <Button className="mt-8 rounded-md bg-blue-600 hover:bg-blue-500 text-white">
                Apply as a Pro
              </Button>
            </Link>
          </div>

          <div className="space-y-6">
            {HOW_IT_WORKS.map((step, idx) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-sky-100/15 border border-sky-100/20 text-sky-200 flex items-center justify-center font-semibold">
                    {idx + 1}
                  </div>
                  {idx !== HOW_IT_WORKS.length - 1 ? <div className="h-full w-px bg-zinc-700 mt-2" /> : null}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-zinc-100">{step.title}</h3>
                  <p className="mt-2 text-zinc-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust + FAQ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Card className="border-zinc-800 bg-zinc-950/60 p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                <p className="text-sm text-zinc-300">Identity and profile verification before activation</p>
              </div>
              <div className="flex items-start gap-3">
                <Handshake className="h-5 w-5 text-emerald-400 mt-0.5" />
                <p className="text-sm text-zinc-300">Transparent matching criteria and lead quality controls</p>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-emerald-400 mt-0.5" />
                <p className="text-sm text-zinc-300">Dedicated support from onboarding to first conversion</p>
              </div>
            </div>
          </Card>

          <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-5">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((item) => (
              <details key={item.question} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 group">
                <summary className="cursor-pointer list-none text-zinc-100 font-medium flex items-center justify-between">
                  {item.question}
                  <span className="text-zinc-500 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-zinc-400">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
