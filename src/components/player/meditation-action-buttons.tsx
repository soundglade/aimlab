"use client";

import { Button } from "@/components/ui/button";
import {
  Download,
  Share,
  Trash,
  Settings2,
  TextCursorInput,
  LetterText,
} from "lucide-react";
import { toast } from "sonner";
import { useMyMeditations } from "@/components/utils/use-my-meditations";
import { ConfirmDestructiveDialog } from "@/components/ui/confirm-destructive-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputDialog } from "@/components/ui/input-dialog";

export function MeditationActionButtons({
  meditationId,
  audioUrl,
  meditationTitle,
}) {
  const { ownsMeditation, deleteMeditation, editMeditationTitle } =
    useMyMeditations();
  const canEdit = ownsMeditation(meditationId);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditTitleDialog, setShowEditTitleDialog] = useState(false);
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
        .writeText(`https://aimlab.soundglade.com/m/${meditationId}`)
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

  const handleTitleUpdate = async (newTitle) => {
    if (newTitle.trim() && newTitle !== meditationTitle) {
      const success = await editMeditationTitle(meditationId, newTitle);
      if (success) {
        // Hard refresh the page to show updated title
        window.location.reload();
      } else {
        toast.error("Failed to update title");
      }
    } else if (!newTitle.trim()) {
      toast.error("Title cannot be empty");
    }
    setShowEditTitleDialog(false);
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

      {canEdit && (
        <>
          <InputDialog
            open={showEditTitleDialog}
            onOpenChange={setShowEditTitleDialog}
            title="Edit meditation title"
            description="Enter a new title for your meditation"
            confirmText="Save"
            initialValue={meditationTitle}
            placeholder="Enter new title"
            onConfirm={handleTitleUpdate}
          ></InputDialog>
          <ConfirmDestructiveDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title="Delete meditation"
            description={`Are you sure you want to delete "${meditationTitle}"?`}
            confirmText="Delete"
            onConfirm={handleConfirmDelete}
          >
            <DropdownMenu modal={true}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowEditTitleDialog(true)}>
                  <TextCursorInput className="mr-2 h-4 w-4" />
                  Edit title
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ConfirmDestructiveDialog>
        </>
      )}
    </div>
  );
}

function EditDropdownMenu() {}
