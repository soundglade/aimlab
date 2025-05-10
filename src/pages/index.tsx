import LandingPage from "@/components/landing/landing-page";
import { GetServerSideProps } from "next";
import {
  getLatestMeditations,
  LatestMeditation,
} from "@/lib/latest-meditations";
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
    slug: "third-week",
    title:
      "Instant meditation player, new domain, and surprising AI connections.",
    date: "April 28, 2025",
    excerpt:
      "Announcing the launch of the instant meditation player, new domain, newsletter, and some interesting reflections on AI-generated meditations and human experience.",
  },
  {
    slug: "second-week",
    title:
      "Meditation reader, multilingual practices, and a 7-day challenge: week two updates.",
    date: "April 21, 2025",
    excerpt:
      "A preview of the Instant Meditation Reader is ready. Discussing multi-lingual meditations, using the reader for private meditations, and a 7-day AI meditation challenge.",
  },
  {
    slug: "first-week",
    title: "100 meditators, becoming-animal, and Shinzen Young: what a week!",
    date: "April 14, 2025",
    excerpt:
      "r/AIMeditationLab reached 100 users! Members created new meditations like 'Becoming-Animal' and 'The Detective of You.' New features include meditation descriptions and cover images.",
  },
  {
    slug: "creative-examples",
    title: "Creative ways to generate meditations using AI",
    date: "March 30, 2025",
    excerpt: "An inspiring list of creative ways to generate meditations",
  },
  {
    slug: "how-to",
    title: "How to create meditations using AIM Lab",
    date: "March 27, 2025",
    excerpt:
      "A step-by-step guide on creating custom guided meditations by using AI chatbots, adding pause markers, and synthesizing them with the Meditation Studio.",
  },
  {
    slug: "welcome",
    title: "Welcome to AIM Lab: who, what and why",
    date: "March 26, 2025",
    excerpt:
      "A personal intro to AIMlab: what is it, why I've created it, and where to start.",
  },
];

export default function Home({
  latestMeditations,
  latestRedditPosts,
}: {
  latestMeditations: LatestMeditation[];
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
