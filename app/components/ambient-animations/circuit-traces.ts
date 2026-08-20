import type { AmbientAnimationModule } from "./types";

const HUE = 208;
const PX_PER_TRACE = 5000;
const MIN_TRACES = 2;

type Point = { x: number; y: number };
type Trace = { pts: Point[]; t: number; speed: number };

function buildPath(w: number, h: number): Point[] {
  const pts: Point[] = [{ x: Math.random() * w, y: Math.random() * h }];
  const segs = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < segs; i++) {
    const last = pts[pts.length - 1];
    const len = 12 + Math.random() * 24;
    const horiz = Math.random() < 0.5;
    pts.push(
      horiz
        ? { x: last.x + (Math.random() < 0.5 ? len : -len), y: last.y }
        : { x: last.x, y: last.y + (Math.random() < 0.5 ? len : -len) }
    );
  }
  return pts;
}

function pathLength(pts: Point[]): number {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return d;
}

function pointAt(pts: Point[], frac: number): Point {
  let target = frac * pathLength(pts);
  for (let i = 1; i < pts.length; i++) {
    const segLen = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (target <= segLen) {
      const t = segLen ? target / segLen : 0;
      return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t };
    }
    target -= segLen;
  }
  return pts[pts.length - 1];
}

export const create: AmbientAnimationModule["create"] = (ctx, w, h) => {
  const count = Math.max(MIN_TRACES, Math.round((w * h) / PX_PER_TRACE));
  const traces: Trace[] = Array.from({ length: count }, () => ({
    pts: buildPath(w, h),
    t: Math.random(),
    speed: 0.00004 + Math.random() * 0.00005,
  }));

  return {
    step(_now, dt, isDark) {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (const tr of traces) {
        ctx.strokeStyle = `hsla(${HUE},50%,${isDark ? 55 : 40}%,${isDark ? 0.18 : 0.15})`;
        ctx.beginPath();
        tr.pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();

        tr.t = (tr.t + tr.speed * dt) % 1;
        const pulse = pointAt(tr.pts, tr.t);
        ctx.beginPath();
        ctx.fillStyle = `hsla(${HUE},80%,${isDark ? 75 : 50}%,${isDark ? 0.8 : 0.6})`;
        ctx.arc(pulse.x, pulse.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  };
};
