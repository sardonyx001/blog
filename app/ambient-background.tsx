"use client";

import { useEffect, useRef } from "react";

// Full-viewport ambient version of the friend/enemy dots simulation from
// /opt/apps/pocs (components/pocs/friend-enemy-dots.tsx) — same physics
// (Simon Woods' "Dancing with friends and enemies"), retuned to cover an
// entire browser viewport at a comfortable density instead of a small demo
// box, recolored to the site's muted pastel-blue palette, and kept at low
// opacity + behind all content so it reads as ambient texture, not a
// distraction. See CONTENT_PANEL usage across the app for how foreground
// text stays crisp regardless of what the sim is doing behind it.
const CENTER_PULL = 0.005;
const FRIEND_STEP_FRAC = 0.025;
const ENEMY_STEP_FRAC = 0.013;
const SOFTEN_FRAC = 0.01;
const RECHOOSE_CHANCE_PER_FRAME = 0.0015;
const FLASH_DECAY = 0.92;

// density tuning for a full-viewport canvas (the original 500 dots were
// calibrated for a ~600px square demo box, ~360k px^2 -> ~1 dot / 720 px^2).
// A full viewport is much bigger, so we scale dot count by area instead of
// using a fixed count, clamped to keep things smooth on very large/small
// screens.
const PX_PER_DOT = 3800;
const MIN_DOTS = 260;
const MAX_DOTS = 1200;

// click/tap "disturbance" — an expanding ring that shoves nearby dots
// outward as it passes through them, then lets the normal friend/enemy
// physics pull things back into formation. Attached on `window` (the
// canvas itself is pointer-events-none) so it doesn't block real clicks
// on links/buttons — it's purely decorative on top of whatever was clicked.
const MAX_RIPPLES = 6;
const RIPPLE_LIFETIME_MS = 900;
const RIPPLE_MAX_RADIUS_FRAC = 0.9;
const RIPPLE_BAND_FRAC = 0.16;
const RIPPLE_FORCE_FRAC = 0.16;

type Ripple = { x: number; y: number; createdAt: number };

type Dot = {
  x: number;
  y: number;
  nextX: number;
  nextY: number;
  vx: number;
  vy: number;
  flash: number;
  friend: number;
  enemy: number;
};

function randomOtherIndex(count: number, self: number) {
  if (count <= 1) return self;
  let idx = self;
  while (idx === self) idx = Math.floor(Math.random() * count);
  return idx;
}

function makeDots(count: number, w: number, h: number): Dot[] {
  const dots: Dot[] = [];
  for (let i = 0; i < count; i++) {
    dots.push({
      x: Math.random() * w,
      y: Math.random() * h,
      nextX: 0,
      nextY: 0,
      vx: 0,
      vy: 0,
      flash: 0,
      friend: 0,
      enemy: 0,
    });
  }
  for (let i = 0; i < count; i++) {
    dots[i].friend = randomOtherIndex(count, i);
    dots[i].enemy = randomOtherIndex(count, i);
  }
  return dots;
}

