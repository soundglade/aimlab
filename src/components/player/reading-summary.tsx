import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Edit3 } from "lucide-react";
import { Reading } from "@/components/types";
import { MeditationHeader } from "./meditation-header";
import { MarkdownDescription } from "@/components/ui/markdown-description";
import {
  DescriptionEditDialog,
  DescriptionEditDialogRef,
} from "@/components/ui/description-edit-dialog";
import { ReadingDrawer } from "../instant/reading-drawer";
import { useMyMeditations } from "@/components/utils/use-my-meditations";

interface ReadingSummaryProps {
  readingId: string;
  reading: Reading;
  audioUrl: string;
  embedded?: boolean;
}

export function ReadingSummary({
  readingId,
  reading,
  audioUrl,
  embedded,
}: ReadingSummaryProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const descriptionEditRef = useRef<DescriptionEditDialogRef>(null);

  const { ownsMeditation } = useMyMeditations();
  const canEdit = ownsMeditation(readingId);

  const handleEditDescription = () => {
    descriptionEditRef.current?.open();
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <MeditationHeader
        meditation={reading}
        meditationId={readingId}
        audioUrl={audioUrl}
        embedded={embedded}
      />
      {(reading.coverImageUrl || reading.description) && (
        <Card className="max-w-xl2 relative mx-auto p-6 md:-mt-5">
          {reading.coverImageUrl && (
            <img
              src={reading.coverImageUrl}
              alt="Cover"
              className="mx-auto mt-2 block max-h-[500px] rounded-lg"
            />
          )}
          {reading.description && (
            <MarkdownDescription content={reading.description} />
          )}
          {reading.description && canEdit && isMounted && (
            <Button
              size="sm"
              variant="outline"
              className="backdrop-blur-xs absolute bottom-4 right-4 h-8 w-8 rounded-full bg-transparent p-0 opacity-60"
              onClick={handleEditDescription}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </Card>
      )}

      <div className="mt-8 flex justify-center">
        <Button
          size="lg"
          onClick={() => setIsDrawerOpen(true)}
          className="gap-2"
        >
          <Play className="h-5 w-5" />
          Play
        </Button>
      </div>

      <ReadingDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        script={reading}
      />

      <DescriptionEditDialog
        ref={descriptionEditRef}
        meditation={reading}
        meditationId={readingId}
      />
    </>
  );
}
