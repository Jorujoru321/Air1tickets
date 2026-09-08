import type { HeroTheme } from "@/data/types";
import { hashString, mulberry32 } from "@/lib/flights/mock/rng";
import { cn } from "@/lib/utils";

/**
 * Generated, deterministic SVG scenery for destination cards and heroes.
 * No photography needed: each theme draws a stylised landscape (skyline,
 * beach, mountains…) on the destination's gradient, seeded by `seed` so the
 * same city always gets the same art. Swap for real photos by passing `image`.
 */
export interface DestinationArtProps {
  theme: HeroTheme;
  gradient: [string, string];
  seed: string;
  className?: string;
  /** Optional real photo URL; when set it replaces the generated scene. */
  image?: string;
  alt?: string;
  priority?: boolean;
}

export function DestinationArt({ theme, gradient, seed, className, image, alt = "" }: DestinationArtProps) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={alt} className={cn("h-full w-full object-cover", className)} loading="lazy" />;
  }
  const rnd = mulberry32(hashString(seed));
  const id = `g${hashString(seed).toString(36)}`;
  const [c1, c2] = gradient;
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className={cn("h-full w-full", className)} role="img" aria-label={alt || undefined} aria-hidden={alt ? undefined : true}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${id}-sky)`} />
      {renderScene(theme, rnd)}
      <rect width="400" height="240" fill={`url(#${id}-fade)`} />
    </svg>
  );
}

type R = () => number;

function sun(rnd: R, night = false) {
  const cx = 60 + rnd() * 280;
  const cy = 40 + rnd() * 50;
  const r = 16 + rnd() * 14;
  return (
    <g key="sun">
      <circle cx={cx} cy={cy} r={r * 2.2} fill="#fff" opacity={night ? 0.08 : 0.12} />
      <circle cx={cx} cy={cy} r={r} fill="#fff" opacity={night ? 0.85 : 0.9} />
    </g>
  );
}

function clouds(rnd: R, n = 3) {
  const items = [];
  for (let i = 0; i < n; i++) {
    const x = rnd() * 380;
    const y = 30 + rnd() * 70;
    const s = 0.6 + rnd() * 0.8;
    items.push(
      <g key={`c${i}`} transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity={0.28 + rnd() * 0.25}>
        <ellipse cx="0" cy="0" rx="26" ry="10" />
        <ellipse cx="14" cy="-6" rx="16" ry="11" />
        <ellipse cx="-14" cy="-4" rx="14" ry="9" />
      </g>,
    );
  }
  return items;
}

function skyline(rnd: R, opts: { baseY: number; lit?: boolean; color?: string; opacity?: number; count?: number; maxH?: number }) {
  const { baseY, lit = false, color = "#0b1d3a", opacity = 0.9, count = 22, maxH = 120 } = opts;
  const rects = [];
  let x = -10;
  for (let i = 0; i < count && x < 420; i++) {
    const w = 12 + rnd() * 26;
    const h = 20 + rnd() * maxH;
    const y = baseY - h;
    rects.push(<rect key={`b${i}`} x={x} y={y} width={w} height={h + 10} fill={color} opacity={opacity} />);
    if (rnd() > 0.7) rects.push(<rect key={`s${i}`} x={x + w / 2 - 1.5} y={y - 14} width="3" height="14" fill={color} opacity={opacity} />);
    if (lit) {
      for (let wy = y + 8; wy < baseY - 6; wy += 9) {
        for (let wx = x + 3; wx < x + w - 4; wx += 6) {
          if (rnd() > 0.45) rects.push(<rect key={`w${i}-${wx}-${wy}`} x={wx} y={wy} width="2.5" height="4" fill="#ffd166" opacity={0.5 + rnd() * 0.5} />);
        }
      }
    }
    x += w + 2 + rnd() * 4;
  }
  return <g key={`sky-${baseY}`}>{rects}</g>;
}

function ridge(rnd: R, baseY: number, amp: number, color: string, opacity: number, snow = false) {
  const pts: string[] = [`0,${baseY + 40}`];
  const peaks: [number, number][] = [];
  let x = 0;
  while (x <= 400) {
    const y = baseY - rnd() * amp;
    pts.push(`${x},${y}`);
    peaks.push([x, y]);
    x += 30 + rnd() * 40;
  }
  pts.push(`400,${baseY + 40}`);
  return (
    <g key={`ridge-${baseY}`}>
      <polygon points={pts.join(" ")} fill={color} opacity={opacity} />
      {snow &&
        peaks
          .filter((p) => p[1] < baseY - amp * 0.55)
          .map(([px, py], i) => <polygon key={i} points={`${px},${py} ${px - 9},${py + 14} ${px + 9},${py + 14}`} fill="#fff" opacity="0.85" />)}
    </g>
  );
}

