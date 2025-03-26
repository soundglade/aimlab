import { useEffect, useState } from "react";
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

interface Meditation {
  title: string;
  description: string;
  duration: string;
  timeAgo: string;
  link: string;
}

export default function LatestMeditations() {
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMeditations() {
      try {
        const response = await fetch("/api/latest-meditations");
        if (!response.ok) {
          throw new Error("Failed to fetch meditation data");
        }
        const data = await response.json();
        setMeditations(data);
      } catch (err) {
        console.error("Error fetching meditations:", err);
        setError("Unable to load meditations");
      } finally {
        setLoading(false);
      }
    }

    fetchMeditations();
  }, []);

  // Fallback states
  if (loading) {
    return <div className="p-4 text-center">Loading latest meditations...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  // Fallback to example data if no meditations found
  const displayMeditations =
    meditations.length > 0
      ? meditations
      : [
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
            description:
              "Start your day with mental clarity and positive energy.",
            duration: "10 mins",
            timeAgo: "1 day ago",
            link: "/m/morning-clarity",
          },
          {
            title: "Deep Sleep Preparation",
            description:
              "Calm your mind and prepare your body for restful sleep.",
            duration: "15 mins",
            timeAgo: "2 days ago",
            link: "/meditations/deep-sleep",
          },
        ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {displayMeditations.map((meditation, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{meditation.title}</CardTitle>
            <CardDescription>{meditation.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground flex items-center text-xs">
              <Clock className="mr-1 h-3 w-3" />
              {meditation.duration}
              <Activity className="ml-auto mr-1 h-3 w-3" />
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
                <Play className="mr-2 h-4 w-4" />
                Play Meditation
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
