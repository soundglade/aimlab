import LandingPage from "@/components/landing/landing-page";
import { GetServerSideProps } from "next";
import { getLatestMeditations, Meditation } from "@/lib/latest-meditations";
import { getLatestRedditPosts, RedditPost } from "@/lib/reddit-posts";

// Define our own BlogPost type since we removed the blog.ts library
export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
};

// Hardcoded blog posts data
const blogPosts: BlogPost[] = [
  {
    slug: "creative-examples",
    title: "Creative Ways to Generate Guided Meditations Using AI",
    date: "March 30, 2025",
    excerpt: "An inspiring list of creative ways to generate meditations",
  },
  {
    slug: "how-to",
    title: "How To Create Guided Meditations",
    date: "March 27, 2025",
    excerpt:
      "A step-by-step guide on creating custom guided meditations by using AI chatbots, adding pause markers, and synthesizing them with the Meditation Composer.",
  },
  {
    slug: "welcome",
    title: "Welcome to AIM Lab: Who, What and Why",
    date: "March 26, 2025",
    excerpt:
      "A personal intro to AIMlab: what is it, why I've created it, and where to start.",
  },
];

export default function Home({
  latestMeditations,
  latestRedditPosts,
}: {
  latestMeditations: Meditation[];
  latestRedditPosts: RedditPost[];
}) {
  return (
    <LandingPage
      blogPosts={blogPosts}
      latestMeditations={latestMeditations}
      latestRedditPosts={latestRedditPosts}
    />
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const latestMeditations = await getLatestMeditations();
  const latestRedditPosts = await getLatestRedditPosts();
  return {
    props: {
      latestMeditations,
      latestRedditPosts,
    },
  };
};
