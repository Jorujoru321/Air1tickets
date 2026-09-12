import type { HeroTheme } from "@/data/types";
import { hashString, mulberry32 } from "@/lib/flights/mock/rng";
import { cn } from "@/lib/utils";

/**
 * Destination imagery. When a real photograph is available it is used; the
 * generated scene below is the fallback.
 *
 * The fallback aims for an atmospheric editorial look rather than flat
 * clipart: a multi-stop sky, a sun with bloom, silhouette layers that fade
 * with distance (aerial perspective), haze between the layers, and a vignette.
 * Heroes additionally get film grain. Everything is seeded from `seed`, so a
 * given city always renders the same scene.
 *
 * To use photos, drop files at public/images/destinations/<slug>.jpg and list
 * the slug in src/data/photos.ts — see scripts/fetch-photos.mjs.
 */
export interface DestinationArtProps {
  theme: HeroTheme;
  gradient: [string, string];
  seed: string;
  className?: string;
  /** Real photo URL. When set it replaces the generated scene entirely. */
  image?: string;
  alt?: string;
  /** Above-the-fold: eager-loads the photo and adds grain to the fallback. */
  priority?: boolean;
}

export function DestinationArt({ theme, gradient, seed, className, image, alt = "", priority = false }: DestinationArtProps) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={alt}
        className={cn("h-full w-full object-cover", className)}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        {...(priority ? { fetchPriority: "high" as const } : {})}
      />
    );
  }
  const rnd = mulberry32(hashString(seed));
  const id = `g${hashString(seed).toString(36)}`;
  const p = palette(theme, gradient);

  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className={cn("h-full w-full", className)} role="img" aria-label={alt || undefined} aria-hidden={alt ? undefined : true}>
      <defs>
        {/* Sky: four stops give the light falloff a flat two-stop gradient can't. */}
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.skyTop} />
          <stop offset="0.45" stopColor={p.skyMid} />
          <stop offset="0.78" stopColor={p.skyLow} />
          <stop offset="1" stopColor={p.horizon} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={p.sun} stopOpacity="0.95" />
          <stop offset="0.35" stopColor={p.sun} stopOpacity="0.28" />
          <stop offset="1" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.horizon} stopOpacity="0" />
          <stop offset="1" stopColor={p.horizon} stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="0.55" stopColor="#000" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id={`${id}-vig`} cx="50%" cy="45%" r="75%">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.42" />
        </radialGradient>
        {priority && (
          <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(rnd() * 100)} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        )}
      </defs>

      <rect width="400" height="240" fill={`url(#${id}-sky)`} />
      {sunWithBloom(rnd, id, p)}
      {clouds(rnd, p)}
      {scene(theme, rnd, p)}
      {/* Haze on the horizon sells depth more than any single element. */}
      <rect y="120" width="400" height="120" fill={`url(#${id}-haze)`} opacity="0.5" />
      <rect width="400" height="240" fill={`url(#${id}-shade)`} />
      <rect width="400" height="240" fill={`url(#${id}-vig)`} />
      {priority && <rect width="400" height="240" filter={`url(#${id}-grain)`} opacity="0.055" />}
    </svg>
  );
}

type R = () => number;

interface Palette {
  skyTop: string;
  skyMid: string;
  skyLow: string;
  horizon: string;
  sun: string;
  /** Silhouette layers, far to near. */
  layers: [string, string, string];
  water: string;
  night: boolean;
}

