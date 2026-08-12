export const revalidate = 60;

import { ImageResponse } from "next/og";
import { getPosts } from "@/app/get-posts";
import commaNumber from "comma-number";
import { loadInter300, loadInter500, loadRobotoMono400 } from "@/lib/og-fonts";

export default async function AboutOG() {
  // fonts
  const inter300 = loadInter300();
  const inter500 = loadInter500();
  const robotoMono400 = loadRobotoMono400();

  const posts = await getPosts();
  const viewsSum = posts.reduce((sum, post) => sum + post.views, 0);

  return new ImageResponse(
    (
      <div
        tw="flex p-10 h-full w-full bg-white flex-col"
        style={font("Inter 300")}
      >
        <main tw="flex grow pt-4 w-full justify-center items-center">
          <div tw="flex flex-col items-center text-[28px]">
            <div tw="text-[64px] mb-7" style={font("Inter 500")}>
              Jamel Eddine Lassoued
            </div>
            <div tw="flex mb-5" style={font("Roboto Mono 400")}>
              <span tw="text-gray-400 mr-3">&mdash;</span> Full Stack Engineer
            </div>
            <div tw="flex mb-5" style={font("Roboto Mono 400")}>
              <span tw="text-gray-400 mr-3">&mdash;</span> Currently building
              at Rakuten Group
            </div>
            <div tw="flex" style={font("Roboto Mono 400")}>
              <span tw="text-gray-400 mr-3">&mdash;</span> Based in Tokyo,
              Japan
            </div>
          </div>
        </main>

        <footer
          tw="flex w-full justify-center text-2xl text-gray-500"
          style={font("Roboto Mono 400")}
        >
          {posts.length} posts / {commaNumber(viewsSum)} views
        </footer>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter 300",
          data: await inter300,
        },
        {
          name: "Inter 500",
          data: await inter500,
        },
        {
          name: "Roboto Mono 400",
          data: await robotoMono400,
        },
      ],
    }
  );
}

// lil helper for more succinct styles
function font(fontFamily: string) {
  return { fontFamily };
}
