import { Link } from "wouter";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface EscrowExplainerProps {
  variant?: "default" | "compact";
  className?: string;
  showLearnMore?: boolean;
}

export function EscrowExplainer({
  variant = "default",
  className,
  showLearnMore = true,
}: EscrowExplainerProps) {
  if (variant === "compact") {
    return (
      <p className={cn("text-xs text-zinc-500 leading-relaxed", className)}>
        Payment held in escrow until your session is complete.{" "}
        {showLearnMore && (
          <Link href="/support/escrow" className="text-primary hover:underline">
            Learn more
          </Link>
        )}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-primary/15 bg-primary/5 p-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
          <ShieldCheck className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">Escrow protected</p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            ProConnectiv holds your payment in escrow. Funds are only released to
            the pro after the video session is marked complete. During beta,
            payments are processed via secure hosted checkout and reconciled by
            our team.
          </p>
          {showLearnMore && (
            <Link
              href="/support/escrow"
              className="text-xs font-medium text-primary hover:underline"
            >
              How escrow works
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