export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // skip entirely for users who've asked for less motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    let dotsRef: Dot[] = [];
    let visible = !document.hidden;

    function dotCount(w: number, h: number) {
      const area = (w / dpr) * (h / dpr);
      return Math.max(MIN_DOTS, Math.min(MAX_DOTS, Math.round(area / PX_PER_DOT)));
    }

    function resize() {
      if (!canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      dotsRef = makeDots(dotCount(canvas.width, canvas.height), canvas.width, canvas.height);
    }
    resize();
    window.addEventListener("resize", resize);

    function onVisibility() {
      visible = !document.hidden;
    }
    document.addEventListener("visibilitychange", onVisibility);

    let ripples: Ripple[] = [];
    function onPointerDown(e: PointerEvent) {
      ripples.push({ x: e.clientX * dpr, y: e.clientY * dpr, createdAt: performance.now() });
      if (ripples.length > MAX_RIPPLES) ripples.shift();
    }
    window.addEventListener("pointerdown", onPointerDown);

    let stopped = false;

    function step() {
      if (stopped) return;
      if (!canvas || !ctx) return;
      if (!visible) {
        requestAnimationFrame(step);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) / 2;
      const friendStep = FRIEND_STEP_FRAC * scale;
      const enemyStep = ENEMY_STEP_FRAC * scale;
      const soften = SOFTEN_FRAC * scale;
      const dots = dotsRef;

      const now = performance.now();
      if (ripples.length > 0) {
        ripples = ripples.filter(r => now - r.createdAt < RIPPLE_LIFETIME_MS);
      }
      const activeRipples = ripples.map(r => {
        const age = (now - r.createdAt) / RIPPLE_LIFETIME_MS;
        return {
          x: r.x,
          y: r.y,
          ringRadius: RIPPLE_MAX_RADIUS_FRAC * scale * age,
          intensity: 1 - age,
        };
      });
      const ripplePush = RIPPLE_FORCE_FRAC * scale;
      const rippleBand = RIPPLE_BAND_FRAC * scale;

      for (let i = 0; i < dots.length; i++) {
        if (Math.random() < RECHOOSE_CHANCE_PER_FRAME) {
          dots[i].friend = randomOtherIndex(dots.length, i);
          dots[i].enemy = randomOtherIndex(dots.length, i);
          dots[i].flash = 1;
        } else {
          dots[i].flash *= FLASH_DECAY;
        }
      }

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        let nx = d.x + (cx - d.x) * CENTER_PULL;
        let ny = d.y + (cy - d.y) * CENTER_PULL;

        const f = dots[d.friend];
        const fx = f.x - d.x;
        const fy = f.y - d.y;
        const fDist = Math.sqrt(fx * fx + fy * fy);
        nx += (friendStep * fx) / (soften + fDist);
        ny += (friendStep * fy) / (soften + fDist);

        const e = dots[d.enemy];
        const ex = d.x - e.x;
        const ey = d.y - e.y;
        const eDist = Math.sqrt(ex * ex + ey * ey);
        nx += (enemyStep * ex) / (soften + eDist);
        ny += (enemyStep * ey) / (soften + eDist);

        for (let ri = 0; ri < activeRipples.length; ri++) {
          const r = activeRipples[ri];
          const rdx = d.x - r.x;
          const rdy = d.y - r.y;
          const dist = Math.sqrt(rdx * rdx + rdy * rdy) || 1e-6;
          const edgeDist = Math.abs(dist - r.ringRadius);
          if (edgeDist < rippleBand) {
            const proximity = 1 - edgeDist / rippleBand;
            const push = ripplePush * r.intensity * proximity;
            nx += (rdx / dist) * push;
            ny += (rdy / dist) * push;
            d.flash = Math.max(d.flash, proximity * r.intensity);
          }
        }

        d.nextX = nx;
        d.nextY = ny;
        d.vx = nx - d.x;
        d.vy = ny - d.y;
      }
      for (let i = 0; i < dots.length; i++) {
        dots[i].x = dots[i].nextX;
        dots[i].y = dots[i].nextY;
      }

      // fully transparent clear — the page's own background (light/dark)
      // shows through, we're just drawing dots on top of it
      ctx.clearRect(0, 0, w, h);

      const isDark = document.documentElement.classList.contains("dark");
      const baseR = 1.7 * dpr;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        // narrow pastel-blue hue band (not the original's full rainbow) —
        // heading still perturbs it a little so motion still reads visually,
        // just subtly instead of as a rainbow strobe
        const heading = Math.atan2(d.vy, d.vx);
        const hueJitter = (Math.sin(heading) * 26 + 26) / 2;
        const hue = 208 + hueJitter;
        const lightness = (isDark ? 66 : 46) + d.flash * 20;
        const alpha = (isDark ? 0.46 : 0.4) + d.flash * 0.4;
        const r = baseR + d.flash * 2.2 * dpr;
        ctx.fillStyle = `hsla(${hue.toFixed(1)}, 70%, ${lightness.toFixed(1)}%, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(step);
    }
    const raf = requestAnimationFrame(step);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 h-screen w-screen pointer-events-none"
    />
  );
}
