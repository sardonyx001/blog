import type { AmbientAnimationModule } from "./types";

// The original ambient background: slow drifting motes that link to nearby
// motes with faint lines (a loose constellation, not a physics network).
const PX_PER_MOTE = 9000;
const MIN_MOTES = 4;
const MAX_MOTES = 40;
const DRIFT_PX_PER_MS = 0.012;
const SWAY_PX = 10;
const LINK_DIST_PX = 64;
const LINK_ALPHA = 0.16;

type Mote = {
  x: number;
  y: number;
  size: number;
  swayPhase: number;
  swaySpeed: number;
  bornAt: number;
  lifetimeMs: number;
};

function randomMote(w: number, h: number, now: number): Mote {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    size: 1.2 + Math.random() * 1.8,
    swayPhase: Math.random() * Math.PI * 2,
    swaySpeed: 0.0004 + Math.random() * 0.0006,
    bornAt: now,
    lifetimeMs: 9000 + Math.random() * 8000,
  };
}

export const create: AmbientAnimationModule["create"] = (ctx, w, h) => {
  const count = Math.max(MIN_MOTES, Math.min(MAX_MOTES, Math.round((w * h) / PX_PER_MOTE)));
  const motes = Array.from({ length: count }, () => randomMote(w, h, performance.now()));

  return {
    step(now, dt, isDark) {
      ctx.clearRect(0, 0, w, h);
      const drawn: { x: number; y: number; fade: number }[] = [];

      for (let i = 0; i < motes.length; i++) {
        let m = motes[i];
        if (now - m.bornAt > m.lifetimeMs || m.y < -20) {
          m = motes[i] = randomMote(w, h, now);
        }
        const age = now - m.bornAt;
        m.y -= DRIFT_PX_PER_MS * dt;

        const ageFrac = age / m.lifetimeMs;
        // fade in over the first 15%, fade out over the last 25%
        const fade = Math.min(1, ageFrac / 0.15, (1 - ageFrac) / 0.25);
        const sway = Math.sin(m.swayPhase + now * m.swaySpeed) * SWAY_PX;
        drawn.push({ x: m.x + sway, y: m.y, fade });
      }

      // faint constellation lines between nearby motes, drawn before the
      // dots themselves so the dots sit on top
      for (let i = 0; i < drawn.length; i++) {
        const a = drawn[i];
        for (let j = i + 1; j < drawn.length; j++) {
          const b = drawn[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= LINK_DIST_PX) continue;
          const proximity = 1 - dist / LINK_DIST_PX;
          const alpha = LINK_ALPHA * proximity * Math.min(a.fade, b.fade);
          if (alpha <= 0.005) continue;
          ctx.strokeStyle = `hsla(208, 60%, ${isDark ? 70 : 45}%, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      const lightness = isDark ? 68 : 48;
      for (let i = 0; i < drawn.length; i++) {
        const d = drawn[i];
        const alpha = (isDark ? 0.5 : 0.4) * d.fade;
        ctx.fillStyle = `hsla(208, 65%, ${lightness}%, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, motes[i].size, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  };
};
