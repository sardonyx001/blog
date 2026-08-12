import { readFile } from "node:fs/promises";
import path from "node:path";

// OG image routes run on the default (nodejs) runtime now — needed so they
// can call getPosts(), which reads from self-hosted redis via ioredis (a
// plain TCP client, not usable on the edge runtime). The previous
// `fetch(new URL(..., import.meta.url))` font-loading trick only resolves
// correctly under the edge runtime; under nodejs we read the font files
// straight off disk instead — from public/fonts/ (copied from the
// @fontsource packages once, see public/fonts/ itself), not node_modules.
// node_modules doesn't work here: pnpm's node_modules/@fontsource/* entries
// are symlinks into its .pnpm virtual store, and the standalone Docker
// build only copies what it's told to, not symlink targets outside that
// path — every /og/* route 500'd in production until this moved to public/.
async function loadFont(filename: string): Promise<ArrayBuffer> {
  const buf = await readFile(path.join(process.cwd(), "public", "fonts", filename));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export function loadInter300() {
  return loadFont("inter-latin-300-normal.woff");
}
export function loadInter500() {
  return loadFont("inter-latin-500-normal.woff");
}
export function loadInter600() {
  return loadFont("inter-latin-600-normal.woff");
}
export function loadRobotoMono400() {
  return loadFont("roboto-mono-latin-400-normal.woff");
}
