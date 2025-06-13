import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout-component";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { voiceIdAtom, languageAtom } from "./atoms";
import { ReadingDrawer } from "./reading-drawer";
import Link from "next/link";
import { AudioContextRefresher } from "./audio-context-refresher";
import { ExamplesSelect } from "./examples-select";
import CustomizeDrawer from "./customize-drawer";
import { useLocalStorage } from "@rehooks/local-storage";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { VoiceSelect } from "./voice-select";
import { LanguageSelect } from "./language-select";
import { useRouter } from "next/router";

export default function ReaderPage() {
  const [script, setScript] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [response, setResponse] = useState<any | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scriptTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [customSettings] = useLocalStorage("custom-voice-settings", null);
  const [hasMounted, setHasMounted] = useState(false);
  const [improvePauses, setImprovePauses] = useState(true);
  const [selectedVoice, setSelectedVoice] = useAtom(voiceIdAtom);
  const [selectedLanguage, setSelectedLanguage] = useAtom(languageAtom);
  const router = useRouter();

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
      // Create voice settings for self-hosted Kokoro
      const voiceSettings = selectedVoice
        ? {
            service: "selfHostedKokoro",
            serviceOptions: {
              voiceId: selectedVoice,
            },
          }
        : null;

      const response = await fetch("/api/start-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          ...(customSettings
            ? { settings: customSettings }
            : voiceSettings
            ? { settings: voiceSettings }
            : {}),
          improvePauses,
          language: selectedLanguage,
        }),
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

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <Layout>
      <div className="pb-0 pt-1 md:pt-6">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="mb-2 text-center text-3xl tracking-tight">
            Instant Meditation Player
          </h1>

          <p className="text-muted-foreground mb-4 text-center">
            Instantly read your own guided meditations
          </p>

          <div className="mx-auto mb-1 flex justify-center gap-4">
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
            <CustomizeDrawer />
          </div>

          <div className="text-muted-foreground mx-auto mb-1 max-w-3xl rounded-lg p-4 text-sm">
            <ul className="list-inside space-y-2">
              <li>
                <span className="hidden sm:inline">
                  {" "}
                  Use <i>ChatGPT</i>,{" "}
                  <Link
                    href="https://awakin.ai"
                    target="_blank"
                    className="text-primary"
                  >
                    Awakin.ai
                  </Link>{" "}
                  or another chatbot to generate a meditation script, then paste
                  it here
                </span>
                <span className="sm:hidden">
                  Create a meditation script with <i>ChatGPT</i> or any other
                  chatbot, then copy and paste it down here
                </span>
              </li>
            </ul>
          </div>

          <form
            onSubmit={handleSubmit}
            className="shadow-xs bg-card mx-auto max-w-3xl space-y-3 rounded-lg p-4 md:p-6"
          >
            <div>
              <Textarea
                id="meditation-script"
                placeholder="Paste your meditation script here..."
                className="scrollbar-thin text-muted-foreground field-sizing-fixed bg-background h-[250px] overflow-y-auto text-sm md:h-[300px] md:text-base"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                disabled={isSubmitting}
                required
                ref={scriptTextareaRef}
              />
            </div>
            <Button
              type="submit"
              className="w-full text-base"
              disabled={isSubmitting || !script.trim()}
            >
              {isSubmitting
                ? "Playing..."
                : hasMounted && customSettings
                ? "Play with custom ElevenLabs settings"
                : "Play"}
            </Button>

            <div className="flex items-center justify-center gap-2">
              <LanguageSelect disabled={isSubmitting} />

              <VoiceSelect disabled={isSubmitting} />
              <div>
                <div className="flex gap-2">
                  <Label
                    htmlFor="improve-pauses"
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "sm" }),
                      "flex h-auto w-fit mx-auto cursor-pointer items-center justify-center gap-3 py-1.5",
                      isSubmitting ? "cursor-not-allowed opacity-50" : ""
                    )}
                  >
                    <Switch
                      id="improve-pauses"
                      checked={improvePauses}
                      onCheckedChange={
                        !isSubmitting ? setImprovePauses : undefined
                      }
                      disabled={isSubmitting}
                      className="opacity-50"
                    />
                    Improve pauses
                  </Label>
                </div>
              </div>
            </div>
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
