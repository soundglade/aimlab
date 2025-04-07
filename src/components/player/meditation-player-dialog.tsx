import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MeditationPlayer } from "./meditation-player";

interface MeditationPlayerDialogProps {
  meditationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  minimal?: boolean;
}

interface MeditationData {
  meditationId: string;
  metadata: any;
  audioUrl: string;
  error?: string;
}

export function MeditationPlayerDialog({
  meditationId,
  open,
  onOpenChange,
  minimal = false,
}: MeditationPlayerDialogProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meditationData, setMeditationData] = useState<MeditationData | null>(
    null
  );

  useEffect(() => {
    if (!open || !meditationId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/fetch-meditation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: meditationId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch meditation: ${response.statusText}`);
        }

        const data = await response.json();
        setMeditationData(data);
      } catch (err) {
        console.error("Error fetching meditation data:", err);
        setError("Failed to load meditation. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [meditationId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
        {loading && (
          <div className="flex flex-col items-center justify-center p-12">
            <p className="text-muted-foreground">Loading meditation...</p>
          </div>
        )}

        {error && (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {!loading &&
          !error &&
          meditationData &&
          meditationData.metadata &&
          meditationData.audioUrl && (
            <div className="mx-auto max-w-3xl">
              <MeditationPlayer
                meditation={meditationData.metadata}
                meditationId={meditationData.meditationId}
                audioUrl={meditationData.audioUrl}
                embedded={true}
                minimal={minimal}
              />
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
}
