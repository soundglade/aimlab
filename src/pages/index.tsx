import LandingPage from "@/components/landing/landing-page";
import { GetServerSideProps } from "next";
import { getSortedPostsData, BlogPost } from "@/lib/blog";

export default function Home({ blogPosts }: { blogPosts: BlogPost[] }) {
  return <LandingPage blogPosts={blogPosts} />;
}

export const getServerSideProps: GetServerSideProps = async () => {
  const blogPosts = getSortedPostsData();
  return {
    props: {
      blogPosts,
    },
  };
};
