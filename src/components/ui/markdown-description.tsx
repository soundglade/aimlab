import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const MAX_URL_LENGTH = 50;

const CustomLink = ({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  let linkText = children;

  if (
    Array.isArray(children) &&
    children.length === 1 &&
    typeof children[0] === "string" &&
    children[0] === href &&
    href.length > MAX_URL_LENGTH
  ) {
    linkText = `${href.substring(0, MAX_URL_LENGTH)}...`;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {linkText}
    </a>
  );
};

export function MarkdownDescription({ content }: { content: string }) {
  return (
    <div
      className={cn(
        "prose dark:prose-invert",
        "prose-headings:font-normal prose-headings:tracking-tigh prose-headings:mt-8 prose-headings:mb-4",
        "prose-a:text-primary prose-a:no-underline prose-a:hover:underline",
        "prose-p:leading-[1.6]",
        "max-w-none [&_p+p]:-mt-1",
        "break-words text-left",
        "[&_img]:mx-auto [&_img]:mt-2 [&_img]:block [&_img]:max-h-[500px]"
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: CustomLink }}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
