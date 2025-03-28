import { GetStaticProps } from "next";
import Link from "next/link";
import { getSortedPostsData, BlogPost } from "@/lib/blog";
import { Layout } from "@/components/layout/Layout";

interface BlogIndexProps {
  posts: BlogPost[];
}

export default function BlogIndex({ posts }: BlogIndexProps) {
  return (
    <Layout variant="page">
      <header className="mb-20 text-center">
        <h1 className="mb-3 text-3xl font-medium tracking-tight md:text-4xl">
          Latest from the Blog
        </h1>
      </header>

      <div className="space-y-12">
        {posts.map((post) => (
          <Link
            href={`/blog/${post.slug}`}
            key={post.slug}
            className="group block"
          >
            <article className="space-y-3">
              {post.date && (
                <p className="text-muted-foreground text-sm">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
              <h2 className="group-hover:text-primary text-xl font-medium transition-colors md:text-2xl">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-muted-foreground">{post.excerpt}</p>
              )}
            </article>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            No posts available yet. Check back soon!
          </p>
        </div>
      )}
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const posts = getSortedPostsData();
  return {
    props: {
      posts,
    },
  };
};
