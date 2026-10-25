import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

interface LessonContentProps {
  body: string | null;
  videoUrl: string | null;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
      const pathParts = parsed.pathname.split("/").filter(Boolean);
      if (pathParts[0] === "embed" || pathParts[0] === "shorts") {
        return `https://www.youtube-nocookie.com/embed/${pathParts[1]}`;
      }
    } else if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.replace(/^\//, "");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

export function LessonContent({ body, videoUrl }: LessonContentProps) {
  const youtubeEmbed = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;

  return (
    <div className="space-y-8">
      {videoUrl && (
        <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black aspect-video shadow-sm">
          {youtubeEmbed ? (
            <iframe
              src={youtubeEmbed}
              title="Lesson Video"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={videoUrl}
              controls
              className="w-full h-full"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}

      {body ? (
        <article className="prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed text-sm sm:text-base space-y-4">
          <ReactMarkdown
            rehypePlugins={[rehypeSanitize]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 mt-6 mb-3">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-5 mb-2">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-4 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1.5 mb-4 pl-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1.5 mb-4 pl-2">{children}</ol>
              ),
              li: ({ children }) => <li className="text-zinc-700 dark:text-zinc-300">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-indigo-500 pl-4 py-1 italic my-4 text-zinc-600 dark:text-zinc-400 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-r-lg">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-pink-600 dark:text-pink-400">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="p-4 rounded-xl bg-zinc-900 text-zinc-100 text-xs font-mono overflow-x-auto my-4">
                  {children}
                </pre>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-left text-xs">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="bg-zinc-100 dark:bg-zinc-800 px-3 py-2 font-semibold text-zinc-900 dark:text-zinc-100">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border-t border-zinc-100 dark:border-zinc-800 px-3 py-2 text-zinc-700 dark:text-zinc-300">
                  {children}
                </td>
              ),
            }}
          >
            {body}
          </ReactMarkdown>
        </article>
      ) : (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
          <p className="text-xs text-zinc-400 italic">This lesson has no written content yet.</p>
        </div>
      )}
    </div>
  );
}
