import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";
import { MeditationPlayerDialog } from "./meditation-player-dialog";
import ReactMarkdown from "react-markdown";
import { Meditation } from "@/components/types";

interface MeditationSummaryProps {
  meditationId: string;
  meditation: Meditation;
}

export function MeditationSummary({
  meditationId,
  meditation,
}: MeditationSummaryProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card className="p-6">
        <h1 className="mb-4 text-center text-2xl tracking-tight">
          {meditation.title}
        </h1>

        <div className="prose prose-sm dark:prose-invert mx-auto mb-6 max-w-none">
          {meditation.description && (
            <ReactMarkdown>{meditation.description}</ReactMarkdown>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => setDialogOpen(true)}
            className="gap-2"
          >
            <Play className="h-5 w-5" />
            Play Meditation
          </Button>
        </div>
      </Card>

      <MeditationPlayerDialog
        meditationId={meditationId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
