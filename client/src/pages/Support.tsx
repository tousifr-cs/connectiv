import { Link, useRoute } from "wouter";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHelpShell } from "@/components/PageHelpShell";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUPPORT_EMAIL = "proconnectivv@gmail.com";

const ARTICLES = [
  {
    slug: "posting",
    title: "How posting a request works",
    summary: "Post a short video session request and let pros offer to help.",
    body: `Post what you need in one form: title, details, session length (15–60 minutes), and budget. Your request goes live on the board. Pros submit offers. You pick one, pay into escrow, and schedule your video session. You are not charged until you choose a pro.`,
  },
  {
    slug: "escrow",
    title: "How escrow protects you",
    summary: "Your payment is held until the session is complete.",
    body: `ProConnectiv holds your payment in escrow after you pay. The pro is not paid until the video session is marked complete. If the session cannot happen, contact support for a refund review. During beta, payments use secure hosted checkout and are reconciled by our team.`,
  },
  {
    slug: "video-session",
    title: "What happens during a video session",
    summary: "Join a secure ProConnectiv video room when payment is confirmed.",
    body: `After payment and pro acceptance, both sides get a Join Session link. Sessions use encrypted video inside ProConnectiv. Stay for your booked duration (15, 30, or 60 minutes). When done, the pro marks the session complete and payout processing begins.`,
  },
  {
    slug: "payments",
    title: "When you get charged and refunded",
    summary: "You only pay after picking a pro.",
    body: `Browsing and posting requests is free. You pay only after you pick a pro and proceed to checkout. Refunds are reviewed if a pro declines, the session cannot be delivered, or there is a clear delivery issue. Completed sessions are generally non-refundable.`,
  },
  {
    slug: "for-pros",
    title: "For pros: offer help and get paid",
    summary: "Browse open requests, submit an offer, deliver the session.",
    body: `Create a pro profile, browse open requests, and submit an offer with a short message. If the client picks you, they pay into escrow. Accept the booking, join the video session, then mark it complete. Payout is processed after completion minus the platform fee.`,
  },
  {
    slug: "contact",
    title: "Contact support",
    summary: "We're here to help clients and pros.",
    body: `Email us at ${SUPPORT_EMAIL} for payment issues, disputes, account help, or technical problems with video sessions. Include your booking or request reference when possible.`,
  },
] as const;

const HUB_FAQS = [
  {
    question: "Do I pay to post a request?",
    answer: "No. Posting is free. You only pay after you pick a pro.",
  },
  {
    question: "How long are sessions?",
    answer: "Requests are for 15, 30, or 60 minute video sessions.",
  },
  {
    question: "When does the pro get paid?",
    answer: "After the session is marked complete and escrow is released.",
  },
];

export default function Support() {
  const [, params] = useRoute("/support/:slug?");
  const slug = params?.slug;
  const article = slug ? ARTICLES.find((a) => a.slug === slug) : null;

  if (slug && !article) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <p className="text-zinc-400">Article not found.</p>
          <Link href="/support">
            <Button variant="outline" className="mt-4 border-zinc-700">
              Back to support
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  if (article) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <PageHelpShell faqs={HUB_FAQS} chatSubject={`Support: ${article.title}`}>
          <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
            <Link
              href="/support"
              className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-300 mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Support
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>
            <p className="mt-4 text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {article.body}
            </p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-block mt-8">
              <Button className="bg-primary text-primary-foreground">
                <Mail className="mr-2 h-4 w-4" />
                Email support
              </Button>
            </a>
          </main>
        </PageHelpShell>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <PageHelpShell faqs={HUB_FAQS}>
        <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">
            Help center
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Support &amp; guides
          </h1>
          <p className="mt-3 text-sm text-zinc-500">
            Everything you need to post requests, use escrow, and run video
            sessions on ProConnectiv.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {ARTICLES.map((a) => (
              <Link
                key={a.slug}
                href={`/support/${a.slug}`}
                className="block rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 transition-colors hover:border-zinc-600"
              >
                <h2 className="font-semibold text-zinc-100">{a.title}</h2>
                <p className="mt-2 text-sm text-zinc-500">{a.summary}</p>
              </Link>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-950/60 p-6">
            <h2 className="font-semibold">Still need help?</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Email {SUPPORT_EMAIL} — we help both clients and pros.
            </p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-block mt-4">
              <Button variant="outline" className="border-zinc-700">
                <Mail className="mr-2 h-4 w-4" />
                Contact support
              </Button>
            </a>
          </div>
        </main>
      </PageHelpShell>
      <SiteFooter />
    </div>
  );
}
