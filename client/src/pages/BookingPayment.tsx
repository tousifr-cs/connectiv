import { useMemo } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  Loader2,
  ShieldCheck,
  CalendarDays,
  CircleDollarSign,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import { Navbar } from "@/components/Navbar";
import { EscrowExplainer } from "@/components/EscrowExplainer";
import { PageHelpShell } from "@/components/PageHelpShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { authedFetch } from "@/lib/api";
import type { Booking, Pro } from "@shared/schema";
import { cn } from "@/lib/utils";

const SUPPORT_EMAIL = "proconnectivv@gmail.com";

const SESSION_LABELS: Record<string, string> = {
  video_call: "Video Call",
  audio_consult: "Audio Consultation",
  dm_bundle: "DM Bundle",
  deep_dive: "Deep Dive",
};

const PAYMENT_FAQS = [
  {
    question: "When is the pro paid?",
    answer: "Only after the video session is marked complete.",
  },
  {
    question: "What if payment fails?",
    answer: "Contact support with your booking reference. No pro is assigned until payment is confirmed.",
  },
  {
    question: "Can I get a refund?",
    answer: "Refunds are reviewed if the session cannot be delivered. See our support page for details.",
  },
];

export default function BookingPayment() {
  const [, params] = useRoute("/bookings/:id/payment");
  const bookingId = params?.id ?? "";
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (!loading && !user) {
    setLocation("/auth");
    return null;
  }

  const { data: booking, isLoading } = useQuery<Booking>({
    queryKey: ["/api/bookings", bookingId],
    queryFn: async () => {
      const res = await authedFetch(`/api/bookings/${bookingId}`);
      if (!res.ok) throw new Error("Failed to load booking");
      return res.json();
    },
    enabled: !!user && !!bookingId,
  });

  const { data: pro } = useQuery<Pro>({
    queryKey: ["/api/pros", booking?.proId],
    queryFn: async () => {
      const res = await fetch(`/api/pros/${booking?.proId}`);
      if (!res.ok) throw new Error("Failed to load pro");
      return res.json();
    },
    enabled: !!booking?.proId,
  });

  const paymentState = useMemo(() => {
    if (!booking) return null;
    if (booking.status === "payment_pending") {
      return {
        label: "Action required",
        tone: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      };
    }
    if (booking.status === "payment_received") {
      return {
        label: "Payment received",
        tone: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      };
    }
    return {
      label: booking.status.replaceAll("_", " "),
      tone: "bg-white/10 border-white/15 text-zinc-300",
    };
  }, [booking]);

  if (isLoading || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <PageHelpShell faqs={PAYMENT_FAQS} chatSubject={`Payment booking ${bookingId}`}>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">
              Secure booking payment
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Complete your ProConnectiv booking
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Review your session details below. Payment is completed on
              Payoneer’s secure hosted page and then reconciled back into your
              booking.
            </p>
          </div>
          <Badge className={cn("border text-xs font-semibold", paymentState?.tone)}>
            {paymentState?.label}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-white/10 bg-zinc-950/80">
            <CardHeader>
              <CardTitle className="text-lg">Booking summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow label="Session type" value={SESSION_LABELS[booking.sessionType] ?? booking.sessionType} />
                <InfoRow label="Pro" value={pro?.displayName ?? `Pro #${booking.proId}`} />
                <InfoRow
                  label="Booking date/time"
                  value={
                    booking.scheduledAt
                      ? format(new Date(booking.scheduledAt), "MMM d, yyyy • h:mm a")
                      : "To be confirmed"
                  }
                />
                <InfoRow
                  label="Gross amount"
                  value={`${booking.currency} $${booking.grossAmount.toLocaleString()}`}
                />
                <InfoRow label="Booking reference" value={booking.id} mono />
                <InfoRow label="Payment method" value="Payoneer hosted payment link" />
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm font-semibold text-white">What happens next</p>
                <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                  <li>1. Complete payment using the secure Payoneer page.</li>
                  <li>2. We confirm the payment and update this booking to paid.</li>
                  <li>3. The pro reviews the request and accepts the session.</li>
                  <li>4. After the session, payout processing begins for the pro.</li>
                </ul>
              </div>

              <EscrowExplainer />
              <p className="text-sm text-zinc-500">
                You’ll complete payment on Payoneer’s secure hosted page. We do
                not collect card details on ProConnectiv during beta.
              </p>

              <div className="flex flex-wrap gap-3">
                {booking.paymentRequestLink ? (
                  <Button
                    asChild
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <a
                      href={booking.paymentRequestLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Pay securely with Payoneer
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <Button disabled className="bg-primary/50 text-primary-foreground">
                    Awaiting Payoneer payment link
                  </Button>
                )}
                <Link href="/inbox">
                  <Button
                    variant="outline"
                    className="border-white/10 bg-transparent text-white hover:border-primary/50 hover:text-primary"
                  >
                    Back to inbox
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-white/10 bg-zinc-950/80">
              <CardHeader>
                <CardTitle className="text-lg">Trust and support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-zinc-400">
                <div className="flex items-start gap-3">
                  <CircleDollarSign className="mt-0.5 h-4 w-4 text-primary" />
                  <p>
                    Your payment reference is stored against this booking so our
                    admin team can reconcile payment, session completion, and
                    any refund or payout actions.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
                  <p>
                    If the scheduled session changes, we’ll update the booking
                    record before the session takes place.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-primary" />
                  <p>
                    Need help? Contact{" "}
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="text-white underline decoration-white/20 underline-offset-4"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                    .
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-zinc-950/80">
              <CardHeader>
                <CardTitle className="text-lg">Policies</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Link href="/policies#terms">
                  <Button
                    variant="outline"
                    className="border-white/10 bg-transparent text-white hover:border-primary/50 hover:text-primary"
                  >
                    Terms
                  </Button>
                </Link>
                <Link href="/policies#privacy">
                  <Button
                    variant="outline"
                    className="border-white/10 bg-transparent text-white hover:border-primary/50 hover:text-primary"
                  >
                    Privacy
                  </Button>
                </Link>
                <Link href="/policies#refund-policy">
                  <Button
                    variant="outline"
                    className="border-white/10 bg-transparent text-white hover:border-primary/50 hover:text-primary"
                  >
                    Refund Policy
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </PageHelpShell>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </p>
      <p className={cn("mt-2 text-sm text-white", mono && "font-mono text-xs")}>
        {value}
      </p>
    </div>
  );
}
