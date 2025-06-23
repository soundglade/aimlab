import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
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
import { useMyMeditations } from "@/components/utils/use-my-meditations";
import { toast } from "sonner";

interface DescriptionEditDialogProps {
  meditation: any;
  meditationId: string;
}

export interface DescriptionEditDialogRef {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

export const DescriptionEditDialog = forwardRef<
  DescriptionEditDialogRef,
  DescriptionEditDialogProps
>(({ meditation, meditationId }, ref) => {
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [inputValue, setInputValue] = useState(meditation.description || "");
  const { ownsMeditation, editMeditationDescription } = useMyMeditations();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setInputValue(meditation.description || "");
  }, [meditation.description]);

  const canEdit = ownsMeditation(meditationId);
  const hasDescription = !!meditation.description;

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
    isOpen: open,
  }));

  const handleConfirm = async () => {
    if (inputValue.trim()) {
      const success = await editMeditationDescription(meditationId, inputValue);
      if (success) {
        window.location.reload();
      } else {
        toast.error("Failed to update description");
        setOpen(false);
      }
    } else {
      // If description is empty, treat it as a delete
      handleDelete();
    }
  };

  const handleDelete = async () => {
    const success = await editMeditationDescription(meditationId, null);
    if (success) {
      window.location.reload();
    } else {
      toast.error("Failed to remove description");
      setOpen(false);
    }
  };

  // Don't render anything until mounted on client to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  if (!canEdit) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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
});

DescriptionEditDialog.displayName = "DescriptionEditDialog";
