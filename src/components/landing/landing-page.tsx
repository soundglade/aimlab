import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, BookOpen } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import LatestMeditations from "./latest-meditations";
import { BlogPost } from "@/lib/blog";

export default function LandingPage({ blogPosts }: { blogPosts: BlogPost[] }) {
  const sectionBaseClasses = "mb-20 w-full px-4";

  return (
    <Layout>
      {/* Hero */}
      <section
        className={`${sectionBaseClasses} mt-6 flex flex-col items-center text-center md:mt-12`}
      >
        <h1 className="text-primary mb-3 text-5xl font-semibold tracking-tighter">
          AIM Lab
        </h1>
        <h2 className="text-secondary-foreground mb-4 text-2xl tracking-tight">
          The AI Meditation Playground
        </h2>
        <p className="text-muted-foreground mb-10 max-w-2xl">
          Welcome to AIM Lab, a creative hub to explore the intersection of AI
          and meditation.
          <br className="hidden md:block" />
          We've designed this space to empower you to do your own experiments.
        </p>
        <Button asChild size="lg" className="group">
          <Link href="/composer">
            Create a Meditation
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </section>

      <div id="community" className="invisible relative -top-4"></div>

      {/* Recent Community Meditations */}
      <section className={`${sectionBaseClasses} max-w-4xl`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="mb-3 flex items-center gap-2 text-2xl tracking-tight">
            <Users className="h-5 w-5" />
            Community
          </h2>
          <Button variant="ghost" asChild size="sm">
            <Link
              href="/community"
              className="text-muted-foreground flex items-center"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">
          See what others are experimenting with. Here are the latest
          meditations generated.
        </p>
        <LatestMeditations />
      </section>

      {/* Latest from the Blog */}
      <section className={`${sectionBaseClasses} max-w-4xl`}>
        <h2 className="mb-3 flex items-center gap-2 text-2xl tracking-tight">
          <BookOpen className="h-5 w-5" />
          Blog
        </h2>
        <div className="md:border-1 md:px-19 mt-10 max-w-4xl rounded-xl px-4 py-6 md:mb-5 md:bg-white md:py-12 md:shadow-sm dark:md:bg-gray-900">
          <div className="space-y-12">
            {blogPosts.map((post) => (
              <Link
                href={`/blog/${post.slug}`}
                key={post.slug}
                className="group block"
              >
                <article className="space-y-3">
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
