import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useRouter } from "next/router";

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
  const router = useRouter();
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

  // Handle click on a meditation button
  const handleMeditationClick = (url: string) => {
    router.push(url);
  };

  // Fallback to example data if no meditations found
  const displayMeditations = meditations.length > 0 ? meditations : [];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {displayMeditations.map((meditation, index) => (
        <Button
          key={index}
          type="button"
          variant="outline"
          className="hover:bg-accent group h-auto w-full justify-start px-4 py-2 transition-colors"
          onClick={() => handleMeditationClick(meditation.link)}
        >
          <div className="flex w-full items-center gap-2 overflow-hidden text-left">
            <span className="truncate">{meditation.title}</span>
          </div>
        </Button>
      ))}
    </div>
  );
}
