import type { ReactElement } from "react";
import { Link } from "wouter";
import {
  Github,
  Instagram,
  Linkedin,
  Mail,
  Twitter,
} from "lucide-react";
import { ProConnectivLogo } from "@/components/ProConnectivLogo";
import { cn } from "@/lib/utils";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  );
}

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

type SocialPlatform = {
  id: string;
  name: string;
  icon: (props: { className?: string }) => ReactElement;
  href: string;
  kind: "internal" | "external";
};

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: "x", name: "X", icon: (p) => <Twitter {...p} />, href: "https://x.com/", kind: "external" },
  { id: "linkedin", name: "LinkedIn", icon: (p) => <Linkedin {...p} />, href: "https://www.linkedin.com/", kind: "external" },
  { id: "instagram", name: "Instagram", icon: (p) => <Instagram {...p} />, href: "https://www.instagram.com/", kind: "external" },
  { id: "reddit", name: "Reddit", icon: RedditIcon, href: "https://www.reddit.com/", kind: "external" },
  { id: "telegram", name: "Telegram", icon: TelegramIcon, href: "https://t.me/", kind: "external" },
  { id: "github", name: "GitHub", icon: (p) => <Github {...p} />, href: "https://github.com/", kind: "external" },
];

type FooterLinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterSection = {
  title: string;
  links: FooterLinkItem[];
};

const FOOTER_COLUMNS: FooterSection[][] = [
  [
    {
      title: "Platform",
      links: [
        { label: "Post a request", href: "/post" },
        { label: "Browse experts", href: "/pros" },
        { label: "Open request board", href: "/requests" },
        { label: "Direct connect", href: "/request" },
      ],
    },
    {
      title: "For experts",
      links: [
        { label: "Become a pro", href: "/become-pro" },
        { label: "For pros hub", href: "/for-pros" },
        { label: "Expert dashboard", href: "/dashboard" },
        { label: "Browse open work", href: "/requests" },
      ],
    },
  ],
  [
    {
      title: "Use cases",
      links: [
        { label: "Posting a request", href: "/support/posting" },
        { label: "Escrow protection", href: "/support/escrow" },
        { label: "Video sessions", href: "/support/video-session" },
        { label: "Payments & refunds", href: "/support/payments" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Help center", href: "/support" },
        { label: "My bookings", href: "/inbox" },
        { label: "Contact support", href: "/support/contact" },
        { label: "Policies overview", href: "/policies" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of service", href: "/terms" },
        { label: "Privacy policy", href: "/privacy" },
        { label: "Legal terms home", href: "/policies" },
      ],
    },
  ],
  [
    {
      title: "Support",
      links: [
        { label: "Help center", href: "/support" },
        { label: "How posting works", href: "/support/posting" },
        { label: "For pros guide", href: "/support/for-pros" },
        { label: "Contact support", href: "/contact" },
      ],
    },
  ],
  [
    {
      title: "Company",
      links: [
        { label: "About ProConnectiv", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Use ProConnectiv",
      links: [
        { label: "Sign in", href: "/auth" },
        { label: "Create account", href: "/auth" },
        { label: "Your profile", href: "/profile" },
        { label: "Post a request", href: "/post" },
      ],
    },
  ],
];

function FooterHeading({ children }: { children: string }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
      {children}
    </h3>
  );
}

function FooterLink({ link }: { link: FooterLinkItem }) {
  const className =
    "text-sm text-zinc-400 hover:text-white transition-colors leading-relaxed";

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={className}>
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

function FooterColumn({ sections }: { sections: FooterSection[] }) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.title}>
          <FooterHeading>{section.title}</FooterHeading>
          <ul className="mt-4 space-y-2.5">
            {section.links.map((link) => (
              <li key={link.label}>
                <FooterLink link={link} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function SocialIconLink({ platform }: { platform: SocialPlatform }) {
  const Icon = platform.icon;
  const className =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors";

  if (platform.kind === "internal") {
    return (
      <Link href={platform.href} aria-label={platform.name} className={className}>
        <Icon className="h-[18px] w-[18px]" />
      </Link>
    );
  }

  return (
    <a
      href={platform.href}
      target="_blank"
      rel="noreferrer"
      aria-label={platform.name}
      className={className}
    >
      <Icon className="h-[18px] w-[18px]" />
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-12 md:py-16">
        <div className="flex flex-col gap-8 pb-10 md:pb-12 border-b border-zinc-800/80 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="inline-block w-fit">
            <ProConnectivLogo size="footer" />
          </Link>

          <div className="flex flex-wrap items-center gap-1 sm:justify-end">
            {SOCIAL_PLATFORMS.map((platform) => (
              <SocialIconLink key={platform.id} platform={platform} />
            ))}
            <Link
              href="/contact"
              aria-label="Email"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <Mail className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>

        <div
          className={cn(
            "grid gap-10 pt-10 md:pt-12",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
          )}
        >
          {FOOTER_COLUMNS.map((sections) => (
            <FooterColumn key={sections[0]?.title} sections={sections} />
          ))}
        </div>

        <div className="mt-12 md:mt-16 pt-8 border-t border-zinc-800/80 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} ProConnectiv. All rights reserved.
          </p>
          <Link
            href="/privacy"
            className="inline-flex w-fit items-center justify-center rounded-full bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
          >
            Privacy preferences
          </Link>
        </div>
      </div>
    </footer>
  );
}
