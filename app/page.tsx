import { Posts } from "./components/posts";
import { getPosts } from "./get-posts";
import { LainPortrait } from "./components/lain-portrait";

export const revalidate = 60;

export default async function Home() {
  const posts = await getPosts();
  return (
    <>
      <LainPortrait />
      <Posts posts={posts} />
    </>
  );
}