function sea(baseY: number) {
  const waves = [];
  for (let i = 0; i < 5; i++) {
    const y = baseY + 18 + i * 12;
    waves.push(<path key={i} d={`M0 ${y} Q 25 ${y - 4} 50 ${y} T 100 ${y} T 150 ${y} T 200 ${y} T 250 ${y} T 300 ${y} T 350 ${y} T 400 ${y}`} stroke="#fff" strokeOpacity={0.35 - i * 0.05} strokeWidth="1.5" fill="none" />);
  }
  return (
    <g key="sea">
      <rect x="0" y={baseY} width="400" height={240 - baseY} fill="#0b1d3a" opacity="0.28" />
      {waves}
    </g>
  );
}

function palm(x: number, y: number, s: number, flip = false) {
  const t = `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`;
  return (
    <g key={`palm-${x}-${y}`} transform={t} fill="#0b1d3a" opacity="0.9">
      <path d="M0 0 C -4 -30 -6 -60 2 -90 L 6 -90 C 0 -60 2 -30 6 0 Z" />
      {[0, 40, 80, 120, 160, 200, 240, 290].map((deg) => (
        <path key={deg} transform={`translate(4 -90) rotate(${deg - 70})`} d="M0 0 C 12 -6 28 -4 40 6 C 26 6 12 4 0 0 Z" />
      ))}
    </g>
  );
}

function dunes(rnd: R) {
  const layers = [];
  for (let i = 0; i < 3; i++) {
    const y = 150 + i * 26;
    const a = 20 + rnd() * 20;
    layers.push(<path key={i} d={`M0 ${y + a} C 80 ${y - a} 160 ${y + a} 240 ${y - a / 2} S 360 ${y + a} 400 ${y - a} L 400 240 L 0 240 Z`} fill="#0b1d3a" opacity={0.18 + i * 0.14} />);
  }
  return <g key="dunes">{layers}</g>;
}

function renderScene(theme: HeroTheme, rnd: R) {
  switch (theme) {
    case "city":
      return [sun(rnd), ...clouds(rnd, 3), skyline(rnd, { baseY: 210, opacity: 0.35, maxH: 90, count: 18 }), skyline(rnd, { baseY: 240, opacity: 0.85, maxH: 140 })];
    case "nightlife":
      return [sun(rnd, true), skyline(rnd, { baseY: 215, opacity: 0.5, maxH: 100, count: 18 }), skyline(rnd, { baseY: 240, lit: true, opacity: 0.95, maxH: 150 })];
    case "beach":
      return [sun(rnd), ...clouds(rnd, 2), sea(150), <rect key="sand" x="0" y="205" width="400" height="40" fill="#fff" opacity="0.28" />, palm(60 + rnd() * 60, 212, 0.75), palm(300 + rnd() * 60, 214, 0.6, true)];
    case "tropical":
      return [sun(rnd), ...clouds(rnd, 2), ridge(rnd, 165, 60, "#0b1d3a", 0.3), sea(170), palm(40 + rnd() * 40, 236, 0.9), palm(330 + rnd() * 40, 238, 0.8, true), palm(190 + rnd() * 40, 240, 0.5)];
    case "mountain":
      return [sun(rnd), ...clouds(rnd, 2), ridge(rnd, 190, 110, "#0b1d3a", 0.35, true), ridge(rnd, 215, 80, "#0b1d3a", 0.6, true), ridge(rnd, 240, 40, "#0b1d3a", 0.85)];
    case "desert":
      return [sun(rnd), dunes(rnd), <g key="mesa" fill="#0b1d3a" opacity="0.5"><path d="M40 170 L60 130 L120 130 L135 170 Z" /><path d="M300 175 L312 145 L350 145 L365 175 Z" /></g>];
    case "historic":
      return [
        sun(rnd),
        ...clouds(rnd, 2),
        skyline(rnd, { baseY: 220, opacity: 0.3, maxH: 60, count: 16 }),
        <g key="monument" fill="#0b1d3a" opacity="0.9">
          <path d="M140 240 V 190 H 260 V 240 Z" />
          <path d="M150 190 V 150 H 250 V 190 Z" />
          <path d="M200 105 C 165 105 150 130 150 152 H 250 C 250 130 235 105 200 105 Z" />
          {[158, 178, 198, 218, 238].map((x) => (
            <rect key={x} x={x} y="196" width="6" height="44" fill="#fff" opacity="0.18" />
          ))}
          <rect x="196" y="88" width="8" height="20" />
        </g>,
      ];
    case "nature":
    default:
      return [
        sun(rnd),
        ...clouds(rnd, 3),
        ridge(rnd, 200, 50, "#0b1d3a", 0.3),
        <g key="trees" fill="#0b1d3a" opacity="0.85">
          {Array.from({ length: 14 }).map((_, i) => {
            const x = i * 30 + rnd() * 20;
            const h = 40 + rnd() * 50;
            return <path key={i} d={`M${x} 240 L${x + 12} ${240 - h} L${x + 24} 240 Z`} />;
          })}
        </g>,
      ];
  }
}
