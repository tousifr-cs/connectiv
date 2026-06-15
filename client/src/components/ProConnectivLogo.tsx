import { cn } from "@/lib/utils";

const sizeConfig = {
  nav: {
    text: "text-[17px] leading-none",
  },
  sm: {
    text: "text-lg leading-none",
  },
  md: {
    text: "text-2xl leading-none",
  },
  lg: {
    text: "text-3xl leading-none",
  },
  footer: {
    text: "text-3xl sm:text-4xl md:text-[2.75rem] leading-none",
  },
} as const;

export function ProConnectivLogo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "nav" | "sm" | "md" | "lg" | "footer";
}) {
  const c = sizeConfig[size];

  return (
    <span
      className={cn(
        "font-normal tracking-normal text-white lowercase",
        c.text,
        className,
      )}
    >
      proconnectiv
    </span>
  );
}
