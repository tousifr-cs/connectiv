import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format-currency";
import {
  formatDurationLabel,
  parseRequestMeta,
} from "@/lib/request-meta";
import type { RequestPreview } from "@/lib/demo-requests";
import { cn } from "@/lib/utils";
import { ArrowRight, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RequestPreviewCardProps {
  request: RequestPreview;
  className?: string;
  statusLabel?: string;
  statusClassName?: string;
}

export function RequestPreviewCard({
  request,
  className,
  statusLabel,
  statusClassName,
}: RequestPreviewCardProps) {
  const meta = parseRequestMeta(request.skills);
  const skills = meta.userTags;
  const href = `/requests/${request.id}`;

  return (
    <Link href={href}>
      <article
        className={cn(
          "rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 hover:border-zinc-600 transition-colors cursor-pointer group",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {statusLabel && (
                <Badge
                  variant="outline"
                  className={cn("capitalize", statusClassName)}
                >
                  {statusLabel}
                </Badge>
              )}
              {request.isDemo && (
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase tracking-wider border-zinc-700 text-zinc-500"
                >
                  Sample
                </Badge>
              )}
              {request.category && (
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                  {request.category}
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors">
              {request.title}
            </h3>
            <p className="text-sm text-zinc-500 mt-2 line-clamp-2">
              {request.description}
            </p>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-zinc-100">
              {formatMoney(request.budgetAmount, request.currency)}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {formatDurationLabel(meta.duration)}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800/80 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {request.proposalCount} offer{request.proposalCount !== 1 ? "s" : ""}
          </span>
          <span>
            Posted{" "}
            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
          </span>
          <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
        </div>
      </article>
    </Link>
  );
}
