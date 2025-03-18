import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, X } from "lucide-react";
import { useMyMeditations } from "./utils/use-my-meditations";
import { useRouter } from "next/router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium">Your saved meditations:</h2>
            <AlertDialog
              open={showClearAllDialog}
              onOpenChange={setShowClearAllDialog}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs"
                >
                  <Trash2 size={14} className="mr-1" />
                  Clear all
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all meditations</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure? This will remove all your saved meditations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleConfirmClearAll}
                  >
                    Clear all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {meditations.map((meditation, index) => (
              <Button
                key={meditation.id}
                type="button"
                variant="outline"
                className="justify-start h-auto py-2 px-3 hover:bg-accent transition-colors group relative"
                onClick={() => handleMeditationClick(meditation.url)}
              >
                <div className="flex items-center gap-2 text-left overflow-hidden w-full">
                  <Badge
                    variant="secondary"
                    className="h-6 min-w-6 flex items-center justify-center rounded-full text-xs shrink-0"
                  >
                    {index + 1}
                  </Badge>
                  <span className="truncate">{meditation.title}</span>
                  <AlertDialog
                    open={meditationToDelete === meditation.id}
                    onOpenChange={(open) => {
                      if (!open) setMeditationToDelete(null);
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMeditationToDelete(meditation.id);
                        }}
                        className="absolute right-2 opacity-30 hover:opacity-100 hover:bg-muted rounded-full p-1 transition-all focus:outline-none"
                        aria-label="Delete meditation"
                      >
                        <X size={14} className="text-muted-foreground" />
                      </a>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete meditation</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{meditation.title}"?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={handleConfirmDelete}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
