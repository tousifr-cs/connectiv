import { Link } from "wouter";
import { BadgeDollarSign, CalendarClock, RefreshCw } from "lucide-react";

const CAPABILITIES = [
  {
    number: "01",
    title: "Payments",
    href: "/support/escrow",
    icon: RefreshCw,
  },
  {
    number: "02",
    title: "Scheduling",
    href: "/support",
    icon: CalendarClock,
  },
  {
    number: "03",
    title: "Sessions",
    href: "/post",
    icon: BadgeDollarSign,
  },
] as const;

export function CapabilitiesStaircase() {
  return (
    <section className="capabilities-staircase border-t border-zinc-900">
      <div
        className="capabilities-staircase-grid"
        aria-hidden
      />
      <div className="capabilities-staircase-glow capabilities-staircase-glow--left" aria-hidden />
      <div className="capabilities-staircase-glow capabilities-staircase-glow--right" aria-hidden />

      <div className="capabilities-staircase-inner">
        <header className="capabilities-staircase-header">
          <span className="capabilities-staircase-badge">
            <span className="capabilities-staircase-dot" aria-hidden />
            What ProConnectiv can do for you
          </span>
        </header>

        <div className="capabilities-staircase-list">
          {CAPABILITIES.map((item, index) => (
            <CapabilityRow key={item.number} item={item} step={index + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilityRow({
  item,
  step,
}: {
  item: (typeof CAPABILITIES)[number];
  step: number;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`capabilities-staircase-row capabilities-staircase-row--${step} group`}
    >
      <div className="capabilities-staircase-icon-wrap">
        <span className="capabilities-staircase-num">{item.number}</span>
        <div className="capabilities-staircase-icon-box">
          <Icon
            className="capabilities-staircase-icon"
            strokeWidth={1.15}
            aria-hidden
          />
        </div>
      </div>
      <h3 className="capabilities-staircase-title">{item.title}</h3>
    </Link>
  );
}
