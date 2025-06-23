import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { MarkdownDialog } from "./markdown-dialog";
import { useMyMeditations } from "@/components/utils/use-my-meditations";

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
  const { ownsMeditation } = useMyMeditations();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const canEdit = ownsMeditation(meditationId);

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
    isOpen: open,
  }));

  // Don't render anything until mounted on client to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  if (!canEdit) {
    return null;
  }

  return (
    <MarkdownDialog
      open={open}
      onOpenChange={setOpen}
      meditation={meditation}
      meditationId={meditationId}
    />
  );
});

DescriptionEditDialog.displayName = "DescriptionEditDialog";
