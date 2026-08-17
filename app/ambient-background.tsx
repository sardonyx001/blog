"use client";

import { useEffect, useRef } from "react";
import { AMBIENT_ANIMATION_KEYS, AMBIENT_ANIMATION_LOADERS, type AmbientAnimation } from "./ambient-animations";

const ROTATION_KEY = "ambient-bg-rotation";

// Which animation to show is decided entirely client-side, after mount —
// the server always renders the same empty canvas regardless, so this
// can't fragment the page's cache/CDN behavior. `localStorage` cycles
// through every animation once each in order (not randomly) across visits,
// then repeats.
function nextAnimationKey(): string {
  const stored = Number(window.localStorage.getItem(ROTATION_KEY));
  const index = Number.isInteger(stored) && stored >= 0 ? stored : 0;
  window.localStorage.setItem(ROTATION_KEY, String((index + 1) % AMBIENT_ANIMATION_KEYS.length));
  return AMBIENT_ANIMATION_KEYS[index % AMBIENT_ANIMATION_KEYS.length];
}

export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // resolved once and reused if this effect re-runs (React 18 StrictMode
  // double-invokes effects in dev) — otherwise each double-invoke advances
  // the rotation pointer twice per real page load, skipping every other
  // animation in the list.
  const animationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // skip entirely for users who've asked for less motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let stopped = false;
    let visible = !document.hidden;
    let gutterWidth = 0; // css px
    let viewportH = 0; // css px
    let left: AmbientAnimation | null = null;
    let right: AmbientAnimation | null = null;
    let mod: { create(ctx: CanvasRenderingContext2D, w: number, h: number): AmbientAnimation } | null = null;

    // each gutter gets its own instance — same module, independent state —
    // so the left and right margins don't mirror each other
    function instantiate() {
      if (!mod || gutterWidth <= 0) {
        left = right = null;
        return;
      }
      left = mod.create(ctx!, gutterWidth, viewportH);
      right = mod.create(ctx!, gutterWidth, viewportH);
    }

    function resize() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      // setting width/height resets the canvas transform, so re-apply the
      // DPR scale every time — animations then only ever think in css px
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx!.scale(dpr, dpr);

      // the content column is the `body` element itself (max-w-2xl, centered)
      const bodyRect = document.body.getBoundingClientRect();
      gutterWidth = Math.max(0, bodyRect.left);
      viewportH = h;
      instantiate();
    }
    resize();
    window.addEventListener("resize", resize);

    function onVisibility() {
      visible = !document.hidden;
    }
    document.addEventListener("visibilitychange", onVisibility);

    if (animationKeyRef.current === null) animationKeyRef.current = nextAnimationKey();

    AMBIENT_ANIMATION_LOADERS[animationKeyRef.current]()
      .then(loaded => {
        if (stopped) return;
        mod = loaded;
        instantiate();
      })
      .catch(() => {});

    let lastFrame = performance.now();
    function step() {
      if (stopped) return;
      const now = performance.now();
      const dt = Math.min(64, now - lastFrame);
      lastFrame = now;

      if (visible && left && right && canvas) {
        const isDark = document.documentElement.classList.contains("dark");
        const dpr = window.devicePixelRatio || 1;
        const rightOriginCss = canvas.width / dpr - gutterWidth;

        ctx!.save();
        ctx!.beginPath();
        ctx!.rect(0, 0, gutterWidth, viewportH);
        ctx!.clip();
        left.step(now, dt, isDark);
        ctx!.restore();

        ctx!.save();
        ctx!.translate(rightOriginCss, 0);
        ctx!.beginPath();
        ctx!.rect(0, 0, gutterWidth, viewportH);
        ctx!.clip();
        right.step(now, dt, isDark);
        ctx!.restore();
      }

      requestAnimationFrame(step);
    }
    const raf = requestAnimationFrame(step);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
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
