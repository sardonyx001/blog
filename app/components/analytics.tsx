import Script from "next/script";

// Self-hosted Umami (https://umami.is) analytics — replaces @vercel/analytics,
// which only works when the app is actually deployed on Vercel. The tracking
// script + website id point at the standalone Umami instance at
// umami.jamell.dev (see /opt/apps/umami), configured via env vars so the
// value differs cleanly between local dev and production.
const UMAMI_SRC =
  process.env.NEXT_PUBLIC_UMAMI_SRC ?? "https://umami.jamell.dev/script.js";
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export function Analytics() {
  if (!UMAMI_WEBSITE_ID) return null;
  return (
    <Script
      src={UMAMI_SRC}
      data-website-id={UMAMI_WEBSITE_ID}
      strategy="afterInteractive"
    />
  );
}

// Fire-and-forget custom event tracking via the global `window.umami` the
// script above installs. No-ops if the script hasn't loaded (e.g. dev, or an
// ad-blocker) — mirrors the old `va.track` call site in theme-toggle.tsx.
export function track(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const umami = (window as any).umami;
  if (umami?.track) umami.track(event, data);
}
