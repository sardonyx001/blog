"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Suspense } from "react";
import useSWR from "swr";

type SortSetting = ["date" | "views", "desc" | "asc"];

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function Posts({ posts: initialPosts, tag }: { posts: any[]; tag?: string }) {
  const [sort, setSort] = useState<SortSetting>(["date", "desc"]);
  // `/api/posts` always returns every post — filtering happens client-side
  // below so a tag page still reflects the periodic view-count refresh
  // instead of freezing on the server-filtered initialPosts.
  const { data: posts } = useSWR("/api/posts", fetcher, {
    fallbackData: initialPosts,
    refreshInterval: 5000,
  });
  const taggedPosts = tag ? posts.filter((post: any) => post.tags.includes(tag)) : posts;

  function sortDate() {
    setSort(sort => [
      "date",
      sort[0] !== "date" || sort[1] === "asc" ? "desc" : "asc",
    ]);
  }

  function sortViews() {
    setSort(sort => [
      sort[0] === "views" && sort[1] === "asc" ? "date" : "views",
      sort[0] !== "views" ? "desc" : sort[1] === "asc" ? "desc" : "asc",
    ]);
  }

  return (
    <Suspense fallback={null}>
      <main className="max-w-2xl font-mono m-auto mb-10 text-sm">
        <header className="text-gray-500 dark:text-gray-600 flex items-center text-xs">
          <button
            onClick={sortDate}
            className={`w-12 h-9 text-left  ${
              sort[0] === "date" && sort[1] !== "desc"
                ? "text-gray-700 dark:text-gray-400"
                : ""
            }`}
          >
            date
            {sort[0] === "date" && sort[1] === "asc" && "↑"}
          </button>
          <span className="grow pl-2">title</span>
          <button
            onClick={sortViews}
            className={`
                  h-9
                  pl-4
                  ${
                    sort[0] === "views"
                      ? "text-gray-700 dark:text-gray-400"
                      : ""
                  }
                `}
          >
            views
            {sort[0] === "views" ? (sort[1] === "asc" ? "↑" : "↓") : ""}
          </button>
        </header>

        <List posts={taggedPosts} sort={sort} />
      </main>
    </Suspense>
  );
}

function List({ posts, sort }) {
  // sort can be ["date", "desc"] or ["views", "desc"] for example
  const sortedPosts = useMemo(() => {
    const [sortKey, sortDirection] = sort;
    return [...posts].sort((a, b) => {
      if (sortKey === "date") {
        return sortDirection === "desc"
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return sortDirection === "desc" ? b.views - a.views : a.views - b.views;
      }
    });
  }, [posts, sort]);

  return (
    <ul>
      {sortedPosts.map((post, i: number) => {
        const year = getYear(post.date);
        const firstOfYear =
          !sortedPosts[i - 1] || getYear(sortedPosts[i - 1].date) !== year;
        const lastOfYear =
          !sortedPosts[i + 1] || getYear(sortedPosts[i + 1].date) !== year;

        return (
          // The row itself is one big link (the overlay below), but tag
          // pills need their own links — can't nest an <a> inside another
          // <a>. The overlay covers the whole row, and the visible content
          // sits on top with `pointer-events-none` so clicks fall through
          // to it everywhere *except* the tag pills, which opt back in with
          // `pointer-events-auto`. That alone isn't enough though — the
          // overlay is `absolute`, so it paints above the pills' plain
          // static-positioned ancestors regardless of DOM order, and would
          // still win the hit-test; `relative z-10` on the pills themselves
          // puts them in front of it. `:hover`/`:active` on the overlay's
          // ancestor (`.group`) still work — both bubble up from a
          // hovered/pressed descendant per the CSS spec.
          <li key={post.id} className="group relative">
            <Link
              href={`/${new Date(post.date).getFullYear()}/${post.id}`}
              className="absolute inset-0"
              aria-label={post.title}
            />
            <span
              className={`pointer-events-none flex transition-[background-color] group-hover:bg-gray-100 dark:group-hover:bg-[#242424] group-active:bg-gray-200 dark:group-active:bg-[#222] border-y border-gray-200 dark:border-[#313131]
                ${!firstOfYear ? "border-t-0" : ""}
                ${lastOfYear ? "border-b-0" : ""}
              `}
            >
              <span
                className={`py-3 flex grow items-start ${
                  !firstOfYear ? "ml-14" : ""
                }`}
              >
                {firstOfYear && (
                  <span className="w-14 inline-block self-start shrink-0 text-gray-500 dark:text-gray-500">
                    {year}
                  </span>
                )}

                <span className="grow flex flex-col gap-1">
                  <span className="dark:text-gray-100">{post.title}</span>
                  {post.tags.length > 0 && (
                    <span className="flex gap-2 flex-wrap">
                      {post.tags.map(tag => (
                        <Link
                          key={tag}
                          href={`/tags/${tag}`}
                          className="relative z-10 pointer-events-auto text-xs text-gray-500 dark:text-gray-500 hover:text-accent dark:hover:text-accent transition-colors"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </span>
                  )}
                </span>

                <span className="text-gray-500 dark:text-gray-500 text-xs mr-2">
                  {post.viewsFormatted}
                </span>
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function getYear(date: string) {
  return new Date(date).getFullYear();
}
