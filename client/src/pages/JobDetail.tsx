import { useState } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHelpShell } from "@/components/PageHelpShell";
import { EscrowExplainer } from "@/components/EscrowExplainer";
import { RequestStatusStrip } from "@/components/RequestStatusStrip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import {
  useJob,
  useJobProposals,
  useCreateProposal,
  useAcceptProposal,
  useRejectProposal,
  useCloseJob,
} from "@/hooks/use-jobs";
import { useQuery } from "@tanstack/react-query";
import { authedFetch } from "@/lib/api";
import { formatMoney } from "@/lib/format-currency";
import {
  parseRequestMeta,
  formatDurationLabel,
} from "@/lib/request-meta";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Pro } from "@shared/schema";
import {
  ArrowLeft,
  Check,
  Loader2,
  X,
  CreditCard,
  Clock,
  Video,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getDemoRequest } from "@/lib/demo-requests";
import { DemoRequestDetailView } from "@/components/DemoRequestDetailView";

const REQUEST_FAQS = [
  {
    question: "When do I pay?",
    answer: "Only after you pick a pro. Until then, posting and receiving offers is free.",
  },
  {
    question: "What if no one responds?",
    answer: "Share your request or wait — pros browse open requests and can offer to help.",
  },
  {
    question: "How is my payment protected?",
    answer: "Funds stay in escrow until the video session is marked complete.",
  },
];

export default function JobDetail() {
  const [, params] = useRoute("/requests/:id");
  const jobId = params?.id ?? "";
  const demo = getDemoRequest(jobId);

  if (demo) {
    return <DemoRequestDetailView demo={demo} />;
  }

  return <LiveJobDetail jobId={jobId} />;
}

