export type RequestDuration = 15 | 30 | 60;

export interface RequestMeta {
  duration: RequestDuration;
  userTags: string[];
}

const VALID_DURATIONS: RequestDuration[] = [15, 30, 60];

export function buildSkillsField(meta: {
  duration: RequestDuration;
  tags?: string;
}): string {
  const parts: string[] = [`duration:${meta.duration}`, "type:video"];
  if (meta.tags) {
    const tags = meta.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t && !t.includes(":"));
    parts.push(...tags);
  }
  return parts.join(",");
}

export function parseRequestMeta(
  skills: string | null | undefined,
): RequestMeta {
  const userTags: string[] = [];
  let duration: RequestDuration = 30;

  if (!skills) {
    return { duration, userTags };
  }

  for (const part of skills.split(",").map((s) => s.trim()).filter(Boolean)) {
    if (part.startsWith("duration:")) {
      const d = parseInt(part.slice("duration:".length), 10);
      if (VALID_DURATIONS.includes(d as RequestDuration)) {
        duration = d as RequestDuration;
      }
    } else if (part.startsWith("type:")) {
      continue;
    } else {
      userTags.push(part);
    }
  }

  return { duration, userTags };
}

export function formatDurationLabel(duration: RequestDuration): string {
  return `${duration} min video session`;
}

export const DURATION_OPTIONS: {
  value: RequestDuration;
  label: string;
  desc: string;
}[] = [
  { value: 15, label: "15 min", desc: "Quick question" },
  { value: 30, label: "30 min", desc: "Standard session" },
  { value: 60, label: "60 min", desc: "Deep dive" },
];
