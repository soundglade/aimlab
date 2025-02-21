"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function NadaModePage() {
  const [script, setScript] = useState("");
  const [formattedScript, setFormattedScript] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isIncognito, setIsIncognito] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/format-meditation-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          script,
          mode: isIncognito ? "incognito" : "standard",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to format script");
      }

      const data = await response.json();
      setFormattedScript(data);
    } catch (error) {
      console.error("Error formatting script:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <main className="max-w-4xl w-full space-y-8">
        <h1 className="text-4xl text-foreground text-center">
          Create Your Guided Meditation
        </h1>
        <p className="text-xl text-muted-foreground text-center">
          Paste your meditation script below. Don't have one?
          <br /> Try using ChatGPT to generate a meditation script!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Textarea
            placeholder="Paste your meditation script here..."
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="h-64"
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="incognito"
              checked={isIncognito}
              onCheckedChange={(checked) => setIsIncognito(checked as boolean)}
            />
            <label
              htmlFor="incognito"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Enable Incognito Mode
            </label>
          </div>

          <p className="text-sm text-muted-foreground">
            {isIncognito
              ? "Incognito Mode: Your meditation session will not be stored or tracked. Perfect for private practice."
              : "Standard Mode: Your meditation will be saved, allowing you to track progress and share your practice."}
          </p>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Read Script"}
          </Button>
        </form>

        {formattedScript && (
          <Card className="p-6 mt-8">
            <h2 className="text-2xl font-semibold mb-4">Formatted Script</h2>
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
              {JSON.stringify(formattedScript, null, 2)}
            </pre>
          </Card>
        )}
      </main>
    </div>
  );
}
