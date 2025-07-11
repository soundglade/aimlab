import { Meditation } from "@/components/types";
import { cn } from "@/lib/utils";
import { MeditationActionButtons } from "./meditation-action-buttons";

interface MeditationHeaderProps {
  meditation: Meditation;
  meditationId: string;
  audioUrl: string;
  embedded?: boolean;
}

export function MeditationHeader({
  meditation,
  meditationId,
  audioUrl,
  embedded,
}: MeditationHeaderProps) {
  return (
    <>
      <h1 className="text-center text-2xl tracking-tight">
        {meditation.title}
      </h1>

      <div
        className={cn(
          " mt-1 flex justify-center",
          embedded ? "mb-3" : "mb-3 md:mb-8"
        )}
      >
        <MeditationActionButtons
          meditationId={meditationId}
          audioUrl={audioUrl}
          meditationTitle={meditation.title}
          embedded={embedded}
          meditation={meditation}
        />
      </div>
    </>
  );
}
