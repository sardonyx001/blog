import { LAIN_ASCII } from "./lain-ascii";

// The homepage's visual centerpiece — a Serial Experiments Lain-inspired
// ASCII portrait rendered in dense Unicode block characters (see
// scripts/ascii-art.py + app/lain-ascii.ts for how it's generated).
//
// The density ramp maps dark source pixels (hair, eyes) to heavy glyphs and
// light pixels (skin) to sparse ones — the same convention as printing dark
// ink on paper. That only reads as a recognizable portrait against a *light*
// panel, so this card intentionally uses a fixed light backdrop regardless
// of the site's active theme (verified via screenshot: the same art on a
// dark panel reads as a featureless helmet, not a face) — it's a framed art
// object, like a photo print, rather than something that needs to blend into
// the surrounding page.
export function LainPortrait() {
  return (
    <div className="rounded-lg mb-6 overflow-hidden border border-black/10 shadow-sm">
      <div className="bg-[#12141a] px-4 py-2 flex items-center justify-between font-mono text-[10px] text-accent/80">
        <span>~/whoami.ascii</span>
        <span className="hidden sm:inline">serial-experiments-lain.exe</span>
      </div>
      <div className="bg-[#f3f2ee] flex justify-center px-2 py-4 sm:py-6">
        <pre
          aria-label="ASCII art portrait inspired by Lain Iwakura from Serial Experiments Lain"
          className="leading-[0.62rem] sm:leading-[0.72rem] tracking-[0.02em] select-none whitespace-pre font-mono"
          style={{ fontSize: "5.4px", color: "#4f74c4" }}
        >
          {LAIN_ASCII}
        </pre>
      </div>
    </div>
  );
}
