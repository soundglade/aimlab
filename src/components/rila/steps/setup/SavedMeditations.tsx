import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Meditation } from "../../Rila";
import type { SessionStorageApi } from "@/lib/session-storage";

interface SavedMeditationsProps {
  sessionStorage: SessionStorageApi;
  onLoadSession: (sessionId: string) => void;
}

export function SavedMeditations({
  sessionStorage,
  onLoadSession,
}: SavedMeditationsProps) {
  const savedSessions = sessionStorage.getAllSessions<{
    meditation: Meditation;
  }>();

  if (!savedSessions || Object.keys(savedSessions).length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Your saved meditations:
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(savedSessions).map(([id, data], index) => (
            <Button
              key={id}
              type="button"
              onClick={() => onLoadSession(id)}
              variant="outline"
              className="justify-start h-auto py-2 px-3 hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-2 text-left overflow-hidden">
                <Badge
                  variant="secondary"
                  className="h-6 min-w-6 flex items-center justify-center rounded-full text-xs shrink-0"
                >
                  {index + 1}
                </Badge>
                <span className="truncate">{data.meditation.title}</span>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
