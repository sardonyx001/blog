import { cloneElement, isValidElement, type ReactNode } from "react";
import { Caption } from "./caption";
import { CopyButton } from "./copy-button";

function textContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  if (isValidElement(node)) return textContent((node.props as { children?: ReactNode }).children);
  return "";
}

// `children` is already the `<code>` element for this fenced block — the
// MDX renderer substitutes components by tag name across the whole tree, so
// the nested `code` node was already turned into our `Code` component by
// the time it reaches here. Rendering it directly (not re-wrapping it in
// another literal `<code>`) avoids a doubled `<code><code>` nesting.
// `...rest` carries whatever rehype-pretty-code (via the "tokyo-night"
// theme) attached to its generated `<pre>` — background color, language,
// etc. — onto our own `<pre>`.
export const Snippet = ({ children, scroll = true, caption = null, ...rest }) => {
  // flag the nested `Code` instance as block-level so it skips the
  // inline-code pill styling meant for text like `foo` inside a sentence —
  // it's already syntax-highlighted by rehype-pretty-code at this point.
  const code = isValidElement(children) ? cloneElement(children, { isBlockCode: true } as any) : children;

  return (
    <div className="my-6">
      <div className="group relative">
        <pre
          {...rest}
          className={`
      p-4
      text-sm

      ${
        scroll
          ? "overflow-scroll"
          : "whitespace-pre-wrap break-all overflow-hidden"
      }

      ${rest.className ?? ""}
    `}
        >
          {code}
        </pre>

        <CopyButton text={textContent(children).replace(/\n$/, "")} />
      </div>

      {caption != null ? <Caption>{caption}</Caption> : null}
    </div>
  );
};
