import { cn } from "@/lib/utils";

const sizeConfig = {
  sm: { h: 28, text: "text-lg", gap: "gap-1.5" },
  md: { h: 34, text: "text-2xl", gap: "gap-2" },
  lg: { h: 42, text: "text-3xl", gap: "gap-2.5" },
} as const;

export function ProConnectivLogo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const c = sizeConfig[size];

  return (
    <span className={cn("inline-flex items-center", c.gap, className)}>
      <img
        src="/logo.png"
        alt=""
        height={c.h}
        width={c.h}
        className="shrink-0 object-contain mix-blend-screen"
        aria-hidden="true"
      />
      <span className={cn("font-bold tracking-tighter", c.text)}>
        <span className="text-white">Pro</span>
        <span className="text-primary">Connectiv</span>
      </span>
    </span>
  );
}
