import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Layout } from "@/components/layout/Layout";

interface PostLayoutProps {
  title: React.ReactNode | string;
  date: string;
  content: React.ReactNode;
}

export function PostLayout({ title, date, content }: PostLayoutProps) {
  return (
    <Layout variant="page">
      <Button variant="ghost" asChild className="-ml-2 mb-2">
        <Link href="/" className="text-muted-foreground flex items-center">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Link>
      </Button>

      <article
        className={cn(
          "prose dark:prose-invert",
          "prose-headings:font-normal prose-headings:tracking-tigh prose-headings:mt-8 prose-headings:mb-4",
          "prose-a:text-primary prose-a:no-underline prose-a:hover:underline",
          "prose-p:leading-[1.6]",
          "max-w-none [&_p+p]:-mt-1"
        )}
      >
        <header className="mb-8">
          <h1 className="mb-3 text-3xl font-normal tracking-tight md:text-4xl">
            {title}
          </h1>
          <div className="text-muted-foreground text-sm">{date}</div>
        </header>

        <div className="text-muted-foreground space-y-4">{content}</div>
      </article>
    </Layout>
  );
}
