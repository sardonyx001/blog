#!/usr/bin/env python3
"""
Convert scripts/ascii-source/lain-source.png into dense Unicode block-character
ASCII art, in the same style vin.gg used for its portrait (referenced in the
site redesign spec) — pixel luminance sampled into a density-mapped character
ramp, monospace-aspect corrected (terminal glyphs are taller than wide, so we
sample more columns than a naive square grid would give).

Source: lain.fandom.com's "Lain-transparent.png" — a flat-color, front-facing
bust portrait of Lain Iwakura, transparent background, 689x872. Good ASCII
conversion candidates need clean silhouettes, not photographic detail; this
cel-style image is close to ideal.

Usage: python3 scripts/ascii-art.py [--cols N] [--out PATH]
Writes a plain-text grid (spaces + ░▒▓█) to stdout / --out.
"""
import argparse
import sys
from pathlib import Path

from PIL import Image

RAMP = " ░▒▓█"  # light -> dense, index 0 reserved for transparent/background
CHAR_ASPECT = 0.52  # terminal monospace glyphs are ~taller than wide


def to_ascii(img: Image.Image, cols: int) -> str:
    img = img.convert("RGBA")
    w, h = img.size
    rows = max(1, round(cols * (h / w) * CHAR_ASPECT))

    cell_w = w / cols
    cell_h = h / rows

    px = img.load()
    cells = []  # (avg_alpha, avg_lum) per cell, row-major
    lums = []
    for ry in range(rows):
        y0 = int(ry * cell_h)
        y1 = max(y0 + 1, int((ry + 1) * cell_h))
        row = []
        for cx in range(cols):
            x0 = int(cx * cell_w)
            x1 = max(x0 + 1, int((cx + 1) * cell_w))

            total_lum = 0.0
            total_alpha = 0.0
            count = 0
            for y in range(y0, min(y1, h)):
                for x in range(x0, min(x1, w)):
                    r, g, b, a = px[x, y]
                    lum = 0.299 * r + 0.587 * g + 0.114 * b
                    total_lum += lum * (a / 255.0)
                    total_alpha += a / 255.0
                    count += 1

            avg_alpha = total_alpha / count if count else 0
            avg_lum = total_lum / total_alpha if total_alpha > 0 else 255
            row.append((avg_alpha, avg_lum))
            if avg_alpha >= 0.25:
                lums.append(avg_lum)
        cells.append(row)

    # Contrast-stretch using the actual luminance range of the subject
    # (percentiles, not the raw 0..255 range) so mid-tone detail — eyes,
    # bangs, the collar seam — doesn't get crushed into one or two ramp
    # levels just because the source is mostly pale skin.
    lums.sort()
    lo = lums[int(len(lums) * 0.03)] if lums else 0
    hi = lums[int(len(lums) * 0.97)] if lums else 255
    span = max(1.0, hi - lo)

    lines = []
    for row in cells:
        line_chars = []
        for avg_alpha, avg_lum in row:
            if avg_alpha < 0.25:
                line_chars.append(" ")
                continue
            norm = max(0.0, min(1.0, (avg_lum - lo) / span))
            # darker pixel (hair, eyes, sweater) -> denser glyph
            level = 1 + round((1 - norm) * (len(RAMP) - 2))
            level = max(1, min(len(RAMP) - 1, level))
            line_chars.append(RAMP[level])
        lines.append("".join(line_chars).rstrip())
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cols", type=int, default=100)
    ap.add_argument(
        "--source",
        default=str(Path(__file__).parent / "ascii-source" / "lain-source-cropped.png"),
        help=(
            "lain-source-cropped.png (top 78%% of lain-source.png, head+shoulders "
            "only — cropping out the full-width sweater at the very bottom kept "
            "the art from being dominated by one giant solid block)"
        ),
    )
    ap.add_argument("--out", default=None)
    args = ap.parse_args()

    img = Image.open(args.source)
    art = to_ascii(img, args.cols)

    if args.out:
        Path(args.out).write_text(art + "\n", encoding="utf-8")
        print(f"wrote {args.out} ({args.cols} cols x {art.count(chr(10)) + 1} rows)", file=sys.stderr)
    else:
        print(art)


if __name__ == "__main__":
    main()
