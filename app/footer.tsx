import { A } from "./(post)/components/a";

export function Footer({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`p-6 pt-3 pb-6 flex text-xs text-center mt-3 dark:text-gray-400 text-gray-500 font-mono ${className}`}
    >

      <div className="grow text-left">
        Jamel Eddine Lassoued (
        <A target="_blank" href="https://twitter.com/whyamihere001">
          @whyamihere001
        </A>
        )
      </div>
      <div>
        <A target="_blank" href="https://github.com/sardonyx001/blog">
          Source
        </A>
      </div>
    </footer>
  );
}
