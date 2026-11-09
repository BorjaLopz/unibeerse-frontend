/** Marca de Unibeerse: una "U" que es también un vaso de cerveza con su espuma. Mismo dibujo que public/favicon.svg. */
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" className="logo">
      <rect width="100" height="100" rx="22" fill="var(--logo-bg)" />
      <g transform="translate(50 52) scale(1.22) translate(-50 -52)">
      <path d="M31 38V60a19 19 0 0 0 38 0V38Z" fill="var(--cap)" stroke="var(--logo-foam)" strokeWidth="4.5" strokeLinejoin="round" />
      <g fill="var(--logo-foam)">
        <circle cx="37.5" cy="34" r="8" />
        <circle cx="50" cy="29" r="10" />
        <circle cx="62.5" cy="34" r="8" />
        <rect x="29" y="33" width="42" height="8" rx="3" />
      </g>
      </g>
    </svg>
  );
}
