"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LLDFlashcard } from "../types";

/**
 * A grid of click-to-flip flashcards for quick revision. Each card shows a
 * prompt on the front and the answer on the back; clicking (or Enter/Space)
 * toggles the flip. Pure client interaction, no dependencies.
 */
export function Flashcards({ cards }: { cards: LLDFlashcard[] }) {
  if (cards.length === 0) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cards.map((card, i) => (
        <Flashcard key={i} card={card} />
      ))}
    </div>
  );
}

function Flashcard({ card }: { card: LLDFlashcard }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      className={cn(
        "group relative flex min-h-[7.5rem] w-full flex-col justify-between rounded-xl border p-4 text-left transition-colors",
        flipped
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card hover:border-primary/30 hover:bg-muted/30",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {flipped ? "Answer" : "Prompt"}
        </span>
        <RotateCw className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className={cn("mt-2 text-sm", flipped ? "" : "font-medium")}>
        {flipped ? card.back : card.front}
      </p>
    </button>
  );
}
