import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/active-card";
import { BlogPost } from "@/lib/blog";

interface PostCardProps {
  post: BlogPost;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{post.title}</CardTitle>
        <div className="text-muted-foreground flex items-center text-xs">
          <span>{post.date}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{post.excerpt}</p>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" asChild className="px-0">
          <Link
            href={`/articles/${post.slug}`}
            className="text-primary flex items-center"
          >
            Read article
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
