import { cn } from "@/lib/utils";

const sizeConfig = {
  sm: { h: 24, text: "text-lg", gap: "gap-1.5" },
  md: { h: 30, text: "text-2xl", gap: "gap-2" },
  lg: { h: 36, text: "text-3xl", gap: "gap-2.5" },
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
      <svg
        viewBox="0 0 48 28"
        height={c.h}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <path d="M14 2L2 14L14 26L20 26L8 14L20 2Z" fill="#4a4a4a" />
        <path d="M27 2L15 14L27 26L33 26L21 14L33 2Z" fill="#808080" />
        <path d="M40 2L28 14L40 26L46 26L34 14L46 2Z" fill="#d8d8d8" />
      </svg>
      <span className={cn("font-bold tracking-tighter", c.text)}>
        <span className="text-white">Pro</span>
        <span className="text-primary">Connectiv</span>
      </span>
    </span>
  );
}
