import { Card } from "@/components/ui/card";
import { Meditation } from "@/components/types";
import { cn } from "@/lib/utils";
import { MeditationPlayerCore } from "./meditation-player-core";
import { MeditationHeader } from "./meditation-header";

interface MeditationPlayerProps {
  meditation: Meditation;
  meditationId: string;
  audioUrl: string;
  className?: string;
  embedded?: boolean;
  minimal?: boolean;
}

export function MeditationPlayer({
  meditation,
  meditationId,
  audioUrl,
  className,
  embedded,
  minimal,
}: MeditationPlayerProps) {
  return (
    <>
      {minimal ? (
        <h1 className="mb-4 text-center text-2xl tracking-tight">
          {meditation.title}
        </h1>
      ) : (
        <MeditationHeader
          meditation={meditation}
          meditationId={meditationId}
          audioUrl={audioUrl}
          embedded={embedded}
        />
      )}

      <Card className={cn("p-4 sm:p-6", className)}>
        <MeditationPlayerCore meditation={meditation} audioUrl={audioUrl} />
      </Card>
    </>
  );
}
