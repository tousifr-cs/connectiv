import type { ReactElement } from "react";
import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Mail, Twitter } from "lucide-react";
import { ProConnectivLogo } from "@/components/ProConnectivLogo";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function SignalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3.14.69 4.22 1.78l-1.42 1.42A3.934 3.934 0 0012 7c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.73-.21-1.41-.56-2l1.45-1.45A5.96 5.96 0 0118 11c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6zm0 4a2 2 0 100 4 2 2 0 000-4z" />
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
  { id: "facebook", name: "Facebook", icon: (p) => <Facebook {...p} />, href: "https://www.facebook.com/", kind: "external" },
  { id: "instagram", name: "Instagram", icon: (p) => <Instagram {...p} />, href: "https://www.instagram.com/", kind: "external" },
  { id: "linkedin", name: "LinkedIn", icon: (p) => <Linkedin {...p} />, href: "https://www.linkedin.com/", kind: "external" },
  { id: "x", name: "X", icon: (p) => <Twitter {...p} />, href: "https://x.com/", kind: "external" },
  { id: "telegram", name: "Telegram", icon: TelegramIcon, href: "https://t.me/", kind: "external" },
  { id: "signal", name: "Signal", icon: SignalIcon, href: "https://signal.org/", kind: "external" },
  { id: "whatsapp", name: "WhatsApp", icon: WhatsAppIcon, href: "https://www.whatsapp.com/", kind: "external" },
  { id: "email", name: "Email", icon: (p) => <Mail {...p} />, href: "/contact", kind: "internal" },
];

export function SiteFooter() {
  return (
    <footer className="py-12 border-t border-zinc-800 bg-black">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 block">
              <ProConnectivLogo size="sm" />
            </Link>
            <p className="text-zinc-500 text-sm max-w-xs">
              ProConnect helps you strategically reconnect with people you value.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li>
                <Link href="/about" className="hover:text-zinc-200 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-zinc-200 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li>
                <Link
                  href="/terms"
                  className="hover:text-zinc-200 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-zinc-200 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Social</h4>
            <div className="flex flex-wrap gap-4 text-zinc-500">
              {SOCIAL_PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                const className = "w-5 h-5";

                if (platform.kind === "internal") {
                  return (
                    <Link
                      key={platform.id}
                      href={platform.href}
                      aria-label={platform.name}
                      className="hover:text-zinc-200 transition-colors"
                    >
                      <Icon className={className} />
                    </Link>
                  );
                }

                return (
                  <a
                    key={platform.id}
                    href={platform.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={platform.name}
                    className="hover:text-zinc-200 transition-colors inline-flex items-center"
                  >
                    <Icon className={className} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900 text-center text-zinc-600 text-xs">
          © {new Date().getFullYear()} ProConnectiv. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

