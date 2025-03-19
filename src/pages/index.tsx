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
  Lightbulb,
  Wrench,
  Users,
  BookOpen,
  Info,
  MessageSquare,
  Clock,
  Activity,
  Play,
  Sparkles,
  Music,
  Mic,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";

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
      link: "/rila",
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
    <Layout>
      {/* Hero */}
      <section className="flex flex-col items-center text-center mt-10 mb-24 px-4 w-full">
        <h1 className="text-primary font-semibold text-5xl tracking-tighter mb-3">
          AIM Lab
        </h1>
        <h2 className="text-2xl tracking-tight mb-4 text-secondary-foreground">
          The AI Meditation Playground
        </h2>
        <p className="text-muted-foreground max-w-3xl mb-10">
          A creative lab where you can explore the fascinating frontier where
          artificial intelligence meets meditation. We've designed this space to
          empower you to craft your own meditative experiences.
        </p>
        <Button asChild size="lg" className="group">
          <Link href="/rila">
            <Sparkles className="mr-2 h-4 w-4" />
            Create a Meditation with ChatGPT
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </section>

      <div id="experiments" className="relative -top-4 invisible"></div>

      {/* Experiments */}
      <section className="w-full max-w-4xl px-4 mb-24">
        <h2 className="text-2xl font-medium mb-6 flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Experiments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <div id="tools" className="relative -top-4 invisible"></div>

      {/* Tools */}
      <section className="w-full max-w-4xl px-4 mb-24">
        <h2 className="text-2xl font-medium mb-6 flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center">
                    {tool.title.includes("Composer") ? (
                      <Music className="h-4 w-4 mr-2" />
                    ) : (
                      <Mic className="h-4 w-4 mr-2" />
                    )}
                    {tool.title}
                  </CardTitle>
                  {tool.status !== "available" && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
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

      <div id="community" className="relative -top-4 invisible"></div>

      {/* Recent Community Meditations */}
      <section className="w-full max-w-4xl px-4 mb-24">
        <h2 className="text-2xl font-medium mb-3 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Community
        </h2>
        <p className="text-muted-foreground mb-6">
          See what others are experimenting with. These meditations are
          generated through our Meditation Composer and shared publicly.
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
                  <Clock className="h-3 w-3 mr-1" />
                  {meditation.duration}
                  <Activity className="h-3 w-3 ml-auto mr-1" />
                  {meditation.timeAgo}
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
                    <Play className="h-4 w-4 mr-2" />
                    Play Meditation
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Reddit Posts */}
      <section className="w-full max-w-4xl px-4 mb-24">
        <h2 className="text-2xl font-medium mb-3 flex items-center gap-2">
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
                  className="border-b border-border pb-4 last:border-0 last:pb-0"
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
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <span>by {post.author}</span>
                      <span className="ml-2">{post.num_comments} comments</span>
                    </div>
                  </div>

                  {post.selftext && (
                    <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                      {post.selftext}
                    </p>
                  )}

                  <Button
                    variant="ghost"
                    asChild
                    size="sm"
                    className="px-0 text-primary"
                  >
                    <Link
                      href={`https://reddit.com${post.permalink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      View on Reddit
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Latest from the Blog */}
      <section className="w-full max-w-4xl px-4 mb-24">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-medium flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Latest from the Lab
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogPosts.map((post, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{post.title}</CardTitle>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
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
      <section className="w-full max-w-4xl px-4 mb-10">
        <h2 className="text-2xl font-medium mb-6 flex items-center gap-2">
          <Info className="h-5 w-5" />
          How This Works
        </h2>
        <Card>
          <CardContent className="pt-6 space-y-2">
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
