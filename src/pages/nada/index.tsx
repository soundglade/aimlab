import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NadaModePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <main className="max-w-4xl w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold text-foreground">Nada Experiment</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose your mode to begin creating your guided meditation.
        </p>
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Standard Mode
            </h2>
            <p className="text-muted-foreground">
              Default tracking enabled. Share your meditations and save your
              progress.
            </p>
            <Button asChild className="w-full">
              <Link href="/nada/script-input?mode=standard">
                Choose Standard Mode
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Incognito Mode
            </h2>
            <p className="text-muted-foreground">
              No data stored. Perfect for private sessions without tracking.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/nada/script-input?mode=incognito">
                Choose Incognito Mode
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
