import { Posts } from "./posts";
import { getPosts } from "./get-posts";
import { LainPortrait } from "./lain-portrait";

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
