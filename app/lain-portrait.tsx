import { LAIN_ASCII_DARK } from "./lain-ascii";

// The homepage's visual centerpiece — a Serial Experiments Lain-inspired
// ASCII portrait rendered in dot-density glyphs (see scripts/ascii-art.py +
// app/lain-ascii.ts for how it's generated).
//
// The panel background is *always* dark, regardless of the site's
// light/dark theme. The density ramp only reads as a recognizable portrait
// one way at a time — dense glyphs as dark ink on a light backdrop, or (via
// LAIN_ASCII_DARK's mirrored ramp) as a light glow on a dark one — and the
// light-backdrop version looked washed out against the site's actual light
// theme background (too close in value to read as "ink on paper"). Always
// using the dark backdrop + LAIN_ASCII_DARK sidesteps that entirely, so the
// portrait looks the same regardless of site theme — same idea as the
// ambient background, which is dark-canvas-native too.
//
// `leading` is a unitless multiplier, not `rem` — `rem` is relative to the
// *root* font-size, not this element's own tiny 4.6px one, so if a desktop
// browser's minimum-font-size setting bumps this element's font-size up
// (common on desktop, rare on mobile) a rem-based line-height wouldn't
// track it and the character grid would misalign/desync from the intended
// aspect. A unitless line-height always scales with whatever font-size
// actually gets applied.
//
// The multiplier itself (1.02) is tuned so the rendered character cell's
// width:height ratio matches CHAR_ASPECT (0.52) from ascii-art.py — that's
// the ratio the script assumed when it computed how many rows to generate
// for a given column count, so the whole grid reproduces the source image's
// actual ~1:1 aspect ratio instead of being stretched. If you change
// font-size, tracking, or the font itself, re-measure the rendered char
// width via getBoundingClientRect() and recompute this.
export function LainPortrait() {
  return (
    <div className="rounded-lg mb-6 overflow-hidden border border-black/10 dark:border-white/10 shadow-sm max-w-[220px] mx-auto sm:mx-0">
      <div className="flex justify-center px-2 py-3" style={{ backgroundColor: "#17181a" }}>
        <pre
          aria-label="ASCII art portrait inspired by Lain Iwakura from Serial Experiments Lain"
          className="leading-[1.02] tracking-[0.01em] select-none whitespace-pre font-mono"
          style={{ fontSize: "4.6px", color: "#8fb4f0" }}
        >
          {LAIN_ASCII_DARK}
        </pre>
      </div>
    </div>
  );
}
