import { getPosts } from "@/app/get-posts";

export async function GET() {
  const posts = await getPosts();
  const max = 100; // max returned posts
  return new Response(
    `<?xml version="1.0" encoding="utf-8"?>
  <feed xmlns="http://www.w3.org/2005/Atom">
    <title>jamell.dev</title>
    <subtitle>Notes on backend engineering &amp; infrastructure</subtitle>
    <link href="https://jamell.dev/atom" rel="self"/>
    <link href="https://jamell.dev/"/>
    <updated>${posts[0]?.date ?? ""}</updated>
    <id>https://jamell.dev/</id>
    <author>
      <name>Jamel Eddine Lassoued</name>
    </author>
    ${posts.slice(0, max).reduce((acc, post) => {
      return `${acc}
        <entry>
          <id>${post.id}</id>
          <title>${post.title}</title>
          <link href="https://jamell.dev/${post.year}/${post.id}"/>
          <updated>${post.date}</updated>
        </entry>`;
    }, "")}
  </feed>`,
    {
      headers: {
        "Content-Type": "application/atom+xml; charset=utf-8",
      },
    }
  );
}
