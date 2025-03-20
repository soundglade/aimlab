import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { BlogPost } from "@/lib/blog";

interface PostLayoutProps {
  post: BlogPost;
}

export function PostLayout({ post }: PostLayoutProps) {
  return (
    <Layout variant="page">
      <Button variant="ghost" asChild className="mb-8 -ml-2">
        <Link href="/blog" className="flex items-center text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to all posts
        </Link>
      </Button>

      <article className="prose prose-headings:font-medium dark:prose-invert max-w-none">
        <header className="mb-8">
          <h1 className="mb-3 text-3xl font-medium tracking-tight leading-10">
            {post.title}
          </h1>
          <div className="text-sm text-muted-foreground">{post.date}</div>
        </header>

        <div
          className="text-muted-foreground space-y-4"
          dangerouslySetInnerHTML={{ __html: post.content || "" }}
        />
      </article>
    </Layout>
  );
}
