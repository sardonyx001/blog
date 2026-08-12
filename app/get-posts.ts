import { getAllPostsMeta } from "@/lib/posts";
import redis from "./redis";
import commaNumber from "comma-number";

export type Post = {
  id: string;
  slug: string;
  year: string;
  date: string;
  title: string;
  tags: string[];
  views: number;
  viewsFormatted: string;
};

// shape of the HSET in redis
type Views = {
  [key: string]: string;
};

export const getPosts = async () => {
  let allViews: null | Views = null;
  try {
    allViews = await redis.hgetall("views");
  } catch (err) {
    console.error("failed to read view counts from redis:", err);
  }
  const posts = getAllPostsMeta().map((post): Post => {
    const views = Number(allViews?.[post.id] ?? 0);
    return {
      ...post,
      views,
      viewsFormatted: commaNumber(views),
    };
  });
  return posts;
};
