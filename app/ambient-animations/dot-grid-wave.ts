import type { AmbientAnimationModule } from "./types";

const HUE = 208;
const SPACING_PX = 18;

type Dot = { x: number; y: number };

export const create: AmbientAnimationModule["create"] = (ctx, w, h) => {
  const dots: Dot[] = [];
  for (let y = SPACING_PX / 2; y < h; y += SPACING_PX) {
    for (let x = SPACING_PX / 2; x < w; x += SPACING_PX) dots.push({ x, y });
  }

  return {
    step(now, _dt, isDark) {
      ctx.clearRect(0, 0, w, h);
      const waveY = ((now * 0.00006) % 1.4) * (h * 1.4) - h * 0.2;
      for (const d of dots) {
        const dist = Math.abs(d.y - waveY);
        const wave = Math.max(0, 1 - dist / 60);
        const alpha = (isDark ? 0.08 : 0.06) + wave * (isDark ? 0.5 : 0.35);
        ctx.beginPath();
        ctx.fillStyle = `hsla(${HUE},60%,${isDark ? 70 : 45}%,${alpha.toFixed(2)})`;
        ctx.arc(d.x, d.y, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  };
};
