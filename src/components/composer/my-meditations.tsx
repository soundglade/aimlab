import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, X } from "lucide-react";
import { useMyMeditations } from "@/components/utils/use-my-meditations";
import { useRouter } from "next/router";
import { ConfirmDestructiveDialog } from "@/components/ui/confirm-destructive-dialog";
import { useState } from "react";

export default function MyMeditations() {
  const { meditations, deleteMeditation, clearMeditations } =
    useMyMeditations();
  const router = useRouter();
  const [meditationToDelete, setMeditationToDelete] = useState<string | null>(
    null
  );
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);

  // If there are no meditations, don't render anything
  if (meditations.length === 0) {
    return null;
  }

  // Handle click on a meditation button
  const handleMeditationClick = (url: string) => {
    router.push(url);
  };

  // Handle confirming deletion of a single meditation
  const handleConfirmDelete = () => {
    if (meditationToDelete) {
      deleteMeditation(meditationToDelete);
      setMeditationToDelete(null);
    }
  };

  // Handle confirming clearing all meditations
  const handleConfirmClearAll = () => {
    clearMeditations();
    setShowClearAllDialog(false);
  };

  return (
    <div className="mb-12">
      <Card>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium">Saved meditations:</h2>
            <ConfirmDestructiveDialog
              open={showClearAllDialog}
              onOpenChange={setShowClearAllDialog}
              title="Clear all meditations"
              description="Are you sure? This will remove all your saved meditations."
              confirmText="Clear all"
              onConfirm={handleConfirmClearAll}
            >
              <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                <Trash2 size={14} className="mr-1" />
                Clear all
              </Button>
            </ConfirmDestructiveDialog>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {meditations.map((meditation, index) => (
              <div key={meditation.id} className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="hover:bg-accent group h-auto w-full justify-start px-3 py-2 transition-colors"
                  onClick={() => handleMeditationClick(meditation.url)}
                >
                  <div className="flex w-full items-center gap-2 overflow-hidden text-left">
                    <Badge
                      variant="secondary"
                      className="min-w-6 flex h-6 shrink-0 items-center justify-center rounded-full text-xs"
                    >
                      {index + 1}
                    </Badge>
                    <span className="truncate">{meditation.title}</span>
                  </div>
                </Button>
                <ConfirmDestructiveDialog
                  open={meditationToDelete === meditation.id}
                  onOpenChange={(open) => {
                    if (!open) setMeditationToDelete(null);
                  }}
                  title="Delete meditation"
                  description={`Are you sure you want to delete "${meditation.title}"?`}
                  confirmText="Delete"
                  onConfirm={handleConfirmDelete}
                >
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMeditationToDelete(meditation.id);
                    }}
                    className="hover:bg-destructive hover:text-destructive-foreground absolute right-2 top-[10px] rounded-full p-1 opacity-30 transition-all hover:opacity-100 focus:outline-none"
                    aria-label="Delete meditation"
                  >
                    <X size={14} />
                  </a>
                </ConfirmDestructiveDialog>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
