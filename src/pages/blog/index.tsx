import { GetStaticProps } from "next";
import { Layout } from "@/components/layouts/Layout";
import { PostCard } from "@/components/blog/PostCard";
import { getSortedPostsData, BlogPost } from "@/lib/blog";

interface BlogIndexProps {
  posts: BlogPost[];
}

export default function BlogIndex({ posts }: BlogIndexProps) {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-3">
            Latest from the Lab
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our thoughts on AI meditation, experimental findings, and
            the evolving intersection of technology and mindful practices.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No posts available yet. Check back soon!
            </p>
          </div>
        )}
      </div>
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
