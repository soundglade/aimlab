import LandingPage from "@/components/landing/landing-page";
import { GetServerSideProps } from "next";
import { getSortedPostsData, BlogPost } from "@/lib/blog";
import { getLatestMeditations, Meditation } from "@/lib/latest-meditations";

export default function Home({
  blogPosts,
  latestMeditations,
}: {
  blogPosts: BlogPost[];
  latestMeditations: Meditation[];
}) {
  return (
    <LandingPage blogPosts={blogPosts} latestMeditations={latestMeditations} />
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const blogPosts = getSortedPostsData();
  const latestMeditations = await getLatestMeditations();
  return {
    props: {
      blogPosts,
      latestMeditations,
    },
  };
};
