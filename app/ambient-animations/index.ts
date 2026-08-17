import type { AmbientAnimationModule } from "./types";

export type { AmbientAnimation, AmbientAnimationModule } from "./types";

// One dynamic `import()` per key (not a template-string path) so webpack
// gives each animation its own chunk — a page only ever downloads the one
// module actually picked for that visit, not all of them.
export const AMBIENT_ANIMATION_LOADERS: Record<string, () => Promise<AmbientAnimationModule>> = {
  motes: () => import("./motes"),
  "star-twinkle": () => import("./star-twinkle"),
  "circuit-traces": () => import("./circuit-traces"),
  "orbiting-systems": () => import("./orbiting-systems"),
  "dot-grid-wave": () => import("./dot-grid-wave"),
};

export const AMBIENT_ANIMATION_KEYS = Object.keys(AMBIENT_ANIMATION_LOADERS);
