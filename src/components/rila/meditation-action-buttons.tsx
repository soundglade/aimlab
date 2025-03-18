"use client";

import { Button } from "@/components/ui/button";
import { Download, Share, Trash } from "lucide-react";
import { toast } from "sonner";
import { useMyMeditations } from "./utils/use-my-meditations";

export function MeditationActionButtons({
  meditationId,
  audioUrl,
  meditationTitle,
}) {
  const { ownsMeditation, deleteMeditation } = useMyMeditations();
  const canDelete = ownsMeditation(meditationId);
  const handleDownload = () => {
    const downloadLink = document.createElement("a");
    downloadLink.href = audioUrl;

    const filename = `${meditationTitle
      .replace(/\s+/g, "-")
      .toLowerCase()}.mp3`;
    downloadLink.download = filename;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          toast.success("URL copied to clipboard");
        })
        .catch(() => {
          toast.error("Failed to copy URL");
        });
    } else {
      toast.error("Clipboard access not available");
    }
  };

  return (
    <div className="flex justify-center gap-3 m-4">
      <Button variant="outline" size="sm" onClick={handleDownload}>
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>

      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share className="mr-2 h-4 w-4" />
        Share
      </Button>

      {canDelete && (
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => deleteMeditation(meditationId)}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </Button>
      )}
    </div>
  );
}
