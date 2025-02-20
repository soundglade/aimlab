"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

export default function ScriptValidationPage() {
  const router = useRouter();
  const [validatedScript, setValidatedScript] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const { mode, script } = router.query;

    if (script) {
      // Simulate backend processing
      setTimeout(() => {
        const processedScript = {
          title: "Simulated Processed Meditation",
          estimatedDuration: 300, // 5 minutes
          content: [
            { type: "speech", text: "Welcome to your meditation session." },
            { type: "pause", duration: 5 },
            { type: "speech", text: "Take a deep breath in..." },
            { type: "pause", duration: 3 },
            { type: "speech", text: "And exhale slowly..." },
            // ... more content ...
          ],
        };
        setValidatedScript(processedScript);
        setIsLoading(false);
      }, 2000);
    } else {
      setError("No script provided");
      setIsLoading(false);
    }
  }, [router.isReady, router.query]);

  const handleConfirm = () => {
    // Here you would typically send the confirmed script to your backend
    // For now, we'll just navigate to the next page
    router.push(`/nada/voice-selection?mode=${router.query.mode}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-foreground">Processing your script...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <main className="max-w-4xl w-full space-y-8">
        <h1 className="text-4xl text-foreground text-center">
          Script Validation
        </h1>
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            {validatedScript.title}
          </h2>
          <p className="mb-4 text-muted-foreground">
            Estimated Duration: {validatedScript.estimatedDuration} seconds
          </p>
          <div className="space-y-2">
            {validatedScript.content.map((item: any, index: number) => (
              <div key={index} className="p-2 bg-muted rounded">
                {item.type === "speech" ? (
                  <p className="text-foreground">{item.text}</p>
                ) : (
                  <p className="italic text-muted-foreground">
                    Pause for {item.duration} seconds
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center space-x-4">
          <Button onClick={() => router.back()}>Edit Script</Button>
          <Button onClick={handleConfirm}>Confirm and Continue</Button>
        </div>
      </main>
    </div>
  );
}
