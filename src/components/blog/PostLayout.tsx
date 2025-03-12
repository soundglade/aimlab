import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layouts/Layout";
import { BlogPost } from "@/lib/blog";

interface PostLayoutProps {
  post: BlogPost;
}

export function PostLayout({ post }: PostLayoutProps) {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Button variant="ghost" asChild className="mb-8 -ml-2">
          <Link
            href="/blog"
            className="flex items-center text-muted-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to all posts
          </Link>
        </Button>

        <article className="prose dark:prose-invert max-w-none">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-2">
              {post.title}
            </h1>
            <div className="text-sm text-muted-foreground">{post.date}</div>
          </header>

          <div
            className="text-muted-foreground space-y-4"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />
        </article>
      </div>
    </Layout>
  );
}
