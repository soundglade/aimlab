import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Trash2 } from "lucide-react";
import { useState } from "react";
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
  // Use state to trigger re-render when a session is deleted
  const [deletedSessionIds, setDeletedSessionIds] = useState<string[]>([]);

  const savedSessions = sessionStorage.getAllSessions<{
    meditation: Meditation;
  }>();

  if (!savedSessions || Object.keys(savedSessions).length === 0) {
    return null;
  }

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // Prevent triggering the parent button's onClick
    sessionStorage.deleteSession(sessionId);
    setDeletedSessionIds([...deletedSessionIds, sessionId]);
  };

  const handleClearAllSessions = () => {
    // Use the new clearAllSessions method
    sessionStorage.clearAllSessions();
    // Update state to trigger re-render
    setDeletedSessionIds(Object.keys(savedSessions));
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">
            Your saved meditations:
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAllSessions}
            className="h-8 px-2 text-xs"
          >
            <Trash2 size={14} className="mr-1" />
            Clear all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(savedSessions).map(([id, data], index) => (
            <Button
              key={id}
              type="button"
              onClick={() => onLoadSession(id)}
              variant="outline"
              className="justify-start h-auto py-2 px-3 hover:bg-accent transition-colors group relative"
            >
              <div className="flex items-center gap-2 text-left overflow-hidden w-full">
                <Badge
                  variant="secondary"
                  className="h-6 min-w-6 flex items-center justify-center rounded-full text-xs shrink-0"
                >
                  {index + 1}
                </Badge>
                <span className="truncate">{data.meditation.title}</span>
                <button
                  type="button"
                  onClick={(e) => handleDeleteSession(e, id)}
                  className="absolute right-2 opacity-30 hover:opacity-100 hover:bg-muted rounded-full p-1 transition-all focus:outline-none"
                  aria-label="Delete meditation"
                >
                  <X size={14} className="text-muted-foreground" />
                </button>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
