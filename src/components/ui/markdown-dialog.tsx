import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Meditation } from "@/components/types";
import { useMyMeditations } from "@/components/utils/use-my-meditations";
import { toast } from "sonner";

type MarkdownDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  meditation: Meditation;
  meditationId: string;
};

export function MarkdownDialog({
  open,
  onOpenChange,
  meditation,
  meditationId,
}: MarkdownDialogProps) {
  const { editMeditationDescription } = useMyMeditations();
  const [inputValue, setInputValue] = useState(meditation.description || "");
  const hasDescription = !!meditation.description;

  const handleConfirm = async () => {
    if (inputValue.trim()) {
      const success = await editMeditationDescription(meditationId, inputValue);
      if (success) {
        toast.success("Description updated");
        // Hard refresh the page to show updated description
        window.location.reload();
      } else {
        toast.error("Failed to update description");
      }
    } else {
      // If description is empty, treat it as a delete
      handleDelete();
    }
    if (onOpenChange) onOpenChange(false);
  };

  const handleDelete = async () => {
    const success = await editMeditationDescription(meditationId, null);
    if (success) {
      toast.success("Description removed");
      // Hard refresh the page to show updated state
      window.location.reload();
    } else {
      toast.error("Failed to remove description");
    }
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl!">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {hasDescription ? "Edit description" : "Add description"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Enter a markdown description for your meditation
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter markdown content..."
            className="min-h-[300px] w-full break-all"
          />
        </div>
        <AlertDialogFooter className="flex items-center justify-between">
          <div>
            {hasDescription && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash className="mr-2 h-4 w-4" />
                Delete Description
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
            >
              Save
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
