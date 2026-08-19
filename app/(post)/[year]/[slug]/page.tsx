import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { createHighlighter } from "shiki";
import { notFound } from "next/navigation";
import { getAllPostsMeta, getPostBySlug } from "@/lib/posts";
import { mdxComponents } from "@/mdx-components";
import { loadCaddyfileLang } from "@/lib/caddyfile-lang";

export const revalidate = 60;

export async function generateStaticParams() {
  return getAllPostsMeta().map(post => ({
    year: post.year,
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { year: string; slug: string };
}) {
  const post = getPostBySlug(params.year, params.slug);
  if (!post) return {};

  const description = post.content
    .replace(/[#*`_>[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      images: [{ url: `/og/${post.id}` }],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: { year: string; slug: string };
}) {
  const post = getPostBySlug(params.year, params.slug);
  if (!post) notFound();

  return (
    <MDXRemote
      source={post.content}
      components={mdxComponents as React.ComponentProps<typeof MDXRemote>["components"]}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            [
              rehypePrettyCode,
              {
                theme: "tokyo-night",
                bypassInlineCode: true,
                defaultLang: "text",
                // Shiki doesn't bundle a Caddyfile grammar. rehype-pretty-code's
                // default highlighter starts with just `langs: ["plaintext"]`
                // and lazily calls `highlighter.loadLanguage(lang)` per fence
                // for everything else (bash, python, ...) — mirror that here,
                // just with the custom grammar (lib/caddyfile-lang.ts) added
                // up front, so every other language still loads on demand.
                getHighlighter: (opts: Parameters<typeof createHighlighter>[0]) =>
                  createHighlighter({
                    ...opts,
                    langs: ["plaintext", loadCaddyfileLang],
                  }),
              },
            ],
          ],
        },
      }}
    />
  );
}
