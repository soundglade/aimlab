"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export default function ScriptInputPage() {
  const [script, setScript] = useState("");
  const [formattedScript, setFormattedScript] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { mode } = router.query;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/format-meditation-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ script, mode }),
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
          Import Your Meditation Script
        </h1>
        <p className="text-xl text-muted-foreground text-center">
          Paste your meditation script below. Don't have one? Try using ChatGPT
          to generate a meditation script!
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Paste your meditation script here..."
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="h-64"
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Format Script"}
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
