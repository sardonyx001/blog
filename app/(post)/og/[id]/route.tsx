import { ImageResponse } from "next/og";
import { getPosts } from "@/app/get-posts";
import {
  loadInter300,
  loadInter500,
  loadInter600,
  loadRobotoMono400,
} from "@/lib/og-fonts";

// fonts
const inter300 = loadInter300();
const inter500 = loadInter500();
const inter600 = loadInter600();
const robotoMono400 = loadRobotoMono400();

export async function GET(_req: Request, { params: { id } }) {
  const posts = await getPosts();
  const post = posts.find(p => p.id === id);
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        tw="flex p-10 h-full w-full bg-white flex-col"
        style={font("Inter 300")}
      >
        <header tw="flex text-[36px] w-full">
          <div tw="font-bold" style={font("Inter 600")}>
            Jamel Eddine Lassoued
          </div>
          <div tw="grow" />
          <div tw="text-[28px]">jamell.dev</div>
        </header>

        <main tw="flex grow pb-3 flex-col items-center justify-center">
          <div tw="flex">
            <div
              tw="bg-gray-100 p-8 text-7xl font-medium rounded-md text-center"
              style={font("Inter 500")}
            >
              {post.title}
            </div>
          </div>

          <div
            tw="mt-5 flex text-3xl text-gray-500"
            style={font("Roboto Mono 400")}
          >
            {post.date} – {post.viewsFormatted} views
          </div>
        </main>
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
          name: "Inter 600",
          data: await inter600,
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
