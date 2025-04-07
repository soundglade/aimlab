import { Card } from "@/components/ui/card";
import { Meditation } from "@/components/types";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { MeditationPlayerCore } from "./meditation-player-core";

// Import the action buttons component dynamically
const MeditationActionButtons = dynamic(
  () =>
    import("./meditation-action-buttons").then(
      (mod) => mod.MeditationActionButtons
    ),
  { ssr: false }
);

interface MeditationPlayerProps {
  meditation: Meditation;
  meditationId: string;
  audioUrl: string;
  className?: string;
  embedded?: boolean;
}

export function MeditationPlayer({
  meditation,
  meditationId,
  audioUrl,
  className,
  embedded,
}: MeditationPlayerProps) {
  return (
    <>
      <h1 className="text-center text-2xl tracking-tight">
        {meditation.title}
      </h1>

      <div className="mb-3 mt-1 flex justify-center md:mb-8">
        <MeditationActionButtons
          meditationId={meditationId}
          audioUrl={audioUrl}
          meditationTitle={meditation.title}
          embedded={embedded}
          meditation={meditation}
        />
      </div>

      <Card className={cn("p-4 sm:p-6", className)}>
        <MeditationPlayerCore meditation={meditation} audioUrl={audioUrl} />
      </Card>
    </>
  );
}
