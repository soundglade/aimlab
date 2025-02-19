"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ScriptInputPage() {
  const [script, setScript] = useState("");
  const router = useRouter();
  const { mode } = router.query;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the script to your backend API
    // For now, we'll just navigate to the next page
    router.push(
      `/nada/script-validation?mode=${mode}&script=${encodeURIComponent(
        script
      )}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
      <main className="max-w-4xl w-full space-y-8">
        <h1 className="text-4xl font-bold text-gray-800 text-center">
          Import Your Meditation Script
        </h1>
        <p className="text-xl text-gray-600 text-center">
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
          <Button type="submit" className="w-full">
            Submit Script
          </Button>
        </form>
      </main>
    </div>
  );
}
