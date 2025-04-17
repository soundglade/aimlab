import { Button } from "@/components/ui/button";
import { Lightbulb, Users, CircleHelp } from "lucide-react";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ReadingDrawer } from "./reading-drawer";

export default function ReaderPage() {
  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [response, setResponse] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsDrawerOpen(true);
    setResponse(null);

    try {
      const response = await fetch("/api/start-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
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
                console.log("data", data);
                setResponse(data);
              } catch (err) {
                console.error("Error parsing JSON response:", err, dataStr);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="pb-0 pt-8">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="mb-2 text-center text-3xl tracking-tight">
            Meditation Reader
          </h1>

          <p className="text-muted-foreground mb-4 text-center">
            Instantly read your own guided meditations.
          </p>

          <div className="bg-card border-accent border-1 text-muted-foreground mx-auto mb-4 max-w-xl rounded-lg p-4 text-sm">
            <ul className="list-inside space-y-2">
              <li>
                <i>Tip:</i> Use <i>ChatGPT</i> or another AI chatbot to generate
                and refine a meditation script. Then copy and paste the script
                here.
              </li>
            </ul>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-accent border-1 bg-card mx-auto max-w-xl space-y-4 rounded-lg p-6"
          >
            <div>
              <Textarea
                id="meditation-script"
                placeholder="Paste your meditation script here..."
                className="bg-background max-h-[300px] min-h-[200px] overflow-y-auto"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !script.trim()}
            >
              {isSubmitting ? "Reading..." : "Read"}
            </Button>
          </form>

          <ReadingDrawer
            open={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
            response={response}
          />
        </div>
      </div>
    </Layout>
  );
}

const DEFAULT_SCRIPT = `# Micro Meditation

Step 1: Take a deep breath in.
[5 seconds pause]
Step 2: Have a great day`;
