"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function FilterBar({ tags }: { tags: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const difficulty = params.get("difficulty") ?? "";
  const activeTag = params.get("tag") ?? "";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={difficulty}
        onChange={(e) => setParam("difficulty", e.target.value)}
        aria-label="Filter by difficulty"
      >
        <option value="">All difficulties</option>
        <option value="EASY">Easy</option>
        <option value="MEDIUM">Medium</option>
        <option value="HARD">Hard</option>
      </Select>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setParam("tag", t === activeTag ? "" : t)}
            >
              <Badge
                variant={t === activeTag ? "default" : "outline"}
                className={cn(
                  "cursor-pointer",
                  t === activeTag && "ring-1 ring-ring",
                )}
              >
                {t}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
