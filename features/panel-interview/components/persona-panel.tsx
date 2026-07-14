import { listPersonas } from "../personas";

/** Presentational grid introducing the three interviewer personas. */
export function PersonaPanel() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {listPersonas().map((persona) => (
        <div
          key={persona.id}
          className="flex flex-col rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xl"
            >
              {persona.glyph}
            </span>
            <div>
              <h3 className="font-semibold leading-tight">{persona.name}</h3>
              <p className="text-xs text-muted-foreground">{persona.title}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{persona.tagline}</p>
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {persona.goals.map((goal, i) => (
              <li key={i} className="flex gap-1.5">
                <span aria-hidden className="text-primary">
                  •
                </span>
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
