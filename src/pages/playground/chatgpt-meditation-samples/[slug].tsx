import { GetStaticPaths, GetStaticProps } from "next";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useState } from "react";
import PlaygroundLayout from "@/components/dashboard/PlaygroundLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MeditationSample {
  slug: string;
  personaId: string;
  persona: string;
  prompt: string;
  content: string;
}

interface PageProps {
  sample: MeditationSample;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const meditationsDir = path.join(
    process.cwd(),
    "scripts/simulate-chatgpt-meditations/meditations"
  );
  const files = await fs.readdir(meditationsDir);

  const paths = files.map((filename) => ({
    params: { slug: filename.replace(".md", "") },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<PageProps> = async ({ params }) => {
  const slug = params?.slug as string;
  const filePath = path.join(
    process.cwd(),
    "scripts/simulate-chatgpt-meditations/meditations",
    `${slug}.md`
  );

  const fileContent = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(fileContent);

  return {
    props: {
      sample: {
        slug,
        personaId: data["persona-id"] || "",
        persona: data.persona || "",
        prompt: data.prompt || "",
        content: content.trim(),
      },
    },
  };
};

export default function MeditationSampleDetail({ sample }: PageProps) {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sample.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <PlaygroundLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/playground/chatgpt-meditation-samples"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-2xl">Meditation script: {sample.slug}</h1>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium mt-2">Persona:</p>
                  <p className="mt-1">{sample.persona}</p>
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="font-medium">Prompt:</p>
                  <p className="mt-1">{sample.prompt}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRaw(!showRaw)}
                  className="text-xs"
                >
                  {showRaw ? "Show Rendered" : "Show Markdown"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="text-xs"
                >
                  {copied ? "Copied!" : "Copy Script"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {showRaw ? (
                <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 p-4 rounded-md">
                  {sample.content}
                </pre>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{sample.content}</ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PlaygroundLayout>
  );
}
