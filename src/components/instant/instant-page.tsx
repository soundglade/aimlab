import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout-component";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import { useState, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { voiceIdAtom, languageAtom } from "./atoms";
import { ReadingDrawer } from "./reading-drawer";
import { DownloadProgressDialog } from "./download-progress-dialog";
import Link from "next/link";
import { AudioContextRefresher } from "./audio-context-refresher";
import { ExamplesSelect } from "./examples-select";
import CustomizeDrawer from "./customize-drawer";
import { useLocalStorage } from "@rehooks/local-storage";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { MessageSquare, Download } from "lucide-react";
import { VoiceSelect } from "./voice-select";
import { LanguageSelect } from "./language-select";
import { useRouter } from "next/router";
import { useLanguageDetection } from "@/hooks/use-language-detection";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import SavedMeditations from "./saved-meditations";

export default function ReaderPage() {
  const [script, setScript] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [response, setResponse] = useState<any | null>(null);

  // Download-specific state
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [downloadResponse, setDownloadResponse] = useState<any | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const downloadAbortControllerRef = useRef<AbortController | null>(null);
  const scriptTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [customSettings] = useLocalStorage("custom-voice-settings", null);
  const [hasMounted, setHasMounted] = useState(false);
  const [improvePauses, setImprovePauses] = useState(true);
  const [selectedVoice, setSelectedVoice] = useAtom(voiceIdAtom);
  const [selectedLanguage, setSelectedLanguage] = useAtom(languageAtom);
  const router = useRouter();

  // Language detection hook
  const { detectFromText, markUserSelected } = useLanguageDetection({
    minLength: 50,
    debounceMs: 500,
    enabled: true,
  });

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

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDownloading(true);
    setIsDownloadDialogOpen(true);

    if (downloadAbortControllerRef.current) {
      downloadAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    downloadAbortControllerRef.current = controller;
    setDownloadResponse(null);

    try {
      // Create voice settings for self-hosted Kokoro
      const voiceSettings = selectedVoice
        ? {
            instantDownload: true,
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
                setDownloadResponse(data);
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
        console.log("Download SSE fetch aborted by user");
      } else {
        console.error("Download error:", error);
      }
    } finally {
      setIsDownloading(false);
      // Clear controller when done
      downloadAbortControllerRef.current = null;
    }
  };

  const handleCancelDownload = () => {
    if (downloadAbortControllerRef.current) {
      try {
        downloadAbortControllerRef.current.abort();
      } catch {
        // ignore abort exceptions
      }
    }
    setIsDownloading(false);
    downloadAbortControllerRef.current = null;
  };

  const loadPrivateMeditation = async (meditationId: string) => {
    // Open drawer immediately with empty response
    setResponse(null);
    setIsDrawerOpen(true);

    try {
      const response = await fetch("/api/fetch-instant-meditation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: meditationId }),
      });

      const data = await response.json();

      if (data.script) {
        // Transform the API response to match the expected format
        setResponse({
          script: data.script,
          readingId: data.readingId,
        });
      }
    } catch (error) {
      console.error("Error loading private meditation:", error);
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
    if (!isDownloadDialogOpen && downloadAbortControllerRef.current) {
      // Abort the ongoing download fetch, ignore errors
      try {
        downloadAbortControllerRef.current.abort();
      } catch {
        // ignore abort exceptions
      }
    }
  }, [isDownloadDialogOpen]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch {
          // ignore abort exceptions
        }
      }
      if (downloadAbortControllerRef.current) {
        try {
          downloadAbortControllerRef.current.abort();
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
      <div className="w-full pb-0 pt-1 md:pt-6">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="mb-2 text-center text-3xl tracking-tight">
            Instant Meditation Player
          </h1>

          <p className="text-muted-foreground mb-4 text-center">
            Instantly read your own guided meditations
          </p>

          <div className="mx-auto mb-0.5 flex justify-center gap-4">
            <ExamplesSelect
              onSelect={(example) => {
                setScript(example.script);
                // Trigger language detection for the example
                detectFromText(example.script);
                setTimeout(() => {
                  if (scriptTextareaRef.current) {
                    scriptTextareaRef.current.scrollTop = 0;
                  }
                }, 0);
              }}
            />
            <CustomizeDrawer />
          </div>

          <div className="text-muted-foreground mx-auto mb-1 max-w-4xl rounded-lg p-4 text-sm">
            <ul className="list-inside space-y-2 text-center">
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
            className="mx-auto mt-0 max-w-4xl space-y-3 sm:mt-2"
          >
            <div>
              <AutoResizeTextarea
                id="meditation-script"
                placeholder="Paste your meditation script here..."
                className="scrollbar-thin dark:bg-card/40 text-foreground/80 sm:text-lg! min-h-[250px] rounded-xl border-none bg-slate-200/40 px-2 py-4 text-base sm:p-8 md:min-h-[300px] md:text-base"
                value={script}
                onChange={(e) => {
                  const newScript = e.target.value;
                  setScript(newScript);
                  // Trigger language detection
                  detectFromText(newScript);
                }}
                disabled={isSubmitting || isDownloading}
                required
                ref={scriptTextareaRef}
              />
            </div>

            <div className="sticky bottom-0 -mx-8 mt-4 text-center sm:bottom-6 sm:mx-auto md:mt-6">
              <div className="bg-card/80 z-10 mx-auto inline-block w-full max-w-lg space-y-3 rounded-xl p-3 pb-6 pt-4 backdrop-blur-sm sm:w-auto sm:rounded-3xl sm:p-4">
                <div className="mx-6 text-center">
                  <div className="relative sm:inline-block">
                    <Button
                      type="submit"
                      className="relative w-full pr-5 text-base sm:mx-auto sm:w-[200px]"
                      disabled={isSubmitting || isDownloading || !script.trim()}
                    >
                      {isSubmitting ? "Playing..." : "Play"}
                    </Button>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full opacity-50"
                          disabled={
                            isSubmitting || isDownloading || !script.trim()
                          }
                          onClick={handleDownload}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Just download the MP3</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <LanguageSelect
                    disabled={isSubmitting || isDownloading}
                    onLanguageSelect={markUserSelected}
                  />

                  <VoiceSelect disabled={isSubmitting || isDownloading} />
                  <div>
                    <div className="flex gap-2">
                      <Label
                        htmlFor="improve-pauses"
                        className={cn(
                          buttonVariants({ variant: "secondary", size: "sm" }),
                          "flex h-auto w-fit mx-auto cursor-pointer items-center justify-center gap-3 py-1.5",
                          isSubmitting || isDownloading
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        )}
                      >
                        <Switch
                          id="improve-pauses"
                          checked={improvePauses}
                          onCheckedChange={
                            !(isSubmitting || isDownloading)
                              ? setImprovePauses
                              : undefined
                          }
                          disabled={isSubmitting || isDownloading}
                          className="opacity-50"
                        />
                        Improve pauses
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <ReadingDrawer
            open={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
            script={response?.script}
          />

          <DownloadProgressDialog
            open={isDownloadDialogOpen}
            onOpenChange={setIsDownloadDialogOpen}
            response={downloadResponse}
            onCancel={handleCancelDownload}
          />
        </div>

        {/* Saved Meditations Section */}
        <div className="mx-auto max-w-4xl px-4 pb-8 pt-8">
          {hasMounted && (
            <SavedMeditations loadPrivateMeditation={loadPrivateMeditation} />
          )}
        </div>
      </div>
      <AudioContextRefresher />
    </Layout>
  );
}
