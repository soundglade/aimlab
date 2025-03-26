import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  ActiveCard,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/active-card";
import {
  ArrowRight,
  Github,
  Wrench,
  Users,
  BookOpen,
  Info,
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
  const router = useRouter();
  const sectionBaseClasses = "mb-20 w-full px-4";

  const tools = [
    {
      title: "Meditation Composer",
      description: "Synthesize a meditation script with a voice generator.",
      status: "available",
      link: "/composer",
      linkText: "Try it out",
    },
    {
      title: "Live AI Meditation Guide",
      description:
        "Experience live meditation guided by AI using advanced voice mode for a real-time meditation experience.",
      status: "coming",
    },
  ];

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
        <p className="text-muted-foreground mb-10 max-w-3xl">
          Welcome to AIM Lab, a creative hub to explore the intersection of AI
          and meditation. We've designed this space to empower you to do your
          own experiments.
        </p>
        <Button asChild size="lg" className="group">
          <Link href="/composer">
            Create a Meditation with ChatGPT
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </section>

      {/* Tools */}
      <section className={`${sectionBaseClasses} max-w-4xl`}>
        <h2 className="mb-6 flex items-center gap-2 text-2xl tracking-tight">
          <Wrench className="h-5 w-5" />
          Tools
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {tools.map((tool, index) => (
            <ActiveCard
              key={index}
              disabled={tool.status !== "available"}
              onClick={
                tool.status === "available" && tool.link
                  ? () => router.push(tool.link)
                  : undefined
              }
              className={
                tool.status === "available" && tool.link ? "cursor-pointer" : ""
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center text-lg">
                    {tool.title}
                  </CardTitle>
                  {tool.status !== "available" && (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      Coming Soon
                    </span>
                  )}
                </div>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                {tool.link ? (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-center"
                  >
                    <Link href={tool.link}>
                      {tool.linkText}
                      {tool.status === "available" && (
                        <ArrowRight className="ml-2 h-4 w-4" />
                      )}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    disabled
                    className="w-full justify-center"
                  >
                    Coming Soon
                  </Button>
                )}
              </CardFooter>
            </ActiveCard>
          ))}
        </div>
      </section>

      <div id="community" className="invisible relative -top-4"></div>

      {/* Recent Community Meditations */}
      <section className={`${sectionBaseClasses} max-w-4xl`}>
        <h2 className="mb-3 flex items-center gap-2 text-2xl tracking-tight">
          <Users className="h-5 w-5" />
          Community
        </h2>
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
      <section className={`${sectionBaseClasses} hidden max-w-4xl`}>
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

      {/* About */}
      <section className={`${sectionBaseClasses} mb-10 hidden max-w-4xl`}>
        <h2 className="mb-6 flex items-center gap-2 text-2xl tracking-tight">
          <Info className="h-5 w-5" />
          How This Works
        </h2>
        <Card>
          <CardContent className="space-y-2 pt-6">
            <p className="text-muted-foreground">
              The AI Meditation Lab (AIM Lab) is an open-source project
              exploring the intersection of AI and meditation.
            </p>
            <p className="text-muted-foreground">
              This is a place to test ideas, explore possibilities, and learn
              from what works (and what doesn't). We're creating a space for
              playful experimentation.
            </p>
            <p className="text-muted-foreground">
              Our experiments may occasionally glitch or break—that's part of
              the process and the ethos of the project.
            </p>
            <p className="text-muted-foreground">
              What happens when AI guides human meditation? We don't fully know
              yet—but that's what AIM Lab is here to explore. Join us in this
              journey of discovery.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild variant="outline">
                <Link
                  href="https://github.com/soundglade/aimlab"
                  className="flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  Join on GitHub
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/experiments">Try an Experiment</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
}
