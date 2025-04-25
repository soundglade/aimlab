import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Users,
  BookOpen,
  ScrollText,
  Megaphone,
  ExternalLink,
  PencilRuler,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SubscribeForm } from "./subscribe-form";

import { BlogPost } from "@/pages/index";
import { Meditation } from "@/lib/latest-meditations";
import { RedditPost } from "@/lib/reddit-posts";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";

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

  // Hardcoded slug for the latest newsletter
  const latestNewsletterSlug = "second-week";
  const latestNewsletter = blogPosts.find(
    (post) => post.slug === latestNewsletterSlug
  );
  const filteredBlogPosts = blogPosts.filter(
    (post) => post.slug !== latestNewsletterSlug
  );

  const handleMeditationClick = (url: string) => {
    router.push(url);
  };

  return (
    <Layout showChangelog={true}>
      {/* Hero */}
      <section
        className={`mb-14 mt-2 flex w-full flex-col items-center px-4 text-center md:mt-8`}
      >
        <h1 className="text-primary mb-3 text-5xl font-semibold tracking-tighter">
          AIM Lab
        </h1>
        <h2 className="text-secondary-foreground mb-2 text-2xl tracking-tight">
          The AI Meditation Playground
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl">
          Welcome to AIM Lab, a creative hub <br className="block sm:hidden" />
          to explore AI and meditation
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/instant">
              Instant Player
              <Sparkles className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/studio">
              Publish & Share Studio
              <PencilRuler className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <Button asChild size="lg" variant="link" className="mt-4">
          <Link href="/articles/creative-examples">
            Need inspiration? <BookOpen className="h-4 w-4" /> Check out some
            creative examples
          </Link>
        </Button>
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

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
          {latestMeditations.map((meditation, index) => (
            <Button
              key={index}
              type="button"
              variant="outline"
              className={cn(
                "hover:bg-accent group h-auto w-full justify-start px-5 py-3 transition-colors",
                index > 3 && "hidden sm:block"
              )}
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

      <section className={`mb-10 w-full max-w-4xl px-4`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl tracking-tight">
            <Megaphone className="h-5 w-5" />
            Last week's newsletter
          </h2>

          <Button className="hidden" variant="ghost" asChild size="sm">
            <Link
              href="#"
              target="_blank"
              className="text-muted-foreground mt-1 flex items-center md:mr-0"
            >
              <span className="hidden md:inline">View all</span>
              <ArrowRight className="-ml-1 h-4 w-4 md:ml-1" />
            </Link>
          </Button>
        </div>

        <div className="border-1 overflow-hidden rounded-xl">
          <div className="bg-white px-6 py-6 dark:bg-gray-900 md:px-10 md:py-10">
            <div className="space-y-10">
              {latestNewsletter && (
                <Link
                  href={`/articles/${latestNewsletter.slug}`}
                  key={latestNewsletter.slug}
                  className="group block"
                >
                  <article className="space-y-1">
                    {latestNewsletter.date && (
                      <p className="text-muted-foreground text-xs">
                        {new Date(latestNewsletter.date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    )}
                    <h2 className="group-hover:text-primary text-medium text-xl transition-colors">
                      {latestNewsletter.title}
                    </h2>
                    {latestNewsletter.excerpt && (
                      <p className="text-muted-foreground">
                        {latestNewsletter.excerpt}
                      </p>
                    )}
                  </article>
                </Link>
              )}
            </div>
          </div>

          <div className="bg-accent/60 px-6 py-4 md:px-10 md:py-4">
            <SubscribeForm />
          </div>
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
              <ExternalLink className="-ml-1 h-4 w-4 md:ml-1" />
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
            {filteredBlogPosts.map((post) => (
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
