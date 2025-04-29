import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { ReadingDrawer } from "./reading-drawer";
import Link from "next/link";
import { AudioContextRefresher } from "./audio-context-refresher";
import { ExamplesSelect } from "./examples-select";

export default function ReaderPage() {
  const [script, setScript] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [response, setResponse] = useState<any | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scriptTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsDrawerOpen(true);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setResponse(null);

    try {
      const response = await fetch("/api/start-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
        signal: controller.signal,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let eventEnd;
          while ((eventEnd = buffer.indexOf("\n\n")) !== -1) {
            const event = buffer.slice(0, eventEnd);
            buffer = buffer.slice(eventEnd + 2);

            // Find the data line(s)
            const dataLines = event
              .split("\n")
              .filter((line) => line.startsWith("data: "))
              .map((line) => line.slice(6));
            if (dataLines.length > 0) {
              const dataStr = dataLines.join("");
              try {
                const data = JSON.parse(dataStr);
                setResponse(data);
              } catch (err) {
                console.error("Error parsing JSON response:", err, dataStr);
              }
            }
          }
        }
      }
    } catch (error: any) {
      // Gracefully handle user aborts
      if (error.name === "AbortError") {
        console.log("SSE fetch aborted by user");
      } else {
        console.error("Error:", error);
      }
    } finally {
      setIsSubmitting(false);
      // Clear controller when done
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isDrawerOpen && abortControllerRef.current) {
      // Abort the ongoing fetch, ignore errors
      try {
        abortControllerRef.current.abort();
      } catch {
        // ignore abort exceptions
      }
    }
  }, [isDrawerOpen]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch {
          // ignore abort exceptions
        }
      }
    };
  }, []);

  return (
    <Layout>
      <div className="pb-0 pt-8">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="mb-2 text-center text-3xl tracking-tight">
            Instant Meditation Player
          </h1>

          <p className="text-muted-foreground mb-4 text-center">
            Instantly read your own guided meditations.
          </p>

          <div className="bg-card shadow-xs text-muted-foreground mx-auto mb-3 max-w-3xl rounded-lg p-4 text-sm md:mb-4">
            <ul className="list-inside space-y-2">
              <li>
                Use <i>ChatGPT</i>,{" "}
                <Link
                  href="https://awakin.ai"
                  target="_blank"
                  className="text-primary hidden sm:inline"
                >
                  Awakin.ai
                </Link>{" "}
                or another chatbot to generate a meditation script, then paste
                it down here
              </li>
            </ul>
          </div>

          <div className="mx-auto mb-3 flex justify-center md:mb-4">
            <ExamplesSelect
              onSelect={(example) => {
                setScript(example.script);
                setTimeout(() => {
                  if (scriptTextareaRef.current) {
                    scriptTextareaRef.current.scrollTop = 0;
                  }
                }, 0);
              }}
            />
          </div>

          <form
            onSubmit={handleSubmit}
            className="shadow-xs bg-card mx-auto max-w-3xl space-y-4 rounded-lg p-6"
          >
            <div>
              <Textarea
                id="meditation-script"
                placeholder="Paste your meditation script here..."
                className="scrollbar-thin field-sizing-fixed bg-background h-[300px] overflow-y-auto text-sm md:h-[400px] md:text-base"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                disabled={isSubmitting}
                required
                ref={scriptTextareaRef}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !script.trim()}
            >
              {isSubmitting ? "Playing..." : "Play"}
            </Button>
          </form>

          <ReadingDrawer
            open={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
            response={response}
          />
        </div>
      </div>
      <AudioContextRefresher />
    </Layout>
  );
}
