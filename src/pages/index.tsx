import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <main className="max-w-4xl w-full space-y-8 text-center">
        <h1 className="text-4xl text-foreground sm:text-5xl md:text-6xl">
          AI Meditation Lab
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Welcome to the future of meditation. Explore AI-powered experiments to
          enhance your mindfulness practice.
        </p>
        <div className="space-y-4">
          <Button asChild className="text-lg px-6 py-3">
            <Link href="/nada">Create Guided Meditation from Script</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Generate, refine, and play guided meditations using scripts from
            ChatGPT.
          </p>
        </div>
        <div className="mt-12">
          <h2 className="text-2xl  text-foreground mb-4">Coming Soon</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>Real-time Adaptive Meditations</li>
            <li>Personalized Meditation Journeys</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