function LiveJobDetail({ jobId }: { jobId: string }) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: job, isLoading, isError } = useJob(jobId);
  const isPoster = !!user && job?.posterFirebaseUid === user.uid;

  const { data: proposals = [], isLoading: proposalsLoading } = useJobProposals(
    jobId,
    isPoster,
  );

  const { data: myPro } = useQuery<Pro | null>({
    queryKey: ["/api/me/creator"],
    queryFn: async () => {
      const res = await authedFetch("/api/me/creator");
      if (res.status === 404) return null;
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user,
    retry: false,
  });

  const createProposal = useCreateProposal(jobId);
  const acceptProposal = useAcceptProposal(jobId);
  const rejectProposal = useRejectProposal(jobId);
  const closeJob = useCloseJob(jobId);

  const [coverLetter, setCoverLetter] = useState("");
  const [proposedAmount, setProposedAmount] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-zinc-400">Request not found.</p>
          <Link href="/requests">
            <Button variant="outline" className="border-zinc-700">
              Back to requests
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const meta = parseRequestMeta(job.skills);
  const displayTags = meta.userTags;
  const canApply =
    !!user && !isPoster && job.status === "open" && !!myPro;
  const isFilled = job.status === "filled";
  const pendingOffers = proposals.filter((p) => p.status === "pending").length;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setLocation(`/auth?redirect=${encodeURIComponent(`/requests/${jobId}`)}`);
      return;
    }
    const amount = Number(proposedAmount) || job.budgetAmount;
    if (coverLetter.trim().length < 20) {
      toast({
        title: "Message too short",
        description: "Write at least 20 characters explaining how you can help.",
        variant: "destructive",
      });
      return;
    }
    try {
      await createProposal.mutateAsync({
        coverLetter: coverLetter.trim(),
        proposedAmount: amount,
        currency: job.currency,
      });
      toast({ title: "Offer submitted" });
      setShowApplyForm(false);
      setCoverLetter("");
    } catch (err) {
      toast({
        title: "Could not submit offer",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    }
  };

  const handleAccept = async (proposalId: string) => {
    try {
      const result = await acceptProposal.mutateAsync(proposalId);
      toast({
        title: "Pro picked",
        description: "Complete payment to hold funds in escrow.",
      });
      if (result.booking?.id) {
        setLocation(`/bookings/${result.booking.id}/payment`);
      }
    } catch (err) {
      toast({
        title: "Could not pick pro",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <PageHelpShell faqs={REQUEST_FAQS} chatSubject={`Request: ${job.title}`}>
        <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
          <Link
            href="/requests"
            className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-300 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            All requests
          </Link>

          <RequestStatusStrip
            job={job}
            proposalCount={pendingOffers}
            className="mb-6"
          />

          <div className="grid lg:grid-cols-[1fr_280px] gap-8">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    job.status === "open"
                      ? "border-emerald-500/40 text-emerald-400"
                      : "border-zinc-600 text-zinc-400",
                  )}
                >
                  {job.status === "open" ? "Open" : job.status}
                </Badge>
                {job.category && (
                  <Badge variant="secondary" className="bg-zinc-800">
                    {job.category}
                  </Badge>
                )}
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  <Video className="mr-1 h-3 w-3" />
                  {formatDurationLabel(meta.duration)}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
              <p className="text-sm text-zinc-500 mt-2">
                Posted{" "}
                {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                {job.posterDisplayName && ` · by ${job.posterDisplayName}`}
              </p>

              <div className="mt-6">
                <EscrowExplainer />
              </div>

              <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                  Details
                </h2>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
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

              {isPoster && job.status === "open" && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">
                      Pros who offered to help ({pendingOffers})
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-700"
                      disabled={closeJob.isPending}
                      onClick={() => closeJob.mutate()}
                    >
                      Close request
                    </Button>
                  </div>

                  {proposalsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                  ) : proposals.length === 0 ? (
                    <p className="text-sm text-zinc-500 py-8 text-center border border-dashed border-zinc-800 rounded-xl">
                      No offers yet. Pros browsing the board can offer to help.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {proposals.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5"
                        >
                          <div className="flex items-start gap-4">
                            <Link href={`/pro/${p.proId}`}>
                              <Avatar className="h-12 w-12 ring-1 ring-zinc-800">
                                <AvatarImage src={p.proImageUrl} />
                                <AvatarFallback>
                                  {p.proDisplayName[0]}
                                </AvatarFallback>
                              </Avatar>
                            </Link>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <Link href={`/pro/${p.proId}`}>
                                    <p className="font-semibold text-zinc-100 hover:underline">
                                      {p.proDisplayName}
                                    </p>
                                  </Link>
                                  {p.proHeadline && (
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                      {p.proHeadline}
                                    </p>
                                  )}
                                </div>
                                <Badge
                                  variant="outline"
                                  className="capitalize shrink-0"
                                >
                                  {p.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-zinc-400 mt-3 whitespace-pre-wrap">
                                {p.coverLetter}
                              </p>
                              <p className="text-sm font-medium text-zinc-200 mt-3">
                                Offer: {formatMoney(p.proposedAmount, p.currency)}
                              </p>
                              {p.status === "pending" && job.status === "open" && (
                                <div className="flex gap-2 mt-4">
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-500"
                                    disabled={acceptProposal.isPending}
                                    onClick={() => handleAccept(p.id)}
                                  >
                                    <Check className="mr-1.5 h-3.5 w-3.5" />
                                    Pick this pro
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-zinc-700"
                                    disabled={rejectProposal.isPending}
                                    onClick={() => rejectProposal.mutate(p.id)}
                                  >
                                    <X className="mr-1.5 h-3.5 w-3.5" />
                                    Decline
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 sticky top-24">
                <p className="text-2xl font-bold">
                  {formatMoney(job.budgetAmount, job.currency)}
                </p>
                <p className="text-sm text-zinc-500 mt-1">Session budget</p>
                <p className="text-sm text-zinc-500 mt-3 flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatDurationLabel(meta.duration)}
                </p>
                <p className="text-sm text-zinc-500 mt-2">
                  {job.proposalCount} offer
                  {job.proposalCount !== 1 ? "s" : ""}
                </p>

                {isFilled && job.bookingId && (
                  <Link href={`/bookings/${job.bookingId}/payment`}>
                    <Button className="w-full mt-6 h-11 rounded-xl">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Complete payment
                    </Button>
                  </Link>
                )}

                {canApply && !showApplyForm && (
                  <Button
                    className="w-full mt-6 h-11 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200 font-semibold"
                    onClick={() => setShowApplyForm(true)}
                  >
                    Offer to help
                  </Button>
                )}

                {user && !isPoster && !myPro && job.status === "open" && (
                  <div className="mt-6 p-4 rounded-lg bg-zinc-900/80 border border-zinc-800">
                    <p className="text-sm text-zinc-400">
                      Create a pro profile to offer help on requests.
                    </p>
                    <Link href="/become-pro">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 border-zinc-700"
                      >
                        Become a pro
                      </Button>
                    </Link>
                  </div>
                )}

                {!user && job.status === "open" && (
                  <Link
                    href={`/auth?redirect=${encodeURIComponent(`/requests/${jobId}`)}`}
                  >
                    <Button className="w-full mt-6 h-11 rounded-xl">
                      Sign in to offer help
                    </Button>
                  </Link>
                )}
              </div>

              {showApplyForm && canApply && (
                <form
                  onSubmit={handleApply}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-4"
                >
                  <h3 className="font-semibold">Offer to help</h3>
                  <div className="space-y-2">
                    <Label htmlFor="bid">Your rate ({job.currency})</Label>
                    <Input
                      id="bid"
                      type="number"
                      min={1}
                      placeholder={String(job.budgetAmount)}
                      value={proposedAmount}
                      onChange={(e) => setProposedAmount(e.target.value)}
                      className="bg-black border-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cover">How you can help</Label>
                    <Textarea
                      id="cover"
                      placeholder="Briefly explain your experience and approach..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="min-h-[120px] bg-black border-zinc-700"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={createProposal.isPending}
                    >
                      {createProposal.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Submit offer"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowApplyForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </aside>
          </div>
        </main>
      </PageHelpShell>
      <SiteFooter />
    </div>
  );
}
