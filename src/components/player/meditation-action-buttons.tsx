"use client";

import { Button } from "@/components/ui/button";
import {
  Download,
  Share,
  Trash,
  Settings2,
  TextCursorInput,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useMyMeditations } from "@/components/utils/use-my-meditations";
import { MeditationCoverDialog } from "./meditation-cover-dialog";
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
import { MarkdownDialog } from "@/components/ui/markdown-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Meditation } from "@/components/types";

export function MeditationActionButtons({
  meditationId,
  audioUrl,
  meditationTitle,
  embedded,
  meditation,
}: {
  meditationId: string;
  audioUrl: string;
  meditationTitle: string;
  embedded?: boolean;
  meditation?: Meditation;
}) {
  const {
    ownsMeditation,
    deleteMeditation,
    editMeditationTitle,
    editMeditationDescription,
    editMeditationCoverImage,
  } = useMyMeditations();
  const canEdit = !embedded && ownsMeditation(meditationId);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditTitleDialog, setShowEditTitleDialog] = useState(false);
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [showCoverDialog, setShowCoverDialog] = useState(false);
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

  const handleTitleUpdate = async (newTitle: string) => {
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

  // Cover image dialog logic is now in MeditationCoverDialog
  return (
    <div className="flex justify-center gap-3">
      <Button variant="link" size="sm" onClick={handleDownload}>
        <Download className="mr-1 h-4 w-4" />
        Download
      </Button>

      <Button variant="link" size="sm" onClick={handleShare}>
        <Share className="mr-1 h-4 w-4" />
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
          {meditation && (
            <MarkdownDialog
              open={showDescriptionDialog}
              onOpenChange={setShowDescriptionDialog}
              meditation={meditation}
              meditationId={meditationId}
            />
          )}
          <ConfirmDestructiveDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title="Delete meditation"
            description={`Are you sure you want to delete "${meditationTitle}"?`}
            confirmText="Delete"
            onConfirm={handleConfirmDelete}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu modal={true}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="link" size="sm">
                      <Settings2 className="h-4 w-4" />
                      Edit
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowEditTitleDialog(true)}
                    >
                      <TextCursorInput className="mr-2 h-4 w-4" />
                      Edit title
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDescriptionDialog(true)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {meditation?.description
                        ? "Edit description"
                        : "Add description"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowCoverDialog(true)}>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      {meditation?.coverImageUrl
                        ? "Edit cover image"
                        : "Add cover image"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>Edit meditation options</TooltipContent>
            </Tooltip>
          </ConfirmDestructiveDialog>
        </>
      )}
      <MeditationCoverDialog
        open={showCoverDialog}
        onOpenChange={setShowCoverDialog}
        meditation={meditation}
        meditationId={meditationId}
        editMeditationCoverImage={editMeditationCoverImage}
      />
    </div>
  );
}
