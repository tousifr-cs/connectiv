import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHelpShell } from "@/components/PageHelpShell";
import { EscrowExplainer } from "@/components/EscrowExplainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useCreateJob } from "@/hooks/use-jobs";
import { useToast } from "@/hooks/use-toast";
import { JOB_CATEGORIES, JOB_CURRENCIES } from "@/lib/format-currency";
import {
  buildSkillsField,
  DURATION_OPTIONS,
  type RequestDuration,
} from "@/lib/request-meta";
import { ArrowRight, Clock, Loader2, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const POST_FAQS = [
  {
    question: "When am I charged?",
    answer:
      "Only after you pick a pro and proceed to payment. Posting a request is free.",
  },
  {
    question: "What session lengths are available?",
    answer: "15, 30, or 60 minute video sessions.",
  },
  {
    question: "How does escrow work?",
    answer:
      "Your payment is held until the video session is complete. The pro is paid only after that.",
  },
];

function getInitialFromSearch() {
  const params = new URLSearchParams(window.location.search);
  return {
    title: params.get("title") ?? "",
    description: params.get("description") ?? "",
    budgetAmount: params.get("budget") ?? "",
    currency: params.get("currency") ?? "USD",
    category: params.get("category") ?? "",
  };
}

export default function PostJob() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createJob = useCreateJob();

  const initial = getInitialFromSearch();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [category, setCategory] = useState(initial.category);
  const [tags, setTags] = useState("");
  const [budgetAmount, setBudgetAmount] = useState(initial.budgetAmount);
  const [currency, setCurrency] = useState(initial.currency);
  const [duration, setDuration] = useState<RequestDuration>(30);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation(`/auth?redirect=${encodeURIComponent("/post")}`);
    }
  }, [authLoading, user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(budgetAmount);
    if (!title.trim() || description.trim().length < 20 || !amount || amount <= 0) {
      toast({
        title: "Check your form",
        description: "Title, description (20+ chars), and budget are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const job = await createJob.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        category: category || undefined,
        skills: buildSkillsField({ duration, tags }),
        budgetAmount: amount,
        currency,
        budgetType: "fixed",
      });
      toast({
        title: "Request live",
        description: "Pros can respond. You only pay after you pick someone.",
      });
      setLocation(`/requests/${job.id}`);
    } catch (err) {
      toast({
        title: "Could not post request",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <PageHelpShell faqs={POST_FAQS} chatSubject="Help posting a request">
        <main className="flex-1 w-full">
          <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Post a request
                </p>
                <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
                  What do you need help with?
                </h1>
                <p className="text-zinc-400 mt-3 leading-relaxed">
                  Post a short video session request. Verified pros can offer to
                  help — you only pay after you pick someone.
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="mt-8 space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 sm:p-8"
                >
                  <div className="space-y-2">
                    <Label htmlFor="title">What do you need?</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Help me set up Automa workflows"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-11 bg-black border-zinc-700"
                      maxLength={200}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Details</Label>
                    <Textarea
                      id="description"
                      placeholder="Explain your goal, background, and what success looks like..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[120px] bg-black border-zinc-700 resize-y"
                      maxLength={5000}
                    />
                    <p className="text-xs text-zinc-500">
                      {description.length}/5000 · minimum 20 characters
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-zinc-500" />
                      Session length
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {DURATION_OPTIONS.map((d) => (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => setDuration(d.value)}
                          className={cn(
                            "rounded-xl border-2 p-4 text-center transition-all",
                            duration === d.value
                              ? "border-primary bg-primary/5"
                              : "border-zinc-800 bg-black/40 hover:border-zinc-600",
                          )}
                        >
                          <Clock
                            className={cn(
                              "mx-auto mb-2 h-5 w-5",
                              duration === d.value
                                ? "text-primary"
                                : "text-zinc-500",
                            )}
                          />
                          <p className="font-semibold text-sm">{d.label}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            {d.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-500">
                      Video session only — join via ProConnectiv when booked.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Session budget</Label>
                      <Input
                        id="budget"
                        type="number"
                        min={1}
                        placeholder="100"
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                        className="h-11 bg-black border-zinc-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="h-11 bg-black border-zinc-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {JOB_CURRENCIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category (optional)</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-11 bg-black border-zinc-700">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Skills / tags (optional)</Label>
                    <Input
                      id="tags"
                      placeholder="automation, engineering"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="h-11 bg-black border-zinc-700"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={createJob.isPending}
                    className="w-full h-12 rounded-xl bg-zinc-100 text-black hover:bg-zinc-200 font-semibold"
                  >
                    {createJob.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Post request
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>

              <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                <EscrowExplainer />
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 text-sm text-zinc-400 space-y-3">
                  <p className="font-semibold text-zinc-200">What happens next</p>
                  <ol className="list-decimal list-inside space-y-2 text-xs leading-relaxed">
                    <li>Your request goes live on the board</li>
                    <li>Pros offer to help with a short message</li>
                    <li>You pick one and pay into escrow</li>
                    <li>Join your video session on ProConnectiv</li>
                    <li>Funds release to the pro after completion</li>
                  </ol>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </PageHelpShell>
      <SiteFooter />
    </div>
  );
}
