import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Github,
  Users,
  BookOpen,
  Sparkles,
  Calendar,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import dynamic from "next/dynamic";

const LatestMeditations = dynamic(() => import("./latest-meditations"), {
  ssr: false,
  loading: () => (
    <p className="text-muted-foreground text-center">
      Loading community meditations...
    </p>
  ),
});

export default function LandingPage() {
  const sectionBaseClasses = "mb-20 w-full px-4";

  const blogPosts = [
    {
      title: "The Science Behind AI-Generated Meditations",
      date: "June 15, 2023",
      excerpt:
        "Exploring how artificial intelligence can create effective meditation scripts and what this means for meditation practices.",
      link: "/blog/science-behind-ai-meditations",
    },
    {
      title: "5 Ways to Enhance Your Meditation Practice with Technology",
      date: "May 22, 2023",
      excerpt:
        "Discover how modern technology, including AI tools, can deepen your meditation practice rather than distract from it.",
      link: "/blog/enhance-meditation-with-technology",
    },
  ];

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
          See what others are experimenting with. These meditations are
          generated with the{" "}
          <a href="/composer" className="text-primary">
            Meditation Composer
          </a>
          .
        </p>
        <LatestMeditations />
      </section>

      {/* Latest from the Blog */}
      <section className={`${sectionBaseClasses} max-w-4xl`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl tracking-tight">
            <BookOpen className="h-5 w-5" />
            Latest from the Blog
          </h2>
          <Button variant="ghost" asChild size="sm">
            <Link
              href="/blog"
              className="text-muted-foreground flex items-center"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {blogPosts.map((post, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{post.title}</CardTitle>
                <div className="text-muted-foreground flex items-center text-xs">
                  <Calendar className="mr-1 h-3 w-3" />
                  <span>{post.date}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.excerpt}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" asChild className="px-0">
                  <Link
                    href={post.link}
                    className="text-primary flex items-center"
                  >
                    Read article
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  );
}
