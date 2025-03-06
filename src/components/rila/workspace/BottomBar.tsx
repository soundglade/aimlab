import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import { Meditation } from "../Rila";

interface BottomBarProps {
  meditation: Meditation;
  isPlaying: boolean;
  currentTimeMs: number;
  isUILocked: boolean;
  onTogglePlayback: () => void;
}

export function BottomBar({
  meditation,
  isPlaying,
  currentTimeMs,
  isUILocked,
  onTogglePlayback,
}: BottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 py-3 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="flex h-14 items-center justify-center">
          <div className="w-full max-w-md">
            <div className="flex flex-col space-y-2">
              <Progress
                value={
                  (currentTimeMs /
                    (meditation.timeline?.totalDurationMs || 1)) *
                  100
                }
                className="h-1.5"
              />

              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="icon" disabled={isUILocked}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  className="p-5"
                  onClick={onTogglePlayback}
                  disabled={isUILocked}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>

                <Button variant="outline" size="icon" disabled={isUILocked}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
