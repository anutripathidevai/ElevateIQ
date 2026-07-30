import Link from "next/link";
import { CheckCircle2, PlayCircle } from "lucide-react";
import type { Course } from "@/lib/dashboard-data";
import { ACCENT_STYLES } from "@/lib/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./primitives";

/** Rich course tile: progress, curriculum stats, certificate flag + Continue. */
export function CourseCard({ course }: { course: Course }) {
  const a = ACCENT_STYLES[course.accent];
  const Icon = course.icon;
  const stats = [
    { label: "lessons", value: course.lessons },
    { label: "quizzes", value: course.quizzes },
    { label: "labs", value: course.labs },
  ];
  return (
    <article
      id={course.anchor}
      className="flex h-full scroll-mt-20 flex-col rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("flex h-11 w-11 items-center justify-center rounded-lg", a.bg)}>
            <Icon className={cn("h-6 w-6", a.text)} />
          </span>
          <div>
            <h3 className="font-semibold leading-tight">{course.title}</h3>
            <p className="text-xs text-muted-foreground">{course.category}</p>
          </div>
        </div>
        {course.certificate && (
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-medium", a.bg, a.text)}>
            <CheckCircle2 className="h-3 w-3" /> Certificate
          </span>
        )}
      </div>

      <p className="mb-4 text-sm text-muted-foreground">{course.description}</p>

      <div className="mb-4 flex gap-4 text-center text-xs">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-base font-bold">{s.value}</p>
            <p className="text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Next: {course.next}</span>
          <span className="font-semibold">{course.progress}%</span>
        </div>
        <ProgressBar value={course.progress} accent={course.accent} />
        <Link
          href={course.href ?? `/learning#${course.anchor}`}
          className={cn(buttonVariants({ size: "sm" }), "mt-2 w-full")}
        >
          <PlayCircle className="h-4 w-4" />
          {course.progress > 0 ? "Continue" : "Start Course"}
        </Link>
      </div>
    </article>
  );
}
