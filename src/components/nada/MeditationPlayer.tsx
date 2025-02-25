import { Card } from "@/components/ui/card";
import { Meditation } from "./NadaPage";
import { FileStorageApi } from "@/lib/file-storage";

interface MeditationPlayerProps {
  meditation: Meditation;
  fileStorage: FileStorageApi;
  onBack: () => void;
}

export function MeditationPlayer({
  meditation,
  fileStorage,
  onBack,
}: MeditationPlayerProps) {
  return (
    <Card className="p-6">
      <h1 className="text-2xl font-medium text-center mb-4">
        {meditation.title}
      </h1>
      <p className="text-center text-muted-foreground">
        Meditation player will be implemented here
      </p>
    </Card>
  );
}
