import { type ReactNode, Suspense } from "react";
import { type Tweet, getTweet } from "react-tweet/api";
import {
  EmbeddedTweet,
  TweetNotFound,
  TweetSkeleton,
  type TweetProps,
} from "react-tweet";
import redis from "@/app/redis";
import { Caption } from "./caption";
import "./tweet.css";

interface TweetArgs {
  id: string;
  caption: ReactNode;
}

async function getAndCacheTweet(id: string): Promise<Tweet | undefined> {
  // we first prioritize getting a fresh tweet
  try {
    const tweet = await getTweet(id);

    // @ts-ignore
    if (tweet && !tweet.tombstone) {
      // we populate the cache if we have a fresh tweet — ioredis (unlike
      // @upstash/redis) doesn't auto-serialize objects, so JSON.stringify
      // explicitly on write and JSON.parse on read below
      await redis.set(`tweet:${id}`, JSON.stringify(tweet));
      return tweet;
    }
  } catch (error) {
    console.error("tweet fetch error", error);
  }

  const cachedRaw = await redis.get(`tweet:${id}`);
  const cachedTweet: Tweet | null = cachedRaw ? JSON.parse(cachedRaw) : null;

  // @ts-ignore
  if (!cachedTweet || cachedTweet.tombstone) return undefined;
  console.log("tweet cache hit", id);

  return cachedTweet;
}

const TweetContent = async ({ id, components }: TweetProps) => {
  const tweet = id ? await getAndCacheTweet(id) : undefined;

  if (!tweet) {
    return <TweetNotFound />;
  }

  return <EmbeddedTweet tweet={tweet} components={components} />;
};

export const ReactTweet = (props: TweetProps) => (
  <Suspense fallback={<TweetSkeleton />}>
    {/* @ts-ignore: Async components are valid in the app directory */}
    <TweetContent {...props} />
  </Suspense>
);

export async function Tweet({ id, caption }: TweetArgs) {
  return (
    <div className="tweet my-6">
      <div className={`flex justify-center`}>
        <ReactTweet id={id} />
      </div>
      {caption && <Caption>{caption}</Caption>}
    </div>
  );
}
