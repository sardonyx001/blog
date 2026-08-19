import { notFound } from "next/navigation";
import { Posts } from "@/app/posts";
import { getPosts } from "@/app/get-posts";
import { getAllPostsMeta } from "@/lib/posts";

export const revalidate = 60;

export async function generateStaticParams() {
  const tags = new Set<string>();
  for (const post of getAllPostsMeta()) {
    for (const tag of post.tags) tags.add(tag);
  }
  return [...tags].map(tag => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: { tag: string };
}) {
  return { title: `#${params.tag} — jamell.dev` };
}

export default async function TagPage({
  params,
}: {
  params: { tag: string };
}) {
  const posts = await getPosts();
  if (!posts.some(post => post.tags.includes(params.tag))) notFound();

  return (
    <>
      <h1 className="text-2xl font-bold mb-4 dark:text-gray-100 font-mono">
        #{params.tag}
      </h1>
      <Posts posts={posts} tag={params.tag} />
    </>
  );
}
