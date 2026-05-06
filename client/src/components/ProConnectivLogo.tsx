import { cn } from "@/lib/utils";

const sizeConfig = {
  sm: {
    mark: "h-10 w-auto max-h-10 sm:h-11 sm:max-h-11",
    text: "text-lg",
    gap: "gap-3",
  },
  md: {
    mark: "h-12 w-auto max-h-12 md:h-14 md:max-h-14",
    text: "text-2xl",
    gap: "gap-3.5",
  },
  lg: {
    mark: "h-16 w-auto max-h-16 sm:h-20 sm:max-h-20",
    text: "text-3xl",
    gap: "gap-4",
  },
} as const;

export function ProConnectivLogo({
  className,
  size = "md",
  showWordmark = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
}) {
  const c = sizeConfig[size];

  return (
    <span className={cn("inline-flex items-center", c.gap, className)}>
      <img
        src="/proconnectiv-monogram.png"
        alt=""
        width={1024}
        height={571}
        className={cn(
          "shrink-0 object-contain object-left [image-rendering:-webkit-optimize-contrast]",
          c.mark,
        )}
        aria-hidden
      />
      {showWordmark && (
        <span className={cn("font-bold tracking-tighter", c.text)}>
          <span className="text-zinc-100">Pro</span>
          <span className="text-zinc-300">Connectiv</span>
        </span>
      )}
    </span>
  );
}
