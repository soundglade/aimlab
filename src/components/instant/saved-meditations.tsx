import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, X } from "lucide-react";
import { useMyMeditations } from "@/components/utils/use-my-meditations";
import { useRouter } from "next/router";
import { ConfirmDestructiveDialog } from "@/components/ui/confirm-destructive-dialog";
import { useState } from "react";

export default function SavedMeditations() {
  const { getSortedMeditations, deleteMeditation, clearMeditations } =
    useMyMeditations();
  const router = useRouter();
  const [meditationToDelete, setMeditationToDelete] = useState<string | null>(
    null
  );
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);

  // Get only instant meditations
  const instantMeditations = getSortedMeditations("instant");

  // If there are no instant meditations, don't render anything
  if (instantMeditations.length === 0) {
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

  // Handle confirming clearing all instant meditations
  const handleConfirmClearAll = () => {
    clearMeditations("instant");
    setShowClearAllDialog(false);
  };

  return (
    <div>
      <Card className="bg-card/50">
        <CardContent>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-muted-foreground text-xl leading-tight">
              Saved Meditations
            </h2>
            <ConfirmDestructiveDialog
              open={showClearAllDialog}
              onOpenChange={setShowClearAllDialog}
              title="Clear all saved meditations"
              description="Are you sure? This will remove all your saved instant meditations."
              confirmText="Clear all"
              onConfirm={handleConfirmClearAll}
            >
              <Button
                variant="outline"
                size="sm"
                className="-mt-1 mr-1 h-8 border-none px-2 text-xs"
              >
                <Trash2 size={14} className="mr-1" />
                Clear all
              </Button>
            </ConfirmDestructiveDialog>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {instantMeditations.map((meditation, index) => (
              <div key={meditation.id} className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="hover:bg-accent group h-auto w-full justify-start border-none px-3 py-2 shadow-none transition-colors"
                  onClick={() => handleMeditationClick(meditation.url)}
                >
                  <div className="mr-5 flex w-full items-center gap-2 overflow-hidden text-left font-normal">
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
