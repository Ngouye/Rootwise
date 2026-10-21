import { FileText, MonitorPlay, PlayCircle, ScrollText } from "lucide-react";
import type { LessonType } from "@/lib/courses";

const ICONS = { TEXT: ScrollText, VIDEO: PlayCircle, PDF: FileText, YOUTUBE: MonitorPlay } satisfies Record<LessonType, unknown>;

export function LessonIcon({ type, className }: { type: LessonType; className?: string }) {
  const Icon = ICONS[type];
  return <Icon className={className ?? "size-4 shrink-0 text-muted-foreground"} aria-hidden />;
}
