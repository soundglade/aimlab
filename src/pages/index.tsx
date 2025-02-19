import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
      <main className="max-w-4xl w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 sm:text-5xl md:text-6xl">
          AI Meditation Lab
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Welcome to the future of meditation. Explore AI-powered experiments to
          enhance your mindfulness practice.
        </p>
        <div className="space-y-4">
          <Link href="/nada">
            <Button className="text-lg px-6 py-3">
              Create Guided Meditation from Script
            </Button>
          </Link>
          <p className="text-sm text-gray-500">
            Generate, refine, and play guided meditations using scripts from
            ChatGPT.
          </p>
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Coming Soon
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li>Real-time Adaptive Meditations</li>
            <li>Personalized Meditation Journeys</li>
            <li>AI-Powered Mindfulness Insights</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
