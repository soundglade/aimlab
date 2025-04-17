import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import React from "react";

interface PlaybackBlockedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  retryPlayFn: null | (() => void);
}

export const PlaybackBlockedModal: React.FC<PlaybackBlockedModalProps> = ({
  open,
  onOpenChange,
  retryPlayFn,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Playback Blocked</AlertDialogTitle>
          <AlertDialogDescription>
            Your device requires you to interact before audio can play. Please
            press Play to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            asChild
            onClick={() => {
              onOpenChange(false);
              if (retryPlayFn) retryPlayFn();
            }}
          >
            <Button>Play</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
