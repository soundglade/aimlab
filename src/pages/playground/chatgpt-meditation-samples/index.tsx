import { GetStaticProps } from "next";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import { useState } from "react";
import PlaygroundLayout from "@/components/playground/PlaygroundLayout";

interface MeditationSample {
  slug: string;
  personaId: string;
  prompt: string;
  content: string;
}

interface PageProps {
  samples: MeditationSample[];
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const meditationsDir = path.join(
    process.cwd(),
    "scripts/simulate-chatgpt-meditations/meditations"
  );
  const files = await fs.readdir(meditationsDir);

  const samples = await Promise.all(
    files.map(async (filename) => {
      const filePath = path.join(meditationsDir, filename);
      const fileContent = await fs.readFile(filePath, "utf8");
      const { data, content } = matter(fileContent);

      return {
        slug: filename.replace(".md", ""),
        personaId: data["persona-id"] || "",
        prompt: data.prompt || "",
        content: content.trim(),
      };
    })
  );

  return {
    props: {
      samples: samples.sort((a, b) => a.personaId.localeCompare(b.personaId)),
    },
  };
};

export default function ChatGPTMeditationSamples({ samples }: PageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const personas = Array.from(new Set(samples.map((s) => s.personaId))).sort();

  const filteredSamples = samples.filter((sample) => {
    const matchesSearch =
      searchTerm === "" ||
      sample.personaId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPersona =
      !selectedPersona || sample.personaId === selectedPersona;

    return matchesSearch && matchesPersona;
  });

  return (
    <PlaygroundLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl mb-4">ChatGPT Meditation Samples</h1>
          <p className="text-muted-foreground mb-6">
            Browse through AI-generated meditation scripts created with
            different personas and prompts.
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search by persona, prompt, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-border bg-background"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPersona(null)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedPersona === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              All Personas
            </button>
            {personas.map((persona) => (
              <button
                key={persona}
                onClick={() => setSelectedPersona(persona)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedPersona === persona
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {persona}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {filteredSamples.length === 0 ? (
            <p className="text-muted-foreground">
              No samples match your search criteria.
            </p>
          ) : (
            filteredSamples.map((sample) => (
              <Link
                key={sample.slug}
                href={`/playground/chatgpt-meditation-samples/${sample.slug}`}
                className="block p-4 rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground mb-2">
                      {sample.slug}
                    </span>
                    <p>{sample.prompt}</p>
                  </div>
                  <svg
                    className="h-5 w-5 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </PlaygroundLayout>
  );
}
