import { Button } from "@/components/ui/button";
import { Lightbulb, Users, CircleHelp } from "lucide-react";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export default function ReaderPage() {
  const [script, setScript] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsDrawerOpen(true);
    setMessages([]);

    try {
      const response = await fetch("/api/start-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          lines.forEach((line) => {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));

              setMessages((prev) => [...prev, data.message]);
            }
          });
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

          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerContent className="flex h-[calc(100vh-80px)] flex-col p-4">
              <DrawerHeader>
                <DrawerTitle>Reading Progress</DrawerTitle>
              </DrawerHeader>
              <div className="flex-1 overflow-auto">
                {messages.map((message, index) => (
                  <div key={index} className="bg-muted mb-2 rounded p-2">
                    {message}
                  </div>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </Layout>
  );
}
