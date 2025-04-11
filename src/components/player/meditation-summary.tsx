import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";
import { MeditationPlayerDialog } from "./meditation-player-dialog";
import ReactMarkdown from "react-markdown";
import { Meditation } from "@/components/types";
import { MeditationHeader } from "./meditation-header";

interface MeditationSummaryProps {
  meditationId: string;
  meditation: Meditation;
  audioUrl: string;
  embedded?: boolean;
}

export function MeditationSummary({
  meditationId,
  meditation,
  audioUrl,
  embedded,
}: MeditationSummaryProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <MeditationHeader
        meditation={meditation}
        meditationId={meditationId}
        audioUrl={audioUrl}
        embedded={embedded}
      />
      <Card className="max-w-xl2 mx-auto p-6 md:-mt-5">
        {meditation.coverImageUrl && (
          <img
            src={meditation.coverImageUrl}
            alt="Cover"
            className="mx-auto mt-2 block max-h-[500px] rounded-lg"
          />
        )}
        {meditation.description && (
          <div className="prose prose-headings:font-normal prose-p:leading-[1.6] prose-headings:tracking-tight dark:prose-invert text-left [&_img]:mx-auto [&_img]:mt-2 [&_img]:block [&_img]:max-h-[500px]">
            <ReactMarkdown>{meditation.description}</ReactMarkdown>
          </div>
        )}
      </Card>

      <div className="mt-8 flex justify-center">
        <Button size="lg" onClick={() => setDialogOpen(true)} className="gap-2">
          <Play className="h-5 w-5" />
          Play Meditation
        </Button>
      </div>

      <MeditationPlayerDialog
        meditationId={meditationId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        minimal={true}
      />
    </>
  );
}
