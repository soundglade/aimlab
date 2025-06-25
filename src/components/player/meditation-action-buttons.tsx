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
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { useMyMeditations } from "@/components/utils/use-my-meditations";
import { MeditationCoverDialog } from "./meditation-cover-dialog";
import { ConfirmDestructiveDialog } from "@/components/ui/confirm-destructive-dialog";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputDialog } from "@/components/ui/input-dialog";
import {
  DescriptionEditDialog,
  DescriptionEditDialogRef,
} from "@/components/ui/description-edit-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Meditation } from "@/components/types";
import { cn } from "@/lib/utils";

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
  meditation?: any;
}) {
  const {
    ownsMeditation,
    deleteMeditation,
    editMeditationTitle,
    editMeditationCoverImage,
    hideMeditation,
  } = useMyMeditations();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditTitleDialog, setShowEditTitleDialog] = useState(false);
  const [showCoverDialog, setShowCoverDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const canEdit = isMounted && !embedded && ownsMeditation(meditationId);

  const descriptionEditRef = useRef<DescriptionEditDialogRef>(null);
  const router = useRouter();

  const handleDownload = () => {
    const downloadLink = document.createElement("a");
    downloadLink.href = audioUrl;

    const filename = audioUrl.split("/").pop() || "meditation.mp3";
    downloadLink.download =
      filename === "nnn.mp3" ? `meditation-${meditationId}.mp3` : filename;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(
          meditation?.readingId
            ? `https://meditationlab.ai/r/${meditationId}`
            : `https://meditationlab.ai/m/${meditationId}`
        )
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

  const handleEditDescription = () => {
    descriptionEditRef.current?.open();
  };

  const handleMakePrivate = async () => {
    try {
      await hideMeditation(meditationId);
      // Hard redirect to /instant without showing toast
      window.location.href = "/instant";
    } catch (error) {
      toast.error("Failed to make meditation private");
    }
  };

  // Cover image dialog logic is now in MeditationCoverDialog
  return (
    <div
      className={cn(
        "flex justify-center gap-3",
        !isMounted && "opacity-0",
        isMounted && "opacity-100 transition-opacity"
      )}
    >
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
                    <DropdownMenuItem onClick={handleEditDescription}>
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
                    {meditation?.readingId && (
                      <DropdownMenuItem onClick={handleMakePrivate}>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Make private
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>Edit meditation options</TooltipContent>
            </Tooltip>
          </ConfirmDestructiveDialog>

          <DescriptionEditDialog
            ref={descriptionEditRef}
            meditation={meditation}
            meditationId={meditationId}
          />
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
