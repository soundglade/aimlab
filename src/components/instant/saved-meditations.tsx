import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { useMyMeditations } from "@/components/utils/use-my-meditations";
import { useRouter } from "next/router";
import { ConfirmDestructiveDialog } from "@/components/ui/confirm-destructive-dialog";
import { useState } from "react";

export default function SavedMeditations() {
  const { getSortedMeditations, deleteMeditation } = useMyMeditations();
  const router = useRouter();
  const [meditationToDelete, setMeditationToDelete] = useState<string | null>(
    null
  );

  // Get only instant meditations and split into public and private
  const instantMeditations = getSortedMeditations("instant");
  const publicMeditations = instantMeditations.filter(
    (med) => med.public === true
  );
  const privateMeditations = instantMeditations.filter(
    (med) => med.public !== true
  );

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

  // Render meditation card component
  const renderMeditationCard = (
    meditations: typeof instantMeditations,
    title: string
  ) => {
    if (meditations.length === 0) return null;

    return (
      <Card className="bg-card/50">
        <CardContent>
          <div className="mb-6">
            <h2 className="text-muted-foreground text-xl leading-tight">
              {title}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {meditations.map((meditation, index) => (
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
                    className="hover:bg-destructive hover:text-destructive-foreground absolute right-2 top-[8px] rounded-full p-1 opacity-30 transition-all hover:opacity-100 focus:outline-none"
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
    );
  };

  return (
    <div className="space-y-4">
      {renderMeditationCard(publicMeditations, "Public Meditations")}
      {renderMeditationCard(privateMeditations, "Private Meditations")}
    </div>
  );
}
