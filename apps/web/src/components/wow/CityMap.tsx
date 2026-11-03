'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { compactSarText, formatInt, usePrefersReducedMotion, type WowLocale } from './shared';

export interface CityMapCity {
  nameAr: string;
  nameEn: string;
  count: number;
  value: number;
}

export interface CityMapProps<C extends CityMapCity = CityMapCity> {
  cities: C[];
  /** First activation: the city becomes selected (popover + hint). `null` when the selection clears. */
  onSelect?: (c: C | null) => void;
  /** Second activation on the already selected city (or a double-click): go to its opportunities. */
  onNavigate?: (c: C) => void;
  locale: 'ar' | 'en';
  className?: string;
}

const COPY = {
  ar: { title: 'الفرص حسب المدينة', unit: 'فرصة', listLabel: 'قائمة المدن', mapLabel: 'خريطة المملكة العربية السعودية وكثافة الفرص', hint: 'اضغط مرة أخرى لعرض الفرص', selected: 'محددة' },
  en: { title: 'Opportunities by city', unit: 'opportunities', listLabel: 'Cities', mapLabel: 'Map of Saudi Arabia showing opportunity density', hint: 'Tap again to view opportunities', selected: 'selected' },
} as const;

/* ------------------------------------------------------------------ */
/* Projection: equirectangular with a cos(24°) longitude correction.   */
/* ------------------------------------------------------------------ */
const LNG0 = 34.2;
const LAT0 = 32.6;
const K = 40;
const LNG_K = 0.913 * K;
const VB_W = Math.round((56.0 - LNG0) * LNG_K); // ≈ 796
const VB_H = Math.round((LAT0 - 15.9) * K); // ≈ 668

const project = (lng: number, lat: number): [number, number] => [(lng - LNG0) * LNG_K, (LAT0 - lat) * K];

/**
 * Simplified border of the Kingdom (lng, lat), clockwise from the Gulf of Aqaba, after Natural Earth
 * 1:50m admin-0 and hand-thinned to ~90 points (QA P2-7): Jordan and Iraq land borders, the Kuwait
 * neutral-zone corner, the Gulf coast with Ras Tanura, Dammam/Khobar and the Salwa bay west of Qatar,
 * the UAE and Oman straight-line borders, the Yemen border, and the Red Sea coast with the Farasan bend.
 */
const BORDER: ReadonlyArray<readonly [number, number]> = [
  // Gulf of Aqaba → Jordan
  [34.96, 29.36], [35.42, 29.38], [36.07, 29.19], [36.5, 29.51], [36.74, 29.86], [37.5, 29.99], [37.67, 30.34],
  [37.99, 30.51], [37.0, 31.51],
  // Jordan → Iraq
  [38.79, 32.0], [39.2, 32.16], [40.4, 31.89], [41.89, 31.19], [42.98, 30.48], [44.71, 29.18], [46.57, 29.1],
  // Kuwait
  [47.46, 29.0], [47.71, 28.53], [48.42, 28.55],
  // Gulf coast
  [48.81, 27.69], [49.3, 27.46], [49.47, 27.11], [49.98, 26.84], [50.11, 26.7], [50.21, 26.28], [50.11, 26.1],
  [50.03, 25.83], [50.24, 25.6], [50.53, 25.33], [50.66, 24.99], [50.81, 24.75],
  // Qatar land border → Salwa → UAE
  [51.11, 24.56], [51.39, 24.63], [51.58, 24.25], [51.76, 24.29], [52.58, 22.94], [55.01, 22.5], [55.21, 22.71],
  // Oman
  [55.67, 22.0], [55.0, 20.0], [52.0, 19.0],
  // Yemen
  [49.12, 18.62], [48.18, 18.17], [47.47, 17.12], [46.75, 17.28], [46.37, 17.23], [45.4, 17.33], [45.22, 17.43],
  [44.06, 17.41], [43.79, 17.32], [43.38, 17.58], [43.12, 17.09], [43.22, 16.67], [42.78, 16.35],
  // Red Sea coast (Jazan → Gulf of Aqaba)
  [42.65, 16.77], [42.35, 17.08], [42.27, 17.47], [41.75, 17.83], [41.22, 18.67], [40.94, 19.49], [40.25, 20.17],
  [39.8, 20.34], [39.14, 21.29], [39.02, 21.99], [39.07, 22.58], [38.49, 23.69], [38.02, 24.08], [37.48, 24.29],
  [37.15, 24.86], [37.21, 25.08], [36.93, 25.6], [36.64, 25.83], [36.25, 26.57], [35.64, 27.38], [35.13, 28.06],
  [34.63, 28.06], [34.79, 28.61], [34.83, 28.96],
];

