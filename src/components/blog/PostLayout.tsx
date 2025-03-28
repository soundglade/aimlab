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
      <Button variant="ghost" asChild className="-ml-2 mb-8">
        <Link href="/" className="text-muted-foreground flex items-center">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to home
        </Link>
      </Button>

      <article className="prose prose-headings:font-medium dark:prose-invert max-w-none">
        <header className="mb-8">
          <h1 className="mb-3 text-3xl font-medium leading-10 tracking-tight">
            {post.title}
          </h1>
          <div className="text-muted-foreground text-sm">{post.date}</div>
        </header>

        <div
          className="text-muted-foreground space-y-4"
          dangerouslySetInnerHTML={{ __html: post.content || "" }}
        />
      </article>
    </Layout>
  );
}
