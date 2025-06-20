import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Meditation } from "@/components/types";
import { toast } from "sonner";

interface MeditationCoverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meditation: Meditation | undefined;
  meditationId: string;
  editMeditationCoverImage: (id: string, url: string) => Promise<boolean>;
}

export function MeditationCoverDialog({
  open,
  onOpenChange,
  meditation,
  meditationId,
  editMeditationCoverImage,
}: MeditationCoverDialogProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCoverImageUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "aimlab");
    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dbmrmkcuq/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (data.secure_url) {
        const success = await editMeditationCoverImage(
          meditationId,
          data.secure_url
        );
        if (success) {
          window.location.reload();
        } else {
          toast.error("Failed to update cover image");
        }
      } else {
        toast.error("Upload failed");
      }
    } catch (e) {
      toast.error("Upload error");
    }
    setUploading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl"
        headerContent={
          meditation?.coverImageUrl ? "Edit cover image" : "Add cover image"
        }
      >
        <div className="flex flex-col items-center gap-5 py-2">
          {meditation?.coverImageUrl ? (
            <img
              src={meditation.coverImageUrl}
              alt="Current cover"
              className="mb-2 max-h-[500px] rounded-lg shadow"
            />
          ) : (
            <div className="text-muted-foreground mb-2 w-full text-center text-sm">
              No cover image set
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-row justify-center gap-2 align-middle md:justify-center">
          <label htmlFor="cover-upload" className="flex flex-col items-center">
            <Button asChild className="justify-center" disabled={uploading}>
              <span>
                {uploading
                  ? "Uploading..."
                  : meditation?.coverImageUrl
                  ? "Replace image"
                  : "Choose image"}
              </span>
            </Button>
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              disabled={uploading}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverImageUpload(file);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
          </label>
          {meditation?.coverImageUrl && (
            <Button
              variant="destructive"
              onClick={async () => {
                setUploading(true);
                const success = await editMeditationCoverImage(
                  meditationId,
                  ""
                );
                setUploading(false);
                onOpenChange(false);
                if (success) {
                  toast.success("Cover image deleted");
                  window.location.reload();
                } else {
                  toast.error("Failed to delete cover image");
                }
              }}
              disabled={uploading}
            >
              Delete cover image
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
