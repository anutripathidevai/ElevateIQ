export function ScoreRing({
  score,
  size = 72,
}: {
  score: number;
  size?: number;
}) {
  const stroke = 6;
  const r = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const offset = circumference - (pct / 100) * circumference;
  const color =
    pct >= 85
      ? "hsl(var(--success))"
      : pct >= 60
        ? "hsl(var(--warning))"
        : "hsl(var(--danger))";

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="fill-foreground text-lg font-bold"
      >
        {pct}
      </text>
    </svg>
  );
}
