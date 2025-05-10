import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Layout } from "@/components/layout/layout-component";
import { SubscribeForm } from "./subscribe-form";

import { BlogPost } from "@/pages/index";
import { LatestMeditation } from "@/lib/latest-meditations";
import { RedditPost } from "@/lib/reddit-posts";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";

export default function LandingPage({
  blogPosts,
  latestMeditations,
  latestRedditPosts,
}: {
  blogPosts: BlogPost[];
  latestMeditations: LatestMeditation[];
  latestRedditPosts: RedditPost[];
}) {
  const router = useRouter();

  // Hardcoded slug for the latest newsletter
  const latestNewsletterSlug = "third-week";
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
        className={`mb-12 mt-2 flex w-full flex-col items-center px-4 text-center md:mt-8`}
      >
        <h1 className="text-primary mb-3 text-5xl font-semibold tracking-tighter">
          AIM Lab
        </h1>
        <h2 className="text-secondary-foreground mb-2 text-2xl tracking-tight">
          The AI Meditation Playground
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl">
          Welcome to AIM Lab, a creative, open-source{" "}
          <br className="block sm:hidden" />
          hub for exploring AI and meditation
        </p>

        <div className="grid max-w-[700px] gap-4 sm:grid-cols-2">
          <Link href="/instant">
            <Card
              className={cn(
                "group flex h-full flex-col justify-between gap-4 md:gap-6",
                "px-2 py-7",
                "text-left",
                "hover:bg-accent"
              )}
            >
              <CardHeader>
                <CardTitle className="mb-1 flex items-center gap-3">
                  <Sparkles className="h-5 w-5 opacity-50" />
                  Listen instantly
                </CardTitle>
                <CardDescription>
                  Paste any AI-generated script, hit play, and hear it stream in
                  real time
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  size="lg"
                  className="group-hover:bg-primary hover:bg-primary"
                >
                  Play a script
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
          <Link href="/studio">
            <Card
              className={cn(
                "group flex h-full flex-col justify-between gap-4 md:gap-6",
                "px-2 py-7",
                "text-left",
                "hover:bg-accent"
              )}
            >
              <CardHeader>
                <CardTitle className="mb-1 flex items-center gap-3">
                  <PencilRuler className="h-5 w-5 opacity-50" />
                  Create a shareable meditation
                </CardTitle>
                <CardDescription>
                  Step-by-step synthesis, custom voice, cover image, and a
                  public URL
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  size="lg"
                  variant="secondary"
                  className="group-hover:bg-background hover:bg-background dark:group-hover:bg-background/50 dark:hover:bg-background/50"
                >
                  Start creating
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        </div>

        <Button
          asChild
          size="lg"
          variant="outline"
          className="text-muted-foreground mt-4 border-0 md:mt-5"
        >
          <Link href="/articles/creative-examples">
            <span className="hidden md:inline">Need inspiration? </span>
            <BookOpen className="text-primary hidden h-4 w-4 md:inline" /> Check
            out some creative examples
          </Link>
        </Button>
      </section>

      <section className={`mb-10 w-full max-w-4xl px-4`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl tracking-tight">
            <Megaphone className="h-5 w-5 opacity-50" />
            Newsletter
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

        <div className="overflow-hidden rounded-xl">
          <div className="bg-background px-8 py-7">
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

      {/* Recent Community Meditations */}
      <section className={`mb-10 w-full max-w-4xl px-4`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl tracking-tight">
            <ScrollText className="h-5 w-5 opacity-50" />
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
                "hover:bg-accent border-0 group h-auto w-full justify-start px-5 py-3 transition-colors",
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

      <div id="community" className="invisible relative -top-4"></div>
      {/* Community */}
      <section className={`mb-10 w-full max-w-4xl px-4`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl tracking-tight">
            <Users className="h-5 w-5 opacity-50" />
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

        <div className="rounded-xl bg-white px-6 py-6 dark:bg-gray-900 md:px-10 md:py-10">
          <div className="space-y-8">
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
          <BookOpen className="h-5 w-5 opacity-50" />
          Articles
        </h2>
        <div className="mt-6 max-w-4xl rounded-xl bg-white px-6 py-6 dark:bg-gray-900 md:px-10 md:py-10">
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
