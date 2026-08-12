import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "posts");

// Filenames follow the `YYYY-MM-DD-slug.mdx` convention (same shape the
// author's existing til notes use) so dropping a new file in `posts/` is
// enough to publish a new post — no code changes needed.
const FILENAME_RE = /^(\d{4})-(\d{2})-(\d{2})-(.+)\.mdx$/;

export type PostMeta = {
  id: string; // == slug, used as the redis views key and route param
  slug: string;
  year: string;
  date: string; // ISO yyyy-mm-dd, from frontmatter
  title: string;
  tags: string[];
};

export type PostWithContent = PostMeta & {
  content: string;
};

function readAllFiles(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR).filter(f => f.endsWith(".mdx"));
}

function parseFile(filename: string): PostWithContent | null {
  const match = filename.match(FILENAME_RE);
  if (!match) return null;
  const [, , , , slug] = match;

  const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
  const { data, content } = matter(raw);

  const title = String(data.title ?? slug);
  const date = data.date
    ? new Date(data.date).toISOString().slice(0, 10)
    : `${match[1]}-${match[2]}-${match[3]}`;
  const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
  const year = date.slice(0, 4);

  // Every til note opens the body with a leading `# Title` heading that
  // duplicates the frontmatter title (confirmed across all migrated posts).
  // The post header already renders the title as an <h1>, so strip a leading
  // H1 unconditionally to avoid rendering it twice — formatting inside the
  // heading (backticks, quote style) can differ slightly from the frontmatter
  // string, so this doesn't require an exact text match.
  const trimmed = content.replace(/^\s*/, "");
  const h1Match = trimmed.match(/^#\s+.+\r?\n+/);
  const body = h1Match ? trimmed.slice(h1Match[0].length) : content;

  return { id: slug, slug, year, date, title, tags, content: body.trim() };
}

export function getAllPostsMeta(): PostMeta[] {
  return readAllFiles()
    .map(parseFile)
    .filter((p): p is PostWithContent => p !== null)
    .map(({ content, ...meta }) => meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(
  year: string,
  slug: string
): PostWithContent | null {
  const files = readAllFiles();
  for (const filename of files) {
    const post = parseFile(filename);
    if (post && post.slug === slug && post.year === year) return post;
  }
  return null;
}
