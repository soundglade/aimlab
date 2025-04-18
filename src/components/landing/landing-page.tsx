import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Users,
  BookOpen,
  ScrollText,
  Globe,
  Megaphone,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";

import { BlogPost } from "@/pages/index";
import { Meditation } from "@/lib/latest-meditations";
import { RedditPost } from "@/lib/reddit-posts";
import { useRouter } from "next/router";

const changelog = [
  {
    text: "Upload meditation cover image",
    date: "2025-04-11T12:00:00Z",
  },
  {
    text: "Two new voices available",
    date: "2025-04-11T09:00:00Z",
  },
  {
    text: "Reddit posts displayed on landing page",
    date: "2025-04-08T12:00:00Z",
  },
  {
    text: "Ending bell added to meditation player",
    date: "2025-04-07T12:00:00Z",
  },
];

import { timeAgo } from "@/lib/time";

export default function LandingPage({
  blogPosts,
  latestMeditations,
  latestRedditPosts,
}: {
  blogPosts: BlogPost[];
  latestMeditations: Meditation[];
  latestRedditPosts: RedditPost[];
}) {
  const router = useRouter();
  const [showChangelog, setShowChangelog] = React.useState(false);

  const handleMeditationClick = (url: string) => {
    router.push(url);
  };

  const latest = changelog[0];

  return (
    <Layout>
      {/* Hero */}
      <section
        className={`mb-16 mt-6 flex w-full flex-col items-center px-4 text-center md:mt-12`}
      >
        <h1 className="text-primary mb-3 text-5xl font-semibold tracking-tighter">
          AIM Lab
        </h1>
        <h2 className="text-secondary-foreground mb-4 text-2xl tracking-tight">
          The AI Meditation Playground
        </h2>
        <p className="text-muted-foreground mb-5 max-w-2xl">
          Welcome to AIM Lab, a creative hub to explore AI and meditation.
          <br className="hidden sm:block" />
          {` `}
          We've designed this space for collaborative experimentation and
          discovery.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/composer">
              Create a Meditation
              <Sparkles className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/articles/creative-examples">
              Check out Examples
              <BookOpen className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-6 hidden min-w-[410px] flex-col items-center gap-2 md:flex">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hover:bg-accent group h-auto w-full justify-start px-3 py-1 transition-colors"
            onClick={() => setShowChangelog((v) => !v)}
          >
            <div className="flex w-full items-center justify-between gap-2 overflow-hidden text-left">
              <span className="text-muted-foreground flex items-center gap-1.5 truncate text-sm font-normal">
                <Megaphone className="mr-1 h-3.5 w-3.5" />
                {latest.text}
              </span>
              <span className="text-muted-foreground whitespace-nowrap text-xs">
                {timeAgo(latest.date)}
              </span>
            </div>
          </Button>
          {showChangelog && (
            <div
              id="changelog-card"
              className="bg-muted mt-2 w-full max-w-md space-y-2 rounded-xl border p-3"
            >
              <ul className="space-y-2">
                {changelog.slice(1).map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between gap-2 border-b pb-2 last:border-b-0 last:pb-0"
                  >
                    <span className="truncate text-sm">{item.text}</span>
                    <span className="text-muted-foreground whitespace-nowrap text-xs">
                      {timeAgo(item.date)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <div id="meditations" className="invisible relative -top-4"></div>

      {/* Recent Community Meditations */}
      <section className={`mb-10 w-full max-w-4xl px-4`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl tracking-tight">
            <ScrollText className="h-5 w-5" />
            Meditations
          </h2>
          <Button variant="ghost" asChild size="sm">
            <Link
              href="/meditations"
              className="text-muted-foreground mt-1 flex items-center md:mr-0"
            >
              <span className="hidden md:inline">View all</span>
              <ArrowRight className="-ml-1 h-4 w-4 md:ml-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {latestMeditations.map((meditation, index) => (
            <Button
              key={index}
              type="button"
              variant="outline"
              className="hover:bg-accent group h-auto w-full justify-start px-5 py-3 transition-colors"
              onClick={() => handleMeditationClick(meditation.link)}
            >
              <div className="flex w-full items-center justify-between gap-2 overflow-hidden text-left">
                <span className="truncate">{meditation.title}</span>
                <span className="text-muted-foreground whitespace-nowrap text-xs">
                  {meditation.timeAgo}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </section>

      <div id="community" className="invisible relative -top-4"></div>

      {/* Community */}
      <section className={`mb-10 w-full max-w-4xl px-4`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl tracking-tight">
            <Users className="h-5 w-5" />
            Community
          </h2>
          <Button variant="ghost" asChild size="sm">
            <Link
              href="https://www.reddit.com/r/AIMeditationLab/"
              target="_blank"
              className="text-muted-foreground mt-1 flex items-center md:mr-0"
            >
              <span className="hidden md:inline">Visit r/AIMeditationLab</span>
              <ArrowRight className="-ml-1 h-4 w-4 md:ml-1" />
            </Link>
          </Button>
        </div>

        <div className="border-1 rounded-xl bg-white px-6 py-6 dark:bg-gray-900 md:px-10 md:py-10">
          <div className="space-y-6">
            {latestRedditPosts.map((post, index) => (
              <Link
                href={post.permalink}
                key={post.id}
                className="group block"
                target="_blank"
              >
                <article className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <span>u/{post.author}</span>
                    <span>•</span>
                    <span>{post.timeAgo}</span>
                  </div>
                  <h2 className="group-hover:text-primary text-medium text-xl transition-colors">
                    {post.title}
                  </h2>
                  {post.selftext && (
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {post.selftext}
                    </p>
                  )}
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className={`mb-10 w-full max-w-4xl px-4`}>
        <h2 className="flex items-center gap-2 text-2xl tracking-tight">
          <BookOpen className="h-5 w-5" />
          Articles
        </h2>
        <div className="border-1 mt-6 max-w-4xl rounded-xl bg-white px-6 py-6 dark:bg-gray-900 md:px-10 md:py-10">
          <div className="space-y-10">
            {blogPosts.map((post) => (
              <Link
                href={`/articles/${post.slug}`}
                key={post.slug}
                className="group block"
              >
                <article className="space-y-1">
                  {post.date && (
                    <p className="text-muted-foreground text-xs">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                  <h2 className="group-hover:text-primary text-medium text-xl transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-muted-foreground">{post.excerpt}</p>
                  )}
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