/** Mix two hex colours. */
function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const out = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${out.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Build a believable light palette from the destination's two brand colours.
 * Distant layers sit close to the horizon colour (aerial perspective); near
 * layers are much darker, which is what makes the depth read.
 */
function palette(theme: HeroTheme, [c1, c2]: [string, string]): Palette {
  const night = theme === "nightlife";
  const warm = theme === "desert" || theme === "beach" || theme === "tropical";
  const sun = night ? "#cfe0ff" : warm ? "#ffd9a3" : "#fff0d0";
  const horizon = warm ? mix(c2, "#ffbf86", 0.5) : night ? mix(c2, "#2a3f77", 0.35) : mix(c2, "#e9f2ff", 0.45);
  return {
    skyTop: night ? mix(c1, "#04060f", 0.45) : mix(c1, "#000814", 0.18),
    skyMid: c1,
    skyLow: mix(c1, c2, 0.65),
    horizon,
    sun,
    layers: [mix(horizon, c1, 0.35), mix(c1, "#08101f", 0.45), mix(c1, "#05080f", 0.78)],
    water: mix(c2, "#0b2a45", 0.35),
    night,
  };
}

function sunWithBloom(rnd: R, id: string, p: Palette) {
  const cx = 70 + rnd() * 260;
  const cy = 42 + rnd() * 46;
  const r = 9 + rnd() * 7;
  return (
    <g key="sun">
      <circle cx={cx} cy={cy} r={r * 7} fill={`url(#${id}-glow)`} />
      <circle cx={cx} cy={cy} r={r} fill={p.sun} opacity={p.night ? 0.9 : 0.96} />
      <circle cx={cx} cy={cy} r={r * 1.7} fill={p.sun} opacity="0.16" />
    </g>
  );
}

/** Soft horizontal cloud bands — closer to real cloud shape than puffy circles. */
function clouds(rnd: R, p: Palette) {
  const n = 3 + Math.floor(rnd() * 3);
  const out = [];
  for (let i = 0; i < n; i++) {
    const y = 26 + rnd() * 74;
    const w = 60 + rnd() * 130;
    const h = 4 + rnd() * 7;
    const x = -30 + rnd() * 400;
    const o = 0.07 + rnd() * 0.13;
    out.push(<ellipse key={`c${i}`} cx={x} cy={y} rx={w / 2} ry={h} fill={p.night ? "#9fb6e8" : "#ffffff"} opacity={o} />);
    out.push(<ellipse key={`c${i}b`} cx={x + w * 0.22} cy={y + h * 0.5} rx={w / 3} ry={h * 0.7} fill={p.night ? "#9fb6e8" : "#ffffff"} opacity={o * 0.8} />);
  }
  return <g key="clouds">{out}</g>;
}

/** A city skyline with depth: three receding bands, lit windows at night. */
function skyline(rnd: R, p: Palette, baseY: number, color: string, opacity: number, count: number, maxH: number, lit: boolean) {
  const parts = [];
  let x = -14;
  let i = 0;
  while (x < 414) {
    const w = 12 + rnd() * 26;
    const h = 16 + rnd() * maxH;
    const y = baseY - h;
    parts.push(<rect key={`b${i}`} x={x} y={y} width={w} height={h} fill={color} opacity={opacity} />);
    // A slim spire or setback on a few towers reads as architecture, not bars.
    if (rnd() > 0.72) parts.push(<rect key={`s${i}`} x={x + w * 0.4} y={y - 10 - rnd() * 14} width={Math.max(1.5, w * 0.16)} height={14} fill={color} opacity={opacity} />);
    if (lit) {
      const rows = Math.floor(h / 9);
      const cols = Math.max(1, Math.floor(w / 8));
      for (let ry = 0; ry < rows; ry++) {
        for (let cxi = 0; cxi < cols; cxi++) {
          if (rnd() > 0.55) continue;
          parts.push(<rect key={`w${i}-${ry}-${cxi}`} x={x + 2.5 + cxi * 8} y={y + 5 + ry * 9} width={2.6} height={3.2} fill="#ffd98a" opacity={0.35 + rnd() * 0.5} />);
        }
      }
    }
    x += w + 2 + rnd() * 5;
    i++;
  }
  return <g key={`sky${baseY}${color}`}>{parts}</g>;
}

/** Mountain / hill band. */
function ridge(rnd: R, baseY: number, amp: number, color: string, opacity: number, snow: boolean) {
  const pts: string[] = [`0,${baseY}`];
  let peakX = 0;
  let peakY = baseY;
  for (let x = 0; x <= 400; x += 22) {
    const y = baseY - amp * (0.35 + rnd() * 0.65);
    if (y < peakY) {
      peakY = y;
      peakX = x;
    }
    pts.push(`${x},${y.toFixed(1)}`);
  }
  pts.push(`400,${baseY}`, `400,240`, `0,240`);
  return (
    <g key={`r${baseY}${color}`}>
      <polygon points={pts.join(" ")} fill={color} opacity={opacity} />
      {snow && <polygon points={`${peakX - 13},${peakY + 13} ${peakX},${peakY} ${peakX + 13},${peakY + 13} ${peakX + 5},${peakY + 9} ${peakX - 3},${peakY + 14}`} fill="#ffffff" opacity={0.72} />}
    </g>
  );
}

/** Water with a sun path and horizontal ripples. */
function water(rnd: R, p: Palette, baseY: number) {
  const lines = [];
  for (let i = 0; i < 16; i++) {
    const y = baseY + 4 + i * ((240 - baseY) / 16);
    const w = 26 + rnd() * 120;
    const x = rnd() * 360;
    lines.push(<rect key={`w${i}`} x={x} y={y} width={w} height={0.9} rx={0.45} fill="#ffffff" opacity={0.06 + rnd() * 0.12} />);
  }
  return (
    <g key="water">
      <rect y={baseY} width="400" height={240 - baseY} fill={p.water} />
      <rect y={baseY} width="400" height={240 - baseY} fill={p.sun} opacity="0.07" />
      {lines}
    </g>
  );
}

function palm(x: number, y: number, s: number, color: string, flip = false) {
  const d = flip ? -1 : 1;
  return (
    <g key={`p${x}${y}`} fill={color}>
      <path d={`M${x},${y} q${d * 2.5},${-s * 0.55} ${d * 1},${-s}`} stroke={color} strokeWidth={s * 0.075} fill="none" strokeLinecap="round" />
      {[-1, -0.45, 0.2, 0.75, 1].map((k, i) => (
        <path key={i} d={`M${x + d} ,${y - s} q${k * s * 0.5},${-s * 0.2} ${k * s * 0.72},${s * 0.12}`} stroke={color} strokeWidth={s * 0.055} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
}

function treeline(rnd: R, baseY: number, color: string, opacity: number) {
  const parts = [];
  for (let i = 0; i < 46; i++) {
    const x = rnd() * 410 - 5;
    const h = 10 + rnd() * 20;
    parts.push(<polygon key={i} points={`${x},${baseY} ${x + 5},${baseY - h} ${x + 10},${baseY}`} fill={color} opacity={opacity} />);
  }
  return <g key={`t${baseY}`}>{parts}</g>;
}

function scene(theme: HeroTheme, rnd: R, p: Palette) {
  const [far, mid, near] = p.layers;
  switch (theme) {
    case "city":
      return (
        <>
          {skyline(rnd, p, 176, far, 0.5, 0, 46, false)}
          {skyline(rnd, p, 202, mid, 0.85, 0, 66, false)}
          {skyline(rnd, p, 240, near, 1, 0, 84, false)}
        </>
      );
    case "nightlife":
      return (
        <>
          {skyline(rnd, p, 178, far, 0.55, 0, 48, false)}
          {skyline(rnd, p, 206, mid, 0.9, 0, 70, true)}
          {skyline(rnd, p, 240, near, 1, 0, 88, true)}
        </>
      );
    case "beach":
      return (
        <>
          {ridge(rnd, 150, 16, far, 0.35, false)}
          {water(rnd, p, 156)}
          <path d="M0,206 Q110,196 210,208 T400,202 L400,240 L0,240 Z" fill={mix(p.horizon, "#f6e3bd", 0.75)} opacity="0.95" />
          {palm(44, 214, 52, near)}
          {palm(366, 220, 44, near, true)}
        </>
      );
    case "tropical":
      return (
        <>
          {ridge(rnd, 146, 30, far, 0.4, false)}
          {treeline(rnd, 168, mid, 0.55)}
          {water(rnd, p, 174)}
          <path d="M0,214 Q140,204 260,214 T400,210 L400,240 L0,240 Z" fill={mix(p.horizon, "#f3dfb8", 0.7)} />
          {palm(58, 226, 58, near)}
          {palm(330, 232, 50, near, true)}
          {palm(300, 228, 38, near)}
        </>
      );
    case "mountain":
      return (
        <>
          {ridge(rnd, 138, 54, far, 0.45, true)}
          {ridge(rnd, 170, 46, mid, 0.75, true)}
          {ridge(rnd, 202, 34, near, 1, false)}
          {treeline(rnd, 238, near, 0.9)}
        </>
      );
    case "desert":
      return (
        <>
          {ridge(rnd, 152, 26, far, 0.4, false)}
          <path d="M0,186 Q90,164 180,186 T400,180 L400,240 L0,240 Z" fill={mix(p.horizon, "#e8b878", 0.6)} />
          <path d="M0,210 Q120,190 250,212 T400,206 L400,240 L0,240 Z" fill={mix(near, "#8a5a2b", 0.35)} opacity="0.9" />
          <path d="M0,232 Q140,222 260,234 T400,228 L400,240 L0,240 Z" fill={near} />
        </>
      );
    case "historic":
      return (
        <>
          {skyline(rnd, p, 180, far, 0.4, 0, 34, false)}
          <g fill={mid} opacity="0.9">
            <rect x="120" y="150" width="88" height="90" />
            <path d="M120,150 Q164,104 208,150 Z" />
            <rect x="160" y="92" width="8" height="22" />
          </g>
          <g fill={near}>
            {[40, 74, 232, 268, 316].map((x, i) => (
              <g key={i}>
                <rect x={x} y={178 + (i % 2) * 10} width="26" height="62" />
                <path d={`M${x},${178 + (i % 2) * 10} L${x + 13},${162 + (i % 2) * 10} L${x + 26},${178 + (i % 2) * 10} Z`} />
              </g>
            ))}
          </g>
          <rect y="236" width="400" height="4" fill={near} />
        </>
      );
    case "nature":
    default:
      return (
        <>
          {ridge(rnd, 144, 40, far, 0.4, false)}
          {ridge(rnd, 176, 30, mid, 0.7, false)}
          {treeline(rnd, 206, mid, 0.75)}
          {water(rnd, p, 212)}
          {treeline(rnd, 240, near, 1)}
        </>
      );
  }
}
