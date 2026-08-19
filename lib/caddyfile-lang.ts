import fs from "node:fs/promises";
import path from "node:path";
import type { LanguageRegistration } from "shiki";

// Shiki doesn't bundle a Caddyfile grammar. This is the TextMate grammar
// from the Caddy team's own VS Code extension (MIT-licensed):
// https://github.com/caddyserver/vscode-caddyfile/blob/master/syntaxes/caddyfile.tmLanguage.json
const GRAMMAR_PATH = path.join(process.cwd(), "lib/grammars/caddyfile.tmLanguage.json");

export async function loadCaddyfileLang(): Promise<LanguageRegistration> {
  const raw = JSON.parse(await fs.readFile(GRAMMAR_PATH, "utf-8"));
  // the grammar's own `name` is "Caddyfile" (capitalized) — Shiki matches a
  // fence's ```lang string against this field, so it must be lowercase to
  // match ```caddyfile in posts.
  return { ...raw, name: "caddyfile" };
}
