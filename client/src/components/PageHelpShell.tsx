import { useState } from "react";
import { Link } from "wouter";
import { HelpCircle, MessageCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SUPPORT_EMAIL = "proconnectivv@gmail.com";

export interface PageFaqItem {
  question: string;
  answer: string;
}

interface PageHelpShellProps {
  children: React.ReactNode;
  faqs: PageFaqItem[];
  chatSubject?: string;
  className?: string;
}

export function PageHelpShell({
  children,
  faqs,
  chatSubject = "ProConnectiv support",
  className,
}: PageHelpShellProps) {
  const [faqOpen, setFaqOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(chatSubject)}`;

  return (
    <div className={cn("relative", className)}>
      {children}

      <aside className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {faqOpen && (
          <div className="w-[min(100vw-2rem,360px)] rounded-2xl border border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Quick help</p>
              <Link
                href="/support"
                className="text-xs text-primary hover:underline"
              >
                All articles
              </Link>
            </div>
            <div className="max-h-[280px] space-y-2 overflow-y-auto">
              {faqs.map((faq, i) => (
                <div
                  key={faq.question}
                  className="rounded-lg border border-zinc-800 bg-black/40"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium text-zinc-200"
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-zinc-500 transition-transform",
                        openIndex === i && "rotate-180",
                      )}
                    />
                  </button>
                  {openIndex === i && (
                    <p className="border-t border-zinc-800 px-3 py-2.5 text-xs leading-relaxed text-zinc-400">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-10 rounded-full border-zinc-700 bg-black/80 px-4 text-zinc-200 shadow-lg backdrop-blur"
            onClick={() => setFaqOpen((v) => !v)}
          >
            <HelpCircle className="mr-1.5 h-4 w-4" />
            FAQ
          </Button>
          <Button
            asChild
            size="sm"
            className="h-10 rounded-full bg-primary px-4 text-primary-foreground shadow-lg"
          >
            <a href={mailto}>
              <MessageCircle className="mr-1.5 h-4 w-4" />
              Chat
            </a>
          </Button>
        </div>
      </aside>
    </div>
  );
}
