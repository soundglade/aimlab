import LandingPage from "@/components/landing/landing-page";
import { GetServerSideProps } from "next";
import { getLatestMeditations, Meditation } from "@/lib/latest-meditations";

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
    title: "Creative examples",
    date: "March 28, 2025",
    excerpt: "An inspiring list of creative ways to generate meditations",
  },
  {
    slug: "how-to",
    title: "How-to create guided meditations",
    date: "March 27, 2025",
    excerpt:
      "A step-by-step guide on creating custom guided meditations by using AI chatbots to generate personalized scripts, adding pause markers, and synthesizing them with the Meditation Composer.",
  },
  {
    slug: "welcome",
    title: "Welcome to AIMlab: what and why",
    date: "March 26, 2025",
    excerpt:
      "A personal intro to AIMlab. What is it, why I've created and some more important considerations.",
  },
];

export default function Home({
  latestMeditations,
}: {
  latestMeditations: Meditation[];
}) {
  return (
    <LandingPage blogPosts={blogPosts} latestMeditations={latestMeditations} />
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const latestMeditations = await getLatestMeditations();
  return {
    props: {
      latestMeditations,
    },
  };
};
