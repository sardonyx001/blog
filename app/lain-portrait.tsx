import { LAIN_ASCII, LAIN_ASCII_DARK } from "./lain-ascii";

// The homepage's visual centerpiece — a Serial Experiments Lain-inspired
// ASCII portrait rendered in dense Unicode block characters (see
// scripts/ascii-art.py + app/lain-ascii.ts for how it's generated).
//
// The density ramp maps dark source pixels (hair, eyes) to heavy glyphs and
// light pixels (skin) to sparse ones — the same convention as printing dark
// ink on paper, which only reads as a recognizable portrait against a
// *light* backdrop. Against a dark backdrop the same glyphs read as a
// featureless helmet, so LAIN_ASCII_DARK (see lain-ascii.ts) mirrors the
// density ramp for that case instead. Both variants are rendered and
// toggled with Tailwind's `dark:` class so there's no client-side flicker,
// and the panel itself uses `content-panel` (the same translucent backdrop
// used elsewhere) so it blends with the page instead of standing out as a
// fixed white/black block.
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
// actual ~1:1 aspect ratio instead of being stretched. (A previous value,
// 1.81, was inherited from the pre-shrink layout and never re-derived after
// the font-size changed — it rendered a visibly tall, non-square portrait.)
// If you change font-size, tracking, or the font itself, re-measure the
// rendered char width via getBoundingClientRect() and recompute this.
export function LainPortrait() {
  return (
    <div className="rounded-lg mb-6 overflow-hidden border border-black/10 dark:border-white/10 shadow-sm max-w-[220px] mx-auto sm:mx-0">
      <div className="bg-[#12141a] px-3 py-1.5 flex items-center justify-between font-mono text-[8px] text-accent/80">
        <span>~/whoami.ascii</span>
      </div>
      <div className="content-panel flex justify-center px-2 py-3">
        <pre
          aria-label="ASCII art portrait inspired by Lain Iwakura from Serial Experiments Lain"
          className="leading-[1.02] tracking-[0.01em] select-none whitespace-pre font-mono dark:hidden"
          style={{ fontSize: "4.6px", color: "#4f74c4" }}
        >
          {LAIN_ASCII}
        </pre>
        <pre
          aria-label="ASCII art portrait inspired by Lain Iwakura from Serial Experiments Lain"
          className="hidden leading-[1.02] tracking-[0.01em] select-none whitespace-pre font-mono dark:block"
          style={{ fontSize: "4.6px", color: "var(--accent)" }}
        >
          {LAIN_ASCII_DARK}
        </pre>
      </div>
    </div>
  );
}
