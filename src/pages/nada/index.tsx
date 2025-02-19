import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NadaModePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
      <main className="max-w-4xl w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Nada Experiment</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose your mode to begin creating your guided meditation.
        </p>
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              Standard Mode
            </h2>
            <p className="text-gray-600">
              Default tracking enabled. Share your meditations and save your
              progress.
            </p>
            <Link href="/nada/script-input?mode=standard">
              <Button className="w-full">Choose Standard Mode</Button>
            </Link>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              Incognito Mode
            </h2>
            <p className="text-gray-600">
              No data stored. Perfect for private sessions without tracking.
            </p>
            <Link href="/nada/script-input?mode=incognito">
              <Button variant="outline" className="w-full">
                Choose Incognito Mode
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