/** Closed path smoothed through edge midpoints (quadratic) so the outline reads as drawn, not traced. */
const OUTLINE_D = (() => {
  const pts = BORDER.map(([lng, lat]) => project(lng, lat));
  const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const f = (n: number) => n.toFixed(1);
  const n = pts.length;
  const start = mid(pts[n - 1]!, pts[0]!);
  let d = `M${f(start[0])} ${f(start[1])}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i]!;
    const m = mid(p, pts[(i + 1) % n]!);
    d += `Q${f(p[0])} ${f(p[1])} ${f(m[0])} ${f(m[1])}`;
  }
  return `${d}Z`;
})();

/* ------------------------------------------------------------------ */
/* City coordinates                                                    */
/* ------------------------------------------------------------------ */
const CITY_COORDS: Record<string, readonly [number, number]> = {
  riyadh: [46.68, 24.71],
  jeddah: [39.19, 21.49],
  makkah: [39.86, 21.39],
  madinah: [39.57, 24.52],
  dammam: [50.09, 26.42],
  khobar: [50.2, 26.22],
  abha: [42.51, 18.22],
  jazan: [42.55, 16.89],
  tabuk: [36.56, 28.38],
  hail: [41.72, 27.51],
  qassim: [43.97, 26.33],
  taif: [40.42, 21.27],
  najran: [44.23, 17.57],
  ahsa: [49.59, 25.38],
  yanbu: [38.06, 24.09],
  jouf: [40.21, 29.97],
  khamis: [42.73, 18.31],
  arar: [41.04, 30.98],
  baha: [41.47, 20.01],
};

/** Normalised aliases (Arabic and English) → coordinate key. */
const ALIASES: Array<[RegExp, keyof typeof CITY_COORDS]> = [
  [/riyadh|الرياض/, 'riyadh'],
  [/jedd?ah|جدة|جده/, 'jeddah'],
  [/mak+ah|mecca|مكة|مكه/, 'makkah'],
  [/madin|medin|المدينة/, 'madinah'],
  [/damm?am|الدمام/, 'dammam'],
  [/khobar|الخبر/, 'khobar'],
  [/khamis|خميس/, 'khamis'],
  [/abha|أبها|ابها/, 'abha'],
  [/ji?zan|gizan|جازان|جيزان/, 'jazan'],
  [/tabuk|تبوك/, 'tabuk'],
  [/ha'?il|حائل/, 'hail'],
  [/qassim|buraid|buraydah|القصيم|بريدة|عنيزة|unaizah/, 'qassim'],
  [/taif|الطائف/, 'taif'],
  [/najran|نجران/, 'najran'],
  [/ahsa|hasa|hofuf|الأحساء|الاحساء|الهفوف/, 'ahsa'],
  [/yanbu|ينبع/, 'yanbu'],
  [/jouf|jawf|sakak|الجوف|سكاكا/, 'jouf'],
  [/arar|عرعر|northern/, 'arar'],
  [/baha|الباحة/, 'baha'],
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function locate(city: CityMapCity): { x: number; y: number; known: boolean } {
  const key = `${city.nameEn} ${city.nameAr}`.toLowerCase();
  const hit = ALIASES.find(([re]) => re.test(key));
  if (hit) {
    const [lng, lat] = CITY_COORDS[hit[1]]!;
    const [x, y] = project(lng, lat);
    return { x, y, known: true };
  }
  // Unknown → a deterministic spot on a small ring around Riyadh so nothing stacks.
  const [rx, ry] = project(46.68, 24.71);
  const a = ((hash(key) % 360) * Math.PI) / 180;
  return { x: rx + Math.cos(a) * 34, y: ry + Math.sin(a) * 34, known: false };
}

const PULSE_CSS = `
@keyframes fz-breathe { 0%,100% { opacity: 1; transform: translate(-50%,-50%) scale(1); } 50% { opacity: .88; transform: translate(-50%,-50%) scale(1.06); } }
.fz-breathe { animation: fz-breathe 4s ease-in-out infinite; }
@keyframes fz-pop { from { opacity: 0; transform: translateY(6px) scale(.97); } to { opacity: 1; transform: none; } }
.fz-pop { animation: fz-pop .22s cubic-bezier(.16,1,.3,1) both; }
@media (prefers-reduced-motion: reduce) { .fz-breathe, .fz-pop { animation: none; } }
`;

/* ------------------------------------------------------------------ */
/* Label placement (collision-free)                                    */
/* ------------------------------------------------------------------ */
const LABEL_FONT_PX = 12.5;
const LABEL_H = 22;
const LABEL_PAD_X = 8;
const GAP = 7; // dot edge → label
const MOBILE_W = 520; // below this map width only the larger cities are labelled by default

type Box = { x: number; y: number; w: number; h: number };
const hit = (a: Box, b: Box, pad = 3) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;

let measureCtx: CanvasRenderingContext2D | null = null;
function textWidth(text: string): number {
  if (typeof document === 'undefined') return text.length * 7;
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  if (!measureCtx) return text.length * 7;
  measureCtx.font = `500 ${LABEL_FONT_PX}px Tajawal, Inter, system-ui, sans-serif`;
  return Math.ceil(measureCtx.measureText(text).width);
}

interface Placed {
  i: number;
  box: Box;
  /** Leader line from the dot to the label edge, when the label is offset away from its dot. */
  leader?: { x1: number; y1: number; x2: number; y2: number };
}

/**
 * Greedy placement, biggest city (and the selected one) first. Each label tries: above, below, beside,
 * then four diagonal offsets with a short leader line. A label that cannot be placed without touching
 * another label or dot is hidden (the selected city is always shown).
 */
function placeLabels(
  pts: Array<{ i: number; x: number; y: number; text: string; priority: number; forced: boolean }>,
  W: number,
  H: number,
): Placed[] {
  const placed: Placed[] = [];
  const dots: Box[] = pts.map((p) => ({ x: p.x - 6, y: p.y - 6, w: 12, h: 12 }));
  const order = [...pts].sort((a, b) => Number(b.forced) - Number(a.forced) || b.priority - a.priority);
  for (const p of order) {
    const w = textWidth(p.text) + LABEL_PAD_X * 2;
    const h = LABEL_H;
    const far = 16;
    const cands: Array<{ b: Box; lead: boolean }> = [
      { b: { x: p.x - w / 2, y: p.y - GAP - h, w, h }, lead: false },
      { b: { x: p.x - w / 2, y: p.y + GAP, w, h }, lead: false },
      { b: { x: p.x + GAP + 2, y: p.y - h / 2, w, h }, lead: false },
      { b: { x: p.x - GAP - 2 - w, y: p.y - h / 2, w, h }, lead: false },
      { b: { x: p.x + 4, y: p.y - GAP - h - far, w, h }, lead: true },
      { b: { x: p.x - 4 - w, y: p.y - GAP - h - far, w, h }, lead: true },
      { b: { x: p.x + 4, y: p.y + GAP + far, w, h }, lead: true },
      { b: { x: p.x - 4 - w, y: p.y + GAP + far, w, h }, lead: true },
      { b: { x: p.x + GAP + far, y: p.y - h / 2, w, h }, lead: true },
      { b: { x: p.x - GAP - far - w, y: p.y - h / 2, w, h }, lead: true },
    ];
    const inside = (b: Box) => b.x >= 0 && b.y >= 0 && b.x + b.w <= W && b.y + b.h <= H;
    const free = (b: Box) =>
      inside(b) && !placed.some((q) => hit(q.box, b)) && !dots.some((d, k) => pts[k]!.i !== p.i && hit(d, b, 1));
    let pick = cands.find((c) => free(c.b));
    if (!pick && p.forced) pick = cands.find((c) => inside(c.b)) ?? cands[0];
    if (!pick) continue;
    const b = pick.b;
    let leader: Placed['leader'];
    if (pick.lead) {
      const cx = Math.min(Math.max(p.x, b.x), b.x + b.w);
      const cy = Math.min(Math.max(p.y, b.y), b.y + b.h);
      leader = { x1: p.x, y1: p.y, x2: cx, y2: cy };
    }
    placed.push({ i: p.i, box: b, leader });
  }
  return placed;
}

/**
 * Minimal Saudi map: stylised outline, city glows sized by opportunity count, glass popovers on
 * hover / tap / list focus. Geography is never mirrored; text follows the locale direction.
 */
export function CityMap<C extends CityMapCity>({ cities, onSelect, onNavigate, locale, className }: CityMapProps<C>) {
  const t = COPY[locale];
  const loc: WowLocale = locale;
  const reduce = usePrefersReducedMotion();
  const gradId = useId().replace(/:/g, '');
  /** Selected city (two-step navigation: first activation selects, second navigates). */
  const [selIdx, setSelIdx] = useState<number | null>(null);
  /** Hover / focus preview when nothing is selected. */
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, []);

  const points = useMemo(() => {
    const max = Math.max(1, ...cities.map((c) => c.count));
    return cities
      .map((c, i) => {
        const p = locate(c);
        const r = Math.sqrt(Math.max(0, c.count) / max); // area ∝ count
        return {
          city: c,
          i,
          xPct: (p.x / VB_W) * 100,
          yPct: (p.y / VB_H) * 100,
          sizePct: 2.4 + r * 7.6, // diameter as % of map width
          intensity: 0.35 + r * 0.65,
        };
      })
      .sort((a, b) => b.city.count - a.city.count);
  }, [cities]);

  const name = (c: CityMapCity) => (locale === 'ar' ? c.nameAr : c.nameEn);
  const summary = (c: CityMapCity) => `${name(c)} · ${formatInt(c.count)} ${t.unit} · ${compactSarText(c.value, loc)}`;

  // Labels: all cities on wide maps; on phones the larger cities (top 4) plus the selected one.
  const labels = useMemo(() => {
    if (!size.w) return [];
    const narrow = size.w < MOBILE_W;
    const shown = points.filter((p, rank) => !narrow || rank < 4 || p.i === selIdx);
    return placeLabels(
      shown.map((p) => ({
        i: p.i,
        x: (p.xPct / 100) * size.w,
        y: (p.yPct / 100) * size.h,
        text: name(p.city),
        priority: p.city.count,
        forced: p.i === selIdx,
      })),
      size.w,
      size.h,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, size.w, size.h, selIdx, locale]);

  const selected = selIdx == null ? null : points.find((p) => p.i === selIdx) ?? null;
  const active = selected ?? (hoverIdx == null ? null : points.find((p) => p.i === hoverIdx) ?? null);

  /** One handler for dots, labels and list rows (click, tap, Enter and Space all arrive as click). */
  const activate = (p: (typeof points)[number]) => {
    if (selIdx === p.i) {
      onNavigate?.(p.city);
      return;
    }
    setSelIdx(p.i);
    onSelect?.(p.city);
  };
  const clear = () => {
    if (selIdx != null) {
      setSelIdx(null);
      onSelect?.(null);
    }
  };
  const onMapClick = (e: MouseEvent<HTMLDivElement>) => {
    // Tapping empty map space (not a dot or label) clears the selection.
    const el = e.target as HTMLElement;
    if (!el.closest('[data-city]')) {
      setHoverIdx(null);
      clear();
    }
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') clear();
  };

  return (
    <div
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      onKeyDown={onKey}
      className={['grid items-center gap-8 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-12', className].filter(Boolean).join(' ')}
    >
      <style href="fz-wow-citymap" precedence="default">
        {PULSE_CSS}
      </style>

      {/* Map (geography stays LTR) */}
      <div
        ref={mapRef}
        dir="ltr"
        role="img"
        aria-label={t.mapLabel}
        className="relative mx-auto w-full max-w-[720px] select-none"
        style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
        onClick={onMapClick}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') setHoverIdx(null);
        }}
      >
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={`fz-land-${gradId}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--color-primary, #0275D9)" stopOpacity="0.09" />
              <stop offset="1" stopColor="var(--color-primary, #0275D9)" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          <path
            d={OUTLINE_D}
            fill={`url(#fz-land-${gradId})`}
            stroke="var(--color-label-3, rgba(60,60,67,0.3))"
            strokeWidth={1.25}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Leader lines for offset labels (pixel space) */}
        {size.w > 0 && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden>
            {labels
              .filter((l) => l.leader)
              .map((l) => (
                <line key={l.i} x1={l.leader!.x1} y1={l.leader!.y1} x2={l.leader!.x2} y2={l.leader!.y2} stroke="var(--color-label-3, #6B6E79)" strokeWidth={1} strokeOpacity={0.7} />
              ))}
          </svg>
        )}

        {/* Glows: pointer and touch targets (keyboard users use the list) */}
        {points.map((p) => {
          const isActive = active?.i === p.i;
          const isSel = selIdx === p.i;
          return (
            <button
              key={p.i}
              type="button"
              tabIndex={-1}
              aria-hidden
              data-city
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse') setHoverIdx(p.i);
              }}
              onClick={() => activate(p)}
              className="absolute grid place-items-center rounded-full outline-none"
              style={{
                left: `${p.xPct}%`,
                top: `${p.yPct}%`,
                width: `max(32px, ${p.sizePct}%)`,
                aspectRatio: '1',
                transform: 'translate(-50%,-50%)',
                zIndex: isActive ? 3 : 1,
              }}
            >
              <span
                className={reduce ? 'absolute left-1/2 top-1/2 rounded-full' : 'fz-breathe absolute left-1/2 top-1/2 rounded-full'}
                style={{
                  width: `${100 * (0.6 + p.intensity * 0.4)}%`,
                  aspectRatio: '1',
                  transform: 'translate(-50%,-50%)',
                  animationDelay: `${(p.i % 7) * -0.6}s`,
                  background: `radial-gradient(closest-side, color-mix(in srgb, var(--color-primary, #0275D9) ${Math.round(p.intensity * 55)}%, transparent), transparent)`,
                }}
              />
              <span
                className="relative block rounded-full transition-transform duration-300"
                style={{
                  width: 8,
                  height: 8,
                  background: 'var(--color-primary, #0275D9)',
                  boxShadow: isSel ? '0 0 0 2px var(--color-bg, #fff), 0 0 0 5px color-mix(in srgb, var(--color-primary, #0275D9) 45%, transparent)' : '0 0 0 2px var(--color-bg, #fff)',
                  transform: isActive ? 'scale(1.5)' : 'scale(1)',
                }}
              />
            </button>
          );
        })}

        {/* Always-visible name labels (collision-free placement; tappable like the dot) */}
        {labels.map((l) => {
          const p = points.find((x) => x.i === l.i)!;
          const isSel = selIdx === l.i;
          return (
            <button
              key={l.i}
              type="button"
              tabIndex={-1}
              aria-hidden
              data-city
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse') setHoverIdx(l.i);
              }}
              onClick={() => activate(p)}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
              className="absolute z-[4] flex items-center justify-center whitespace-nowrap rounded-full font-medium leading-none text-white transition-[box-shadow,background-color] duration-200"
              style={{
                left: l.box.x,
                top: l.box.y,
                width: l.box.w,
                height: l.box.h,
                fontSize: LABEL_FONT_PX,
                fontFamily: 'var(--font-tajawal)',
                fontWeight: 500,
                // White on #0262B8 (6.1:1) / on navy glass (≥ 12:1): AA in light and dark.
                background: isSel ? '#0262B8' : 'rgba(14,23,56,0.86)',
                backdropFilter: 'blur(10px) saturate(1.6)',
                WebkitBackdropFilter: 'blur(10px) saturate(1.6)',
                boxShadow: isSel ? '0 0 0 2px rgba(255,255,255,0.9)' : '0 0 0 1px rgba(140,200,240,0.28), 0 4px 12px -4px rgba(7,12,34,0.45)',
              }}
            >
              {name(p.city)}
            </button>
          );
        })}

        {/* Glass popover: name, count, value, and the "tap again" hint once selected */}
        {active && (
          <div
            key={`${active.i}-${selected ? 's' : 'h'}`}
            role="status"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
            className="fz-pop pointer-events-none absolute z-10 w-max max-w-[260px] rounded-2xl border px-4 py-3 shadow-[0_12px_40px_-12px_rgba(23,35,79,0.35)]"
            style={{
              left: `${Math.min(80, Math.max(20, active.xPct))}%`,
              top: `${active.yPct}%`,
              translate: active.yPct < 34 ? '-50% 26px' : '-50% calc(-100% - 26px)',
              borderColor: 'var(--color-separator, rgba(60,60,67,0.18))',
              background: 'color-mix(in srgb, var(--color-elevated, #fff) 80%, transparent)',
              backdropFilter: 'blur(20px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
            }}
          >
            <p className="text-base font-bold text-[var(--color-label,#111)]">{name(active.city)}</p>
            <p className="mt-0.5 text-sm text-[var(--color-label-2,#5E6272)]">
              <bdi dir="ltr" className="font-[family-name:var(--font-latin)] tabular-nums">{formatInt(active.city.count)}</bdi> {t.unit}
              <span className="mx-1.5 opacity-50">·</span>
              <bdi>{compactSarText(active.city.value, loc)}</bdi>
            </p>
            {selected && <p className="mt-1.5 text-[13px] font-bold text-[var(--color-primary-text,#0262B8)]">{t.hint}</p>}
          </div>
        )}
      </div>

      {/* Ranked list: the keyboard / screen-reader path (Enter or Space selects, again navigates) */}
      <div>
        <h3 className="mb-4 text-sm font-medium text-[var(--color-label-2,#5E6272)]">{t.title}</h3>
        <ul aria-label={t.listLabel} className="divide-y divide-[var(--color-separator,rgba(60,60,67,0.18))]">
          {points.map((p) => {
            const isActive = active?.i === p.i;
            const isSel = selIdx === p.i;
            return (
              <li key={p.i}>
                <button
                  type="button"
                  data-city
                  aria-label={isSel ? `${summary(p.city)}. ${t.hint}` : summary(p.city)}
                  aria-pressed={isSel}
                  onFocus={() => setHoverIdx(p.i)}
                  onBlur={() => setHoverIdx((cur) => (cur === p.i ? null : cur))}
                  onPointerEnter={(e) => {
                    if (e.pointerType === 'mouse') setHoverIdx(p.i);
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType === 'mouse') setHoverIdx((cur) => (cur === p.i ? null : cur));
                  }}
                  onClick={() => activate(p)}
                  className={`group flex min-h-11 w-full items-center gap-3 rounded-xl px-2 py-3 text-start outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-focus,rgba(2,117,217,0.5))] ${isSel ? 'bg-[var(--color-primary-tint,rgba(2,117,217,0.12))]' : ''}`}
                >
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full transition-transform duration-300"
                    style={{
                      background: 'var(--color-primary, #0275D9)',
                      opacity: 0.35 + p.intensity * 0.65,
                      transform: isActive ? 'scale(1.6)' : 'scale(1)',
                    }}
                  />
                  <span className={`flex-1 text-base ${isActive ? 'font-bold' : 'font-medium'} text-[var(--color-label,#111)]`}>{name(p.city)}</span>
                  <span className="text-sm tabular-nums text-[var(--color-label-2,#5E6272)]">
                    <bdi dir="ltr" className="font-[family-name:var(--font-latin)]">{formatInt(p.city.count)}</bdi>
                  </span>
                  <span className="hidden w-28 text-end text-sm text-[var(--color-label-2,#5E6272)] sm:inline">
                    <bdi>{compactSarText(p.city.value, loc)}</bdi>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default CityMap;
