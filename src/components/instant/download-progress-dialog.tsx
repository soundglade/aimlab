import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface DownloadProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  response: any | null;
  onCancel: () => void;
}

export function DownloadProgressDialog({
  open,
  onOpenChange,
  response,
  onCancel,
}: DownloadProgressDialogProps) {
  // Check if response is rejected
  const isRejected = response?.isRejected;
  const rejectionReason = response?.rejectionReason;

  // Calculate progress
  const script = response?.script;
  const speechSteps =
    script?.steps?.filter((step: any) => step.type === "speech") || [];
  const completedSpeechSteps = speechSteps.filter(
    (step: any) => step.audio && typeof step.audio === "string"
  );

  const isScriptTextCompleted = script?.completed;

  const progress =
    speechSteps.length > 0 && isScriptTextCompleted
      ? (completedSpeechSteps.length / speechSteps.length) * 100
      : 0;

  const isDownloadReady = script?.completed && script?.fullAudio;
  const title = script?.title || "Meditation";

  const handleDownload = () => {
    if (script?.fullAudio) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = script.fullAudio;
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Close dialog after download
      onOpenChange(false);
      toast.success("Download started!");
    } else {
      toast.error("Download not ready yet. Please wait a moment.");
    }
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const handleTryAgain = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg!"
        headerContent={
          <div className="text-muted-foreground inline-flex items-center space-x-2 rounded-full pl-2">
            <span className="text-sm font-medium">
              {isRejected ? "Request Failed" : "Synthesizing Meditation"}
            </span>
          </div>
        }
      >
        <div className="space-y-6 p-2">
          {isRejected ? (
            // Error UI for rejected responses
            <>
              <div className="text-center">
                <div className="bg-destructive/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <AlertCircle className="text-destructive h-8 w-8" />
                </div>
                <h2 className="mb-2 text-xl font-semibold">Request Rejected</h2>
                <p className="text-muted-foreground text-sm">
                  {rejectionReason ||
                    "The content provided could not be processed into a meditation script."}
                </p>
              </div>

              {/* Error Action Buttons */}
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleTryAgain}
                  className="min-w-[100px]"
                >
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
              </div>
            </>
          ) : (
            // Original progress UI for successful responses
            <>
              {/* Title */}
              <div className="text-center">
                <h2 className="mb-2 text-xl font-semibold">{title}</h2>
              </div>

              {/* Progress Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2 text-sm">
                    {isScriptTextCompleted
                      ? `Synthesizing ${completedSpeechSteps.length} of ${speechSteps.length} speech segments`
                      : `Processing meditation structure... Speech steps: ${speechSteps.length}`}
                  </p>
                  <Progress
                    value={progress}
                    className="mx-auto w-full max-w-lg"
                  />
                  <p className="text-muted-foreground mt-1 text-xs">
                    {Math.round(progress)}% complete
                  </p>
                </div>

                {/* Status Message */}
                <div className="text-center">
                  {!script?.completed ? (
                    <p className="text-muted-foreground text-sm"></p>
                  ) : !isDownloadReady ? (
                    <p className="text-muted-foreground text-sm"></p>
                  ) : (
                    <p className="text-primary text-sm font-medium">
                      ✓ Ready for download!
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="min-w-[100px]"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={!isDownloadReady}
                  className="min-w-[100px]"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
