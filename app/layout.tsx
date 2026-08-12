import "./globals.css";

import { Inter } from "next/font/google";
import { themeEffect } from "./theme-effect";
import { Analytics } from "./analytics";
import { Header } from "./header";
import { Footer } from "./footer";
import { AmbientBackground } from "./ambient-background";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "jamell.dev",
  description:
    "Jamel Eddine Lassoued's personal blog and portfolio — notes on backend engineering, infrastructure, and whatever else is worth writing down.",
  openGraph: {
    title: "jamell.dev",
    description:
      "Jamel Eddine Lassoued's personal blog and portfolio — notes on backend engineering, infrastructure, and whatever else is worth writing down.",
    url: "https://jamell.dev",
    siteName: "jamell.dev",
  },
  twitter: {
    card: "summary_large_image",
    site: "@whyamihere001",
    creator: "@whyamihere001",
  },
  metadataBase: new URL("https://jamell.dev"),
};

export const viewport = {
  themeColor: "transparent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.className} antialiased`}
      suppressHydrationWarning={true}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(${themeEffect.toString()})();`,
          }}
        />
      </head>

      <body className="dark:text-gray-100 max-w-2xl m-auto">
        <AmbientBackground />

        <main className="content-panel p-6 pt-3 md:pt-6 min-h-screen rounded-b-lg">
          <Header />
          {children}
        </main>

        <Footer className="content-panel rounded-t-lg" />
        <Analytics />
      </body>
    </html>
  );
}
