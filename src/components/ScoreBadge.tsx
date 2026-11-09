/** Sello con la nota de una cerveza (de 0 a 10). */
export function ScoreBadge({ value, size = 56 }: { value: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={`Nota ${value} sobre 10`}
      className="badge"
    >
      <circle cx="50" cy="50" r="47" fill="var(--cap)" stroke="var(--cap-edge)" strokeWidth="3" />
      <circle cx="50" cy="50" r="38" fill="var(--cap-light)" stroke="var(--cap-edge)" strokeWidth="1.5" />
      <text
        x="50"
        y="52"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={value.length > 2 ? 28 : 36}
        fontWeight="800"
        fill="var(--cap-ink)"
        style={{ fontStretch: "62%" }}
      >
        {value}
      </text>
    </svg>
  );
}
