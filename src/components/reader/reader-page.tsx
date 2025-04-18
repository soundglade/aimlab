import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { ReadingDrawer } from "./reading-drawer";

export default function ReaderPage() {
  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [response, setResponse] = useState<any | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
      <AudioContextRefresher />
    </Layout>
  );
}

function AudioContextRefresher() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasUserBeenActive, setHasUserBeenActive] = useState(false);

  useEffect(() => {
    function markActive() {
      setHasUserBeenActive((prev) => prev || true);
    }

    if (!hasUserBeenActive) {
      document.addEventListener("click", markActive);
      document.addEventListener("keydown", markActive);
      document.addEventListener("touchstart", markActive);
    }

    return () => {
      document.removeEventListener("click", markActive);
      document.removeEventListener("keydown", markActive);
      document.removeEventListener("touchstart", markActive);
    };
  }, [hasUserBeenActive]);

  // Try to play audio when hasUserBeenActive becomes true
  useEffect(() => {
    if (hasUserBeenActive && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch((e) => {
        console.log("Audio play error:", e);
      });
    }
  }, [hasUserBeenActive]);

  const handleEnded = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.load();
      audioRef.current.play().catch((e) => {
        console.log("Audio play error:", e);
      });
    }
  };

  return (
    <audio
      ref={audioRef}
      src="/assets/silence-10-seconds.mp3"
      style={{ opacity: 0, position: "absolute", top: -1000 }}
      onEnded={handleEnded}
      controls={true}
      preload="auto"
    />
  );
}

const DEFAULT_SCRIPT = `### **Guided Closing Meditation (5-7 minutes)**

**1. Settle & Breathe (1 minute)**
*"Find a comfortable position, either lying down or seated. Let your hands rest gently, palms up or down—whatever feels natural. Close your eyes or soften your gaze. Take a deep breath in through your nose… and exhale slowly through your mouth. Again, inhale… and exhale. With each breath, allow your body to settle deeper into stillness."*

**2. Body Relaxation (1-2 minutes)**
*"Now bring your awareness to your body. Notice any areas holding tension—your face, shoulders, hands, or legs. With your next exhale, imagine that tension dissolving, like waves gently receding from the shore. Feel yourself becoming lighter, more at ease."*

**3. Awareness & Presence (2 minutes)**
*"Now, shift your focus to your breath—your anchor to this present moment. There's nowhere to be, nothing to do except be here with your breath. If your mind wanders, gently bring it back to the sensation of the inhale and exhale. Each breath is a gentle reminder: You are here. You are present."*

**4. Gentle Closing (1 minute)**
*"Before we close, take a moment to set an intention for the rest of your day. It might be a single word—peace, presence, gratitude—or just the feeling of calm within you right now. Take one last deep breath in… and exhale slowly. When you're ready, begin to gently bring movement into your fingers and toes, slowly opening your eyes, returning with a sense of calm and clarity."*`;

// const DEFAULT_SCRIPT = `# Micro Meditation

// Step 1: Take a deep breath in. Exhale smiling
// Step 2: Have a great day`;
