import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";
import { MeditationPlayerDialog } from "./meditation-player-dialog";
import { Reading } from "@/components/types";
import { MeditationHeader } from "./meditation-header";
import { MarkdownDescription } from "@/components/ui/markdown-description";

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
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <MeditationHeader
        meditation={reading}
        meditationId={readingId}
        audioUrl={audioUrl}
        embedded={embedded}
      />
      <Card className="max-w-xl2 mx-auto p-6 md:-mt-5">
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
      </Card>

      <div className="mt-8 flex justify-center">
        <Button size="lg" onClick={() => setDialogOpen(true)} className="gap-2">
          <Play className="h-5 w-5" />
          Play Meditation
        </Button>
      </div>

      <MeditationPlayerDialog
        meditationId={readingId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        minimal={true}
      />
    </>
  );
}
