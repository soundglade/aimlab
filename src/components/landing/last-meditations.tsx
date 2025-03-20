import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function LastMeditations() {
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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {communityMeditations.map((meditation, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{meditation.title}</CardTitle>
            <CardDescription>{meditation.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              {meditation.duration}
              <Activity className="w-3 h-3 ml-auto mr-1" />
              {meditation.timeAgo}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="justify-center w-full"
            >
              <Link href={meditation.link} className="flex items-center">
                <Play className="w-4 h-4 mr-2" />
                Play Meditation
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
