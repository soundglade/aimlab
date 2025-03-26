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
  Sparkles,
  Wrench,
  Users,
  BookOpen,
  Info,
  MessageSquare,
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
  const experiments = [
    {
      title: "Create Your Own Meditations with ChatGPT",
      description:
        "Generate a meditation script with ChatGPT, then listen to it with a voice generator.",
      link: "/abc",
    },
    {
      title: "Create A Series of Meditations using AI",
      description:
        "How to create a series of guided meditations, following a common theme.",
      link: "/def",
    },
    {
      title: "Mindful Comptemplation of Artwork",
      description: "Use AI to create a meditation on a piece of artwork.",
      link: "/ghi",
    },
  ];

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
      <section className="mb-20 mt-6 flex w-full flex-col items-center px-4 text-center md:mt-12">
        <h1 className="text-primary mb-3 text-5xl font-semibold tracking-tighter">
          AIM Lab
        </h1>
        <h2 className="text-secondary-foreground mb-4 text-2xl tracking-tight">
          The AI Meditation Playground
        </h2>
        <p className="text-muted-foreground mb-10 max-w-3xl">
          Welcome to AIM Lab, a creative hub to explore the encounter between
          artificial intelligence and the world of meditation. We've designed
          this space to empower you to experience your own meditative
          experiences.
        </p>
        <Button asChild size="lg" className="group">
          <Link href="/composer">
            Create a Meditation with ChatGPT
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </section>

      <div id="experiments" className="invisible relative -top-4"></div>

      {/* Experiments */}
      <section className="mb-20 w-full max-w-4xl px-4">
        <h2 className="mb-6 flex items-center gap-2 text-2xl tracking-tight">
          <Sparkles className="h-5 w-5" />
          Experiments
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {experiments.map((experiment, index) => (
            <ActiveCard
              key={index}
              onClick={() => router.push(experiment.link)}
              className="cursor-pointer"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{experiment.title}</CardTitle>
                <CardDescription>{experiment.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-center"
                >
                  <Link href={experiment.link}>
                    Try it out
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </ActiveCard>
          ))}
        </div>
      </section>

      <div id="tools" className="invisible relative -top-4"></div>

      {/* Tools */}
      <section className="mb-20 w-full max-w-4xl px-4">
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
      <section className="mb-20 w-full max-w-4xl px-4">
        <h2 className="mb-3 flex items-center gap-2 text-2xl tracking-tight">
          <Users className="h-5 w-5" />
          Community
        </h2>
        <p className="text-muted-foreground mb-6">
          See what others are experimenting with. These meditations are
          generated through our Meditation Composer and shared publicly.
        </p>
        <LatestMeditations />
      </section>

      {/* Reddit Posts */}
      <section className="mb-20 w-full max-w-4xl px-4">
        <h2 className="mb-3 flex items-center gap-2 text-2xl tracking-tight">
          <MessageSquare className="h-5 w-5" />
          From Reddit
        </h2>
        <p className="text-muted-foreground mb-6">
          Recent discussions from the meditation community on Reddit.
        </p>
        <Card>
          <CardContent>
            <div className="space-y-4">
              {REDDIT_POSTS.slice(0, 4).map((post) => (
                <div
                  key={post.id}
                  className="border-border border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="mb-2">
                    <Link
                      href={`https://reddit.com${post.permalink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      <h3 className="text-base font-medium">{post.title}</h3>
                    </Link>
                    <div className="text-muted-foreground mt-1 flex items-center text-xs">
                      <span>by {post.author}</span>
                      <span className="ml-2">{post.num_comments} comments</span>
                    </div>
                  </div>

                  {post.selftext && (
                    <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                      {post.selftext}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Latest from the Blog */}
      <section className="mb-20 hidden w-full max-w-4xl px-4">
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
      <section className="mb-10 w-full max-w-4xl px-4">
        <h2 className="mb-6 flex items-center gap-2 text-2xl tracking-tight">
          <Info className="h-5 w-5" />
          How This Works
        </h2>
        <Card>
          <CardContent className="space-y-2 pt-6">
            <p className="text-muted-foreground">
              The AI Meditation Lab (AIM Lab) is an open-source project
              exploring the intersection of artificial intelligence and
              meditation.
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

const REDDIT_POSTS = [
  {
    id: "1jeq0c5",
    title:
      "The Eightfold Path (featuring Sam, Joseph Goldstein, and Dan Harris)",
    author: "Exsufflicate-",
    score: 17,
    num_comments: 10,
    created_utc: 1742362456,
    permalink:
      "/r/Wakingupapp/comments/1jeq0c5/the_eightfold_path_featuring_sam_joseph_goldstein/",
    is_self: false,
    selftext:
      "I haven't listened to this yet but I am quite excited to listen to these 3 discuss the fundamentals of Buddhist philosophy if my understanding of the series is correct.",
    thumbnail:
      "https://a.thumbs.redditmedia.com/oeTzd2Vy-2p6yj2_9C0U8sbWbvyTcDxPJEoOnPE3wn0.jpg",
  },
  {
    id: "1jezcgc",
    title:
      "I Understand That I Am Not My Thoughts—But It Still Feels Like I Am",
    author: "KryptoniansDontBleed",
    score: 2,
    num_comments: 0,
    created_utc: 1742397337,
    permalink:
      "/r/Wakingupapp/comments/1jezcgc/i_understand_that_i_am_not_my_thoughtsbut_it/",
    is_self: true,
    selftext:
      "Hey everyone,\n\nI've been trying to internalize the idea that I am not my thoughts—that I'm just the observer, not the thinker. I get it on an intellectual level: thoughts arise on their own, and I don't have to identify with them. In theory, this should help with emotional detachment and make it easier to let go.\n\nBut in practice? It's not clicking.",
  },
  {
    id: "1jenbj0",
    title: "Tulku Urgyen Rinpoche - Pointing out Nature of Mind, Rigpa",
    author: "GurtGB",
    score: 12,
    num_comments: 2,
    created_utc: 1742352706,
    permalink:
      "/r/Wakingupapp/comments/1jenbj0/tulku_urgyen_rinpoche_pointing_out_nature_of_mind/",
    is_self: false,
  },
  {
    id: "1je83yu",
    title: "A few tips to consider",
    author: "mergersandacquisitio",
    score: 31,
    num_comments: 5,
    created_utc: 1742312924,
    permalink: "/r/Wakingupapp/comments/1je83yu/a_few_tips_to_consider/",
    is_self: true,
    selftext:
      "Thought I'd toss in a few tips based on a couple years of practice - I'm not by any means an expert but there's some things it's easy to forget that are worth putting top of mind",
  },
  {
    id: "1jej5mg",
    title: "Do I always have to close my eyes in guided Meditation?",
    author: "TheBoulder101",
    score: 1,
    num_comments: 4,
    created_utc: 1742340334,
    permalink:
      "/r/Wakingupapp/comments/1jej5mg/do_i_always_have_to_close_my_eyes_in_guided/",
    is_self: true,
    selftext:
      "Before I got the waking up app I had always practiced meditating with my eyes open. I find that I'm able to focus much less on the present and sometimes even fall asleep if I close my eyes. Is there any benefit to having your eyes closed compared to open when meditating? Should I not close my eyes even if it is suggested at the beginning of a guided meditation? Thanks!",
  },
  {
    id: "1jeasg5",
    title: "Beyond the I Am -background sound.",
    author: "Jealous-Might4266",
    score: 1,
    num_comments: 2,
    created_utc: 1742319484,
    permalink:
      "/r/Wakingupapp/comments/1jeasg5/beyond_the_i_am_background_sound/",
    is_self: true,
    selftext:
      "Anyone know where I can find just the background sound? The sound is used in other guides meditations, but I can't seem to find just the sound anywhere. I'd like to meditate just using the sound. Thanks.",
  },
  {
    id: "1jdykzx",
    title: "What to do during self meditation after 20 days of the into course",
    author: "cryptoizkewl",
    score: 1,
    num_comments: 1,
    created_utc: 1742278630,
    permalink:
      "/r/Wakingupapp/comments/1jdykzx/what_to_do_during_self_meditation_after_20_days/",
    is_self: true,
    selftext:
      "Hey yall, so my experience before waking up app was focused breathing I'd usually do to help sleep or when feeling over whelmed. I'm now 20 days into the intro course, I generally do that session in the morning and now I'm trying to add an afternoon session by myself.",
  },
  {
    id: "1jdpccp",
    title: "Anyone else absolutely love the Soft Butter meditation",
    author: "Acceptable_Cheek_727",
    score: 2,
    num_comments: 3,
    created_utc: 1742249393,
    permalink:
      "/r/Wakingupapp/comments/1jdpccp/anyone_else_absolutely_love_the_soft_butter/",
    is_self: true,
  },
  {
    id: "1je5t2u",
    title: "I Passed Out at the Wheel of a Moving Car So You Don't Have To",
    author: "American-Dreaming",
    score: 0,
    num_comments: 1,
    created_utc: 1742306903,
    permalink:
      "/r/Wakingupapp/comments/1je5t2u/i_passed_out_at_the_wheel_of_a_moving_car_so_you/",
    is_self: true,
    selftext:
      "A cautionary tale about the importance of maintaining a healthy work-life balance.",
  },
  {
    id: "1jcvna8",
    title:
      "Reflections on My First Meditation Retreat: U Tejaniya Style at IMS",
    author: "Forgot_the_Jacobian",
    score: 39,
    num_comments: 3,
    created_utc: 1742158902,
    permalink:
      "/r/Wakingupapp/comments/1jcvna8/reflections_on_my_first_meditation_retreat_u/",
    is_self: false,
    thumbnail:
      "https://b.thumbs.redditmedia.com/TSdz8u6Vwdfu2G8xrHuNbW8hgNd7kmZ_C2j6CZX7PXc.jpg",
  },
];
