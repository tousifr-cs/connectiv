import { cn } from "@/lib/utils";
import type { Job } from "@shared/schema";

const STEPS = [
  { id: "posted", label: "Posted" },
  { id: "offers", label: "Offers" },
  { id: "picked", label: "Pro picked" },
  { id: "paid", label: "Escrow paid" },
  { id: "session", label: "Session" },
  { id: "complete", label: "Complete" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

function resolveStep(job: Job, proposalCount: number): StepId {
  if (job.status === "filled" && job.bookingId) {
    return "picked";
  }
  if (proposalCount > 0) {
    return "offers";
  }
  return "posted";
}

interface RequestStatusStripProps {
  job: Job;
  proposalCount: number;
  bookingStatus?: string | null;
  className?: string;
}

export function RequestStatusStrip({
  job,
  proposalCount,
  bookingStatus,
  className,
}: RequestStatusStripProps) {
  let current = resolveStep(job, proposalCount);

  if (bookingStatus === "payment_pending") current = "picked";
  if (bookingStatus === "payment_received") current = "paid";
  if (
    bookingStatus === "session_completed" ||
    bookingStatus === "payout_pending" ||
    bookingStatus === "payout_sent"
  ) {
    current = "complete";
  }
  if (bookingStatus === "payment_received" && job.status === "filled") {
    current = "session";
  }

  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3",
        className,
      )}
    >
      {STEPS.map((step, i) => {
        const active = i === currentIndex;
        const done = i < currentIndex;
        return (
          <div key={step.id} className="flex items-center gap-1">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                active && "bg-primary/15 text-primary",
                done && "text-emerald-400",
                !active && !done && "text-zinc-600",
              )}
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="text-zinc-700 hidden sm:inline">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
