import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHelpShell } from "@/components/PageHelpShell";
import { EscrowExplainer } from "@/components/EscrowExplainer";
import { RequestStatusStrip } from "@/components/RequestStatusStrip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatMoney } from "@/lib/format-currency";
import {
  parseRequestMeta,
  formatDurationLabel,
} from "@/lib/request-meta";
import {
  demoToMockJob,
  type DemoRequestDetail,
} from "@/lib/demo-requests";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Info,
  Sparkles,
  Video,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const DEMO_FAQS = [
  {
    question: "Can I hire from this sample request?",
    answer:
      "This is an example only. Post your own request to receive real offers from verified pros.",
  },
  {
    question: "How do offers work on a real request?",
    answer:
      "Pros browse open requests and submit offers. You compare proposals, pick someone, and pay into escrow.",
  },
  {
    question: "How is payment protected?",
    answer: "Funds stay in escrow until your video session is marked complete.",
  },
];

interface DemoRequestDetailViewProps {
  demo: DemoRequestDetail;
}

export function DemoRequestDetailView({ demo }: DemoRequestDetailViewProps) {
  const mockJob = demoToMockJob(demo);
  const meta = parseRequestMeta(demo.skills);
  const displayTags = meta.userTags;

  const postParams = new URLSearchParams();
  postParams.set("title", demo.title);
  if (demo.category) postParams.set("category", demo.category);
  postParams.set("budget", String(demo.budgetAmount));
  postParams.set("currency", demo.currency);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <PageHelpShell faqs={DEMO_FAQS} chatSubject={`Sample: ${demo.title}`}>
        <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
          <Link
            href="/requests"
            className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-300 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            All requests
          </Link>

          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 mb-6 flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-200/90">Sample request</p>
              <p className="text-amber-200/60 mt-1 leading-relaxed">
                This shows what a live request looks like — including example
                offers. Post your own to get real proposals from verified pros.
              </p>
            </div>
          </div>

          <RequestStatusStrip
            job={mockJob}
            proposalCount={demo.proposals.length}
            className="mb-6"
          />

          <div className="grid lg:grid-cols-[1fr_280px] gap-8">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 text-emerald-400"
                >
                  Open
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase tracking-wider border-zinc-700 text-zinc-500"
                >
                  Sample
                </Badge>
                {demo.category && (
                  <Badge variant="secondary" className="bg-zinc-800">
                    {demo.category}
                  </Badge>
                )}
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  <Video className="mr-1 h-3 w-3" />
                  {formatDurationLabel(meta.duration)}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold tracking-tight">{demo.title}</h1>
              <p className="text-sm text-zinc-500 mt-2">
                Posted{" "}
                {formatDistanceToNow(new Date(demo.createdAt), {
                  addSuffix: true,
                })}
                {demo.posterDisplayName && ` · by ${demo.posterDisplayName}`}
              </p>

              <div className="mt-6">
                <EscrowExplainer />
              </div>

              <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                  Details
                </h2>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {demo.fullDescription}
                </p>
                {demo.goals.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                      Session goals
                    </p>
                    <ul className="space-y-2">
                      {demo.goals.map((goal) => (
                        <li
                          key={goal}
                          className="flex items-start gap-2 text-sm text-zinc-400"
                        >
                          <CheckCircle2 className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {displayTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {displayTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-lg font-semibold">
                    Example offers ({demo.proposals.length})
                  </h2>
                </div>
                <p className="text-xs text-zinc-500 mb-4">
                  Illustrative proposals — real requests receive live offers from
                  verified pros.
                </p>
                <div className="space-y-3">
                  {demo.proposals.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 opacity-90"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 ring-1 ring-zinc-800">
                          <AvatarImage src={p.proImageUrl} />
                          <AvatarFallback>{p.proDisplayName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-zinc-100">
                                {p.proDisplayName}
                              </p>
                              {p.proHeadline && (
                                <p className="text-xs text-zinc-500 mt-0.5">
                                  {p.proHeadline}
                                </p>
                              )}
                            </div>
                            <Badge
                              variant="outline"
                              className="shrink-0 border-zinc-700 text-zinc-500"
                            >
                              Sample
                            </Badge>
                          </div>
                          <p className="text-sm text-zinc-400 mt-3 whitespace-pre-wrap">
                            {p.coverLetter}
                          </p>
                          <p className="text-sm font-medium text-zinc-200 mt-3">
                            Offer: {formatMoney(p.proposedAmount, p.currency)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 sticky top-24">
                <p className="text-2xl font-bold">
                  {formatMoney(demo.budgetAmount, demo.currency)}
                </p>
                <p className="text-sm text-zinc-500 mt-1">Session budget</p>
                <p className="text-sm text-zinc-500 mt-3 flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatDurationLabel(meta.duration)}
                </p>
                <p className="text-sm text-zinc-500 mt-2">
                  {demo.proposalCount} example offer
                  {demo.proposalCount !== 1 ? "s" : ""}
                </p>

                <Link href={`/post?${postParams.toString()}`}>
                  <Button className="w-full mt-6 h-11 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200 font-semibold">
                    Post a similar request
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/for-pros">
                  <Button
                    variant="outline"
                    className="w-full mt-3 h-11 rounded-xl border-zinc-700"
                  >
                    Apply as a pro
                  </Button>
                </Link>
              </div>
            </aside>
          </div>
        </main>
      </PageHelpShell>
      <SiteFooter />
    </div>
  );
}
