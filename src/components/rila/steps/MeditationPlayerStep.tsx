import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Meditation } from "../Rila";
import { FileStorageApi } from "@/lib/file-storage";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Download,
  Loader,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadAudioFile } from "../utils/audioExporter";
import { createAudioUrl } from "../utils/audioUtils";
import { ShareResponse } from "../utils/shareService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MeditationPlayer } from "../MeditationPlayer";

interface MeditationPlayerStepProps {
  meditation: Meditation;
  fileStorage: FileStorageApi;
  onBack: () => void;
  onShareMeditation: () => Promise<ShareResponse>;
}

export function MeditationPlayerStep({
  meditation,
  fileStorage,
  onBack,
  onShareMeditation,
}: MeditationPlayerStepProps) {
  const hasStartedLoadingAudio = useRef(false);
  const [state, setState] = useState({
    isDownloading: false,
    isLoading: true,
    audioReady: false,
    isShareDialogOpen: false,
    shareMessage: undefined as
      | { type: "success" | "error"; content: string; url?: string }
      | undefined,
    audioUrl: undefined as string | undefined,
  });

  // Load the audio file
  useEffect(() => {
    if (hasStartedLoadingAudio.current) return;
    hasStartedLoadingAudio.current = true;

    const loadAudio = async () => {
      try {
        if (!meditation.fullAudioFileId) {
          throw new Error("No full audio file ID found in the meditation");
        }

        const storedFile = await fileStorage.getFile(
          meditation.fullAudioFileId
        );
        if (!storedFile || !storedFile.data) {
          throw new Error("Full audio file not found in storage");
        }

        const url = createAudioUrl(storedFile.data);

        setState((prev) => ({
          ...prev,
          audioUrl: url,
          audioReady: true,
          isLoading: false,
        }));
      } catch (error) {
        console.error("Error loading audio:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
        alert(
          `Error loading audio: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    };

    loadAudio();
  }, [meditation.fullAudioFileId, fileStorage]);

  // Download the meditation audio
  const downloadMeditation = async () => {
    try {
      setState((prev) => ({ ...prev, isDownloading: true }));

      if (!meditation.fullAudioFileId) {
        throw new Error("No full audio file ID found in the meditation");
      }

      const storedFile = await fileStorage.getFile(meditation.fullAudioFileId);
      if (!storedFile || !storedFile.data) {
        throw new Error("Full audio file not found in storage");
      }

      const url = createAudioUrl(storedFile.data);
      const fileName = `${meditation.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_meditation.wav`;

      downloadAudioFile(url, fileName);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading meditation:", error);
      alert(
        `Error downloading meditation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setState((prev) => ({ ...prev, isDownloading: false }));
    }
  };

  const openShareDialog = () =>
    setState((prev) => ({ ...prev, isShareDialogOpen: true }));
  const closeShareDialog = () =>
    setState((prev) => ({ ...prev, isShareDialogOpen: false }));

  const confirmShare = async () => {
    try {
      const response = await onShareMeditation();
      closeShareDialog();
      setState((prev) => ({
        ...prev,
        shareMessage: {
          type: "success",
          content: "Meditation shared successfully! Share using this link:",
          url: response.shareUrl,
        },
      }));
    } catch (error) {
      console.error("Error sharing meditation:", error);
      setState((prev) => ({
        ...prev,
        shareMessage: {
          type: "error",
          content: `Failed to share meditation: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        },
      }));
    }
  };

  if (state.isLoading || !state.audioUrl) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center p-8">
          <Loader className="animate-spin mb-4" size={32} />
          <p className="text-muted-foreground">Loading meditation audio...</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground"
        >
          <ArrowLeft className="mr-1" size={16} />
          Back
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openShareDialog}
            disabled={!state.audioReady}
            className="text-muted-foreground"
          >
            <Share2 className="mr-1" size={16} />
            Share Meditation
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={downloadMeditation}
            disabled={!state.audioReady}
            className="text-muted-foreground"
          >
            {state.isDownloading ? (
              <Loader className="mr-1 animate-spin" size={16} />
            ) : (
              <Download className="mr-1" size={16} />
            )}
            {state.isDownloading ? "Downloading..." : "Download Audio"}
          </Button>
        </div>
      </div>

      {/* Share Meditation Dialog */}
      <Dialog open={state.isShareDialogOpen} onOpenChange={closeShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Meditation</DialogTitle>
            <DialogDescription>
              You're about to share "{meditation.title}" with others.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="mb-4">
              If you proceed, we'll generate a link that you can share with
              friends and family.
            </p>
            <p className="mb-4 text-muted-foreground">Please note:</p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>You won't be able to edit or delete it</li>
              <li>This is a temporary link that will expire after 7 days</li>
              <li>
                Anyone with the link will be able to access this meditation
              </li>
            </ul>
          </div>

          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button variant="outline" onClick={closeShareDialog}>
              Cancel
            </Button>
            <Button onClick={confirmShare}>Ok, create link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share result message */}
      {state.shareMessage && (
        <div
          className={cn(
            "mb-6 p-4 rounded-lg text-center border",
            state.shareMessage.type === "success"
              ? "bg-background border-border text-foreground"
              : "bg-destructive/10 border-destructive/50 text-destructive"
          )}
        >
          <p>
            {state.shareMessage.content}
            {state.shareMessage.url && (
              <a
                href={state.shareMessage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-primary hover:underline"
              >
                {state.shareMessage.url}
              </a>
            )}
          </p>
        </div>
      )}

      <h1 className="text-2xl font-medium text-center mb-6">
        {meditation.title}
      </h1>

      <MeditationPlayer meditation={meditation} audioUrl={state.audioUrl} />
    </>
  );
}
