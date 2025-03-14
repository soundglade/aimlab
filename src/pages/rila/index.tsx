import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Plus, Clock, Calendar, Trash2, X } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import RilaFlowDialog from "@/components/rila/rila-flow-dialog";
import { useState } from "react";

export default function RilaExperiment() {
  const [open, setOpen] = useState(false);

  const examplePrompts = [
    {
      text: '"Write a 5-minute guided meditation script focused on relieving anxiety, using deep breathing and body awareness techniques."',
    },
    {
      text: '"Create a 10-minute meditation script for better sleep, with gentle visualization and progressive relaxation."',
    },
    {
      text: '"Generate a brief morning meditation focused on setting positive intentions for the day ahead."',
    },
  ];

  const myMeditations = [
    {
      title: "Morning Clarity Practice",
    },
    {
      title: "Deep Relaxation Journey",
    },
  ];

  const communityMeditations = [
    {
      title: "5-Minute Stress Relief Meditation",
      description:
        "A quick meditation to help you release tension and find calm.",
      duration: "5 mins",
      timeAgo: "Less than a minute ago",
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

  return (
    <Layout>
      {/* Hero */}
      <div className="pt-8 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <span className="text-sm text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
              Rila Experiment
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
            Bring AI Meditation Scripts to Life
          </h1>

          <p className="text-foreground/70 mb-9">
            What if creating guided meditations wasn't limited to apps? What if
            everyone could generate personalized, high-quality meditations using{" "}
            <span className="font-bold">ChatGPT</span>? This experiment lets you
            transform AI-generated text scripts into{" "}
            <span className="font-bold">playable audio</span>. Let's find out!
          </p>

          {/* How to use this experiment */}
          <div className="bg-card border-accent border-1 text-muted-foreground rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium mb-4">
              How to use this experiment:
            </h2>
            <ol className="space-y-3">
              <li className="flex gap-2">
                <span className="font-medium">1.</span>
                <span>
                  Use ChatGPT or another AI tool to generate a meditation script
                  based on your preferences.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">2.</span>
                <span>
                  Copy and paste the generated script into our tool below.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">3.</span>
                <span>
                  Select a voice for your meditation from the options provided.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">4.</span>
                <span>
                  Review and edit your structured meditation if needed.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">5.</span>
                <span>
                  Create your meditation and share it with the community!
                </span>
              </li>
            </ol>
          </div>

          {/* Create Your Meditation */}
          <div className="flex justify-center mb-12">
            <Button
              onClick={() => setOpen(true)}
              size="lg"
              className="flex items-center gap-2"
            >
              Create Your Meditation
            </Button>
          </div>

          {/* My Meditations */}
          <div className="mb-12">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-medium">
                    Your saved meditations:
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Clear all
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {myMeditations.map((meditation, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      className="justify-start h-auto py-2 px-3 hover:bg-accent transition-colors group relative"
                    >
                      <div className="flex items-center gap-2 text-left overflow-hidden w-full">
                        <Badge
                          variant="secondary"
                          className="h-6 min-w-6 flex items-center justify-center rounded-full text-xs shrink-0"
                        >
                          {index + 1}
                        </Badge>
                        <span className="truncate">{meditation.title}</span>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="absolute right-2 opacity-30 hover:opacity-100 hover:bg-muted rounded-full p-1 transition-all focus:outline-none"
                          aria-label="Delete meditation"
                        >
                          <X size={14} className="text-muted-foreground" />
                        </a>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Example AI Prompts */}
          <div className="mb-12">
            <h2 className="text-xl font-medium mb-4">Example AI Prompts</h2>
            <p className="text-muted-foreground mb-4">
              Not sure what to ask ChatGPT? Try one of these prompts:
            </p>
            <div className="space-y-3">
              {examplePrompts.map((prompt, index) => (
                <div
                  key={index}
                  className="border-l-4 border-blue-500 pl-4 py-1"
                >
                  <p className="text-sm">{prompt.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Community Meditations */}
          <div>
            <h2 className="text-xl font-medium mb-4">
              Recent Community Meditations
            </h2>
            <p className="text-muted-foreground mb-6">
              Explore meditations created and shared by the community in this
              public experiment.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communityMeditations.map((meditation, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-2">{meditation.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {meditation.description}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground mb-4">
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="mr-3">{meditation.duration}</span>
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{meditation.timeAgo}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full flex items-center justify-center"
                    >
                      <Link href={meditation.link}>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      <RilaFlowDialog open={open} onOpenChange={setOpen} />
    </Layout>
  );
}
