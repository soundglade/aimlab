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
import { ArrowRight, Github } from "lucide-react";

// Changelog visibility toggle
const DISPLAY_CHANGELOG = false;

export default function LandingPage() {
  const router = useRouter();
  const experiments = [
    {
      title: "Create from Script",
      description:
        "Generate a meditation script with ChatGPT, then listen to it with a voice generator.",
      status: "available",
      link: "/rila",
      linkText: "Start Experiment",
      codeName: "rila",
    },
    {
      title: "Live AI Meditation Guide",
      description:
        "Experience live meditation guided by AI using advanced voice mode for a real-time meditation experience.",
      status: "coming",
      codeName: "bodh",
    },
  ];

  const blogPosts = [
    {
      title: "The Science Behind AI-Generated Meditations",
      date: "June 15, 2023",
      excerpt:
        "Exploring how artificial intelligence can create effective meditation scripts and what this means for mindfulness practices.",
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

  const communityMeditations = [
    {
      title: "5-Minute Stress Relief Meditation",
      description:
        "A quick meditation to help you release tension and find calm.",
      duration: "5 mins",
      timeAgo: "less than a minute ago",
      link: "/meditations/stress-relief",
    },
    {
      title: "Morning Clarity Meditation",
      description: "Start your day with mental clarity and positive energy.",
      duration: "10 mins",
      timeAgo: "1 day ago",
      link: "/meditations/morning-clarity",
    },
    {
      title: "Deep Sleep Preparation",
      description: "Calm your mind and prepare your body for restful sleep.",
      duration: "15 mins",
      timeAgo: "2 days ago",
      link: "/meditations/deep-sleep",
    },
    {
      title: "Creative Flow Meditation",
      description: "Open your mind to creative inspiration and ideas.",
      duration: "12 mins",
      timeAgo: "3 days ago",
      link: "/meditations/creative-flow",
    },
  ];

  const updates = [
    {
      type: "new",
      text: "Added blog section with initial articles about AI meditation",
    },
    { type: "new", text: "Added changelog to track project evolution" },
    {
      type: "improved",
      text: "Refined responsive design for better mobile experience",
    },
    {
      type: "improved",
      text: "Updated color scheme to enhance readability and calm",
    },
    { type: "fixed", text: "Fixed voice selection issue in Rila experiment" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-white flex flex-col items-center">
      {/* Navigation */}
      <header className="w-full max-w-5xl px-4 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-sm font-medium">AI</span>
          </div>
          <span className="font-medium">AIM Lab</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/about"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link
            href="/experiments"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Experiments
          </Link>
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Blog
          </Link>
          {DISPLAY_CHANGELOG && (
            <Link
              href="/changelog"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Changelog
            </Link>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center mt-16 mb-24 px-4 max-w-3xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-4">
          AI Meditation Lab
        </h1>
        <p className="text-lg text-muted-foreground mb-3">
          The AI Meditation Petri Dish
        </p>
        <p className="text-muted-foreground max-w-2xl mb-10">
          An open-source laboratory where AI and meditation meet. Explore our
          experiments and join us in discovering new ways to experience
          meditation.
        </p>
        <Button asChild size="lg" className="group">
          <Link href="/rila">
            Try Our First Experiment
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </section>

      {/* Experiments */}
      <section className="w-full max-w-5xl px-4 mb-24">
        <h2 className="text-2xl font-medium mb-6">Experiments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experiments.map((experiment, index) => (
            <ActiveCard
              key={index}
              disabled={experiment.status !== "available"}
              onClick={
                experiment.status === "available" && experiment.link
                  ? () => router.push(experiment.link)
                  : undefined
              }
              className={
                experiment.status === "available" && experiment.link
                  ? "cursor-pointer"
                  : ""
              }
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{experiment.title}</CardTitle>
                  {experiment.status !== "available" && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
                <CardDescription>{experiment.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                {experiment.link ? (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-center"
                  >
                    <Link href={experiment.link}>
                      {experiment.linkText}
                      {experiment.status === "available" && (
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

      {/* Latest Updates */}
      {DISPLAY_CHANGELOG && (
        <section className="w-full max-w-5xl px-4 mb-24">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-medium">Latest Updates</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Version 0.2.0 • July 15, 2023
              </span>
              <Button variant="ghost" asChild size="sm">
                <Link
                  href="/changelog"
                  className="text-muted-foreground flex items-center"
                >
                  Full changelog
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {updates.map((update, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span
                      className={`
                      text-xs px-2 py-1 rounded-full
                      ${
                        update.type === "new"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : ""
                      }
                      ${
                        update.type === "improved"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          : ""
                      }
                      ${
                        update.type === "fixed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : ""
                      }
                    `}
                    >
                      {update.type}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {update.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Recent Community Meditations */}
      <section className="w-full max-w-5xl px-4 mb-24">
        <h2 className="text-2xl font-medium mb-3">
          Recent Community Meditations
        </h2>
        <p className="text-muted-foreground mb-6">
          Explore meditations created by the community. These meditations are
          generated through our Rila experiment and shared publicly.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {communityMeditations.map((meditation, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{meditation.title}</CardTitle>
                <CardDescription>{meditation.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground mr-2"></span>
                  {meditation.duration}
                  <span className="ml-auto">{meditation.timeAgo}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full justify-center"
                >
                  <Link href={meditation.link} className="flex items-center">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Play Meditation
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Latest from the Blog */}
      <section className="w-full max-w-5xl px-4 mb-24">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-medium">Latest from the Blog</h2>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogPosts.map((post, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{post.title}</CardTitle>
                <div className="flex items-center text-xs text-muted-foreground">
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
      <section className="w-full max-w-5xl px-4 mb-24">
        <h2 className="text-2xl font-medium mb-6">About AIM Lab</h2>
        <Card>
          <CardContent className="pt-6 space-y-2">
            <p className="text-muted-foreground">
              The AI Meditation Lab (AIM Lab) is an open-source project
              exploring the intersection of artificial intelligence and
              meditation.
            </p>
            <p className="text-muted-foreground">
              We're creating a space for playful experimentation, where
              technology meets mindfulness in sometimes unexpected ways.
            </p>
            <p className="text-muted-foreground">
              Our experiments may occasionally be glitchy or imperfect - that's
              part of the exploration process and the ethos of the project.
            </p>
            <p className="text-muted-foreground">
              We invite you to join us in this journey of discovery, as we
              explore how AI can enhance, evolve, or reimagine meditation
              practices.
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

      {/* Footer */}
      <footer className="w-full py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xs font-medium">AI</span>
              </div>
              <span className="text-sm font-medium">AIM Lab</span>
            </div>
            <p className="text-xs text-muted-foreground">
              The AI Meditation Petri Dish
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Open source project • 2023
            </p>
            <p className="text-xs text-muted-foreground">
              Hosted at github.com/soundglade/aimlab
            </p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm mb-2">Sponsored By</p>
            <div className="flex items-center gap-4">
              <Link
                href="https://soundglade.com"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-xs">
                  SS
                </div>
                <span className="text-sm">SoundGlade</span>
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <p className="text-sm mb-2">Connect With Us</p>
            <ul className="space-y-1">
              <li>
                <Link
                  href="https://bsky.app/profile/soundglade.bsky.social"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <div className="h-4 w-4 rounded-full bg-blue-400"></div>
                  SoundGlade on Bluesky
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/soundglade"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  GitHub: SoundGlade
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/soundglade/aimlab"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  GitHub Repository
                </Link>
              </li>
              <li>
                <Link
                  href="https://soundglade.com"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <div className="h-4 w-4 rounded bg-primary/10"></div>
                  SoundGlade Website
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 mt-6 pt-4 flex justify-between">
          <p className="text-xs text-muted-foreground"></p>
        </div>
      </footer>
    </div>
  );
}
