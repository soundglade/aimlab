"use client";

import { Button } from "@/components/ui/button";
import { Download, Share, Trash } from "lucide-react";
import { toast } from "sonner";
import { useMyMeditations } from "@/components/utils/use-my-meditations";
import { ConfirmDestructiveDialog } from "@/components/ui/confirm-destructive-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function MeditationActionButtons({
  meditationId,
  audioUrl,
  meditationTitle,
}) {
  const { ownsMeditation, deleteMeditation } = useMyMeditations();
  const canDelete = ownsMeditation(meditationId);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

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

  const handleConfirmDelete = () => {
    deleteMeditation(meditationId);
    setShowDeleteDialog(false);
    router.push("/");
  };

  return (
    <div className="m-4 flex justify-center gap-3">
      <Button variant="outline" size="sm" onClick={handleDownload}>
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>

      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share className="mr-2 h-4 w-4" />
        Share
      </Button>

      {canDelete && (
        <ConfirmDestructiveDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete meditation"
          description={`Are you sure you want to delete "${meditationTitle}"?`}
          confirmText="Delete"
          onConfirm={handleConfirmDelete}
        >
          <Button
            variant="outline"
            size="sm"
            className="hover:text-destructive-foreground hover:bg-destructive/90 transition-none"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </ConfirmDestructiveDialog>
      )}
    </div>
  );
}
