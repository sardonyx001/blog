import type { AmbientAnimationModule } from "./types";

const HUE = 208;
const PX_PER_ANCHOR = 9000;
const MIN_ANCHORS = 1;

type Orbit = { r: number; speed: number; phase: number };
type Anchor = { x: number; y: number; orbits: Orbit[] };

export const create: AmbientAnimationModule["create"] = (ctx, w, h) => {
  const count = Math.max(MIN_ANCHORS, Math.round((w * h) / PX_PER_ANCHOR));
  const anchors: Anchor[] = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    orbits: Array.from({ length: 1 + Math.floor(Math.random() * 2) }, () => ({
      r: 8 + Math.random() * 16,
      speed: (Math.random() < 0.5 ? 1 : -1) * (0.0003 + Math.random() * 0.0004),
      phase: Math.random() * Math.PI * 2,
    })),
  }));

  return {
    step(now, _dt, isDark) {
      ctx.clearRect(0, 0, w, h);
      for (const a of anchors) {
        for (const o of a.orbits) {
          ctx.beginPath();
          ctx.strokeStyle = `hsla(${HUE},50%,${isDark ? 60 : 42}%,${isDark ? 0.15 : 0.12})`;
          ctx.arc(a.x, a.y, o.r, 0, Math.PI * 2);
          ctx.stroke();
          const ang = o.phase + now * o.speed;
          const px = a.x + Math.cos(ang) * o.r;
          const py = a.y + Math.sin(ang) * o.r;
          ctx.beginPath();
          ctx.fillStyle = `hsla(${HUE},70%,${isDark ? 72 : 46}%,${isDark ? 0.6 : 0.45})`;
          ctx.arc(px, py, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
  };
};
