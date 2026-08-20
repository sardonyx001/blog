import type { AmbientAnimationModule } from "./types";

const HUE = 208;
const PX_PER_STAR = 1800;
const MIN_STARS = 6;

type Star = { x: number; y: number; r: number; phase: number; speed: number };

export const create: AmbientAnimationModule["create"] = (ctx, w, h) => {
  const density = Math.max(MIN_STARS, Math.round((w * h) / PX_PER_STAR));
  const stars: Star[] = Array.from({ length: density }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 0.6 + Math.random() * 1.4,
    phase: Math.random() * Math.PI * 2,
    speed: 0.0008 + Math.random() * 0.0015,
  }));

  return {
    step(now, _dt, isDark) {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const tw = 0.5 + 0.5 * Math.sin(now * s.speed + s.phase);
        const alpha = (isDark ? 0.15 : 0.12) + tw * (isDark ? 0.55 : 0.4);
        ctx.beginPath();
        ctx.fillStyle = `hsla(${HUE},70%,${isDark ? 75 : 45}%,${alpha.toFixed(2)})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  };
};
