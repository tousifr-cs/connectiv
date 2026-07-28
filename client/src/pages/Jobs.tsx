import { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useJobs, useMyJobs, useMyJobProposals } from "@/hooks/use-jobs";
import { formatMoney, JOB_CATEGORIES } from "@/lib/format-currency";
import { formatDistanceToNow } from "date-fns";
import { PageHelpShell } from "@/components/PageHelpShell";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Briefcase,
  Loader2,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { DEMO_REQUESTS, jobToRequestPreview } from "@/lib/demo-requests";
import { RequestPreviewCard } from "@/components/RequestPreviewCard";
import type { JobWithPoster } from "@shared/schema";

type Tab = "browse" | "posted" | "applications";

const BROWSE_FAQS = [
  {
    question: "How do I post a request?",
    answer: "Click Post a request, describe what you need, pick a session length, and set a budget.",
  },
  {
    question: "How do pros respond?",
    answer: "Verified pros browse open requests and submit an offer to help.",
  },
  {
    question: "When am I charged?",
    answer: "Only after you pick a pro and pay into escrow.",
  },
];

const STATUS_STYLES: Record<string, string> = {
  open: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  filled: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  closed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function Jobs() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("browse");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const browseQuery = useJobs({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    status: "open",
  });
  const myJobsQuery = useMyJobs();
  const myProposalsQuery = useMyJobProposals();

  const jobs =
    tab === "browse"
      ? browseQuery.data ?? []
      : tab === "posted"
        ? myJobsQuery.data ?? []
        : [];

  const loading =
    tab === "browse"
      ? browseQuery.isLoading
      : tab === "posted"
        ? myJobsQuery.isLoading
        : myProposalsQuery.isLoading;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <PageHelpShell faqs={BROWSE_FAQS} chatSubject="Help browsing requests">
      <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Request board
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-2">
              Open session requests
            </h1>
            <p className="text-zinc-400 mt-2 max-w-lg">
              Browse short video session requests, post your own, or offer help as
              a verified pro.
            </p>
          </div>
          <Link href="/post">
            <Button className="h-11 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200 font-semibold shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Post a request
            </Button>
          </Link>
        </div>

        <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1 mb-6">
          {(
            [
              { id: "browse" as const, label: "Browse requests" },
              ...(user
                ? [
                    { id: "posted" as const, label: "My requests" },
                    { id: "applications" as const, label: "My offers" },
                  ]
                : []),
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "browse" && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search requests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 bg-zinc-950 border-zinc-800"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-48 h-11 bg-zinc-950 border-zinc-800">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {JOB_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        )}

        {!loading && tab === "applications" && (
          <div className="space-y-3">
            {(myProposalsQuery.data ?? []).length === 0 ? (
              <EmptyState
                title="No offers yet"
                description="Become a pro and offer help on open requests."
                ctaHref="/requests"
                ctaLabel="Browse requests"
              />
            ) : (
              myProposalsQuery.data?.map((p) => (
                <Link key={p.id} href={`/requests/${p.jobId}`}>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 hover:border-zinc-600 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-zinc-100">
                          {p.jobTitle}
                        </h3>
                        <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                          {p.coverLetter}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 capitalize",
                          STATUS_STYLES[p.status] ?? STATUS_STYLES.closed,
                        )}
                      >
                        {p.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-400 mt-3">
                      Bid: {formatMoney(p.proposedAmount, p.currency)} ·{" "}
                      {formatDistanceToNow(new Date(p.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {!loading && tab === "browse" && jobs.length === 0 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-300">
                  No live requests yet — be the first
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Below are sample requests so you can see how the board works.
                </p>
              </div>
              <Link href="/post">
                <Button className="h-10 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200 font-semibold shrink-0">
                  <Plus className="mr-2 h-4 w-4" />
                  Post a request
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {DEMO_REQUESTS.map((request) => (
                <RequestPreviewCard key={request.id} request={request} />
              ))}
            </div>
          </div>
        )}

        {!loading && tab === "posted" && jobs.length === 0 && (
          <EmptyState
            title="You haven't posted any requests"
            description="Post a request describing what you need and set your session budget."
            ctaHref="/post"
            ctaLabel="Post a request"
          />
        )}

        {!loading && tab !== "applications" && jobs.length > 0 && (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} showStatus={tab === "posted"} />
            ))}
          </div>
        )}
      </main>
      </PageHelpShell>

      <SiteFooter />
    </div>
  );
}

function JobCard({
  job,
  showStatus,
}: {
  job: JobWithPoster;
  showStatus?: boolean;
}) {
  return (
    <RequestPreviewCard
      request={jobToRequestPreview(job)}
      statusLabel={showStatus ? job.status : undefined}
      statusClassName={
        showStatus
          ? (STATUS_STYLES[job.status] ?? STATUS_STYLES.closed)
          : undefined
      }
    />
  );
}

function EmptyState({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-16 text-center">
      <Briefcase className="mx-auto h-12 w-12 text-zinc-700" />
      <h3 className="mt-4 text-lg font-semibold text-zinc-200">{title}</h3>
      <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto">{description}</p>
      <Link href={ctaHref}>
        <Button
          variant="outline"
          className="mt-6 border-zinc-700 text-white hover:bg-zinc-900"
        >
          {ctaLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
