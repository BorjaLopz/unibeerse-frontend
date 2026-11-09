import { useId } from "react";

/** Chapa de cerveza (21 dientes). Con "value" muestra la nota dentro; sin él, es solo la marca. */
export function CrownCap({ value, size = 56 }: { value?: string; size?: number }) {
  const id = useId();
  const teeth = 21;
  const points: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 === 0 ? 48 : 43;
    const a = (Math.PI * i) / teeth - Math.PI / 2;
    points.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role={value ? "img" : undefined}
      aria-label={value ? `Nota ${value} sobre 10` : undefined}
      aria-hidden={value ? undefined : true}
      className="cap"
    >
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="var(--cap-light)" />
          <stop offset="1" stopColor="var(--cap)" />
        </radialGradient>
      </defs>
      <polygon points={points.join(" ")} fill={`url(#${id})`} stroke="var(--cap-edge)" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="31" fill="none" stroke="var(--cap-edge)" strokeWidth="1.5" opacity=".55" />
      {value && (
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={value.length > 2 ? 26 : 32}
          fontWeight="800"
          fill="var(--cap-ink)"
          style={{ fontStretch: "70%" }}
        >
          {value}
        </text>
      )}
    </svg>
  );
}
