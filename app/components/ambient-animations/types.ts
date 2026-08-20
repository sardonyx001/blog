// Shared contract for every ambient background animation. `w`/`h` are CSS
// pixels for one gutter strip (not the whole viewport) — the caller (see
// ../ambient-background.tsx) translates and clips the canvas context to
// that strip before handing it to `create`, so an animation only ever
// thinks about drawing inside its own [0, w] x [0, h] box. `isDark` is
// passed fresh into every `step` call (not baked in at creation) so a
// theme toggle repaints colors immediately without resetting the
// animation's state.
export type AmbientAnimation = {
  step(now: number, dt: number, isDark: boolean): void;
};

export type AmbientAnimationModule = {
  create(ctx: CanvasRenderingContext2D, w: number, h: number): AmbientAnimation;
};
