import Link from "next/link";

export function A({ children, className = "", href, ...props }) {
  if (href[0] === "#") {
    return (
      <a
        href={href}
        className={`border-b text-accent border-accent/40 transition-colors hover:border-accent ${className}`}
        {...props}
      >
        {children}
      </a>
    );
  } else {
    return (
      <Link
        href={href}
        className={`border-b text-accent border-accent/40 transition-colors hover:border-accent ${className}`}
        {...props}
      >
        {children}
      </Link>
    );
  }
}
