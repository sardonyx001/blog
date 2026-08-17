// `isBlockCode` is set by `Snippet` (see snippet.tsx) on the `<code>` it
// wraps — a fenced code block is already syntax-highlighted by
// rehype-pretty-code at that point, so it must render bare instead of
// picking up the inline-code pill styling below (meant for text like
// `foo` inside a sentence).
export const Code = ({ children, isBlockCode, ...props }) => {
  if (isBlockCode) {
    return <code {...props}>{children}</code>;
  }

  return (
    <code
      {...props}
      className={`
        [p_&]:text-sm
        [p_&]:px-1
        [p_&]:py-0.5
        [p_&]:rounded-sm
        [p_&]:bg-gray-200
        dark:[p_&]:bg-[#333]
      `}
    >
      {children}
    </code>
  );
};
