import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, X } from "lucide-react";
import { useMyMeditations } from "./utils/use-my-meditations";
import { useRouter } from "next/router";

export default function MyMeditations() {
  const { meditations, deleteMeditation, clearMeditations } =
    useMyMeditations();
  const router = useRouter();

  // If there are no meditations, don't render anything
  if (meditations.length === 0) {
    return null;
  }

  // Handle click on a meditation button
  const handleMeditationClick = (url: string) => {
    router.push(url);
  };

  return (
    <div className="mb-12">
      <Card>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium">Your saved meditations:</h2>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={clearMeditations}
            >
              <Trash2 size={14} className="mr-1" />
              Clear all
            </Button>
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
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteMeditation(meditation.id);
                    }}
                    className="absolute right-2 opacity-30 hover:opacity-100 hover:bg-muted rounded-full p-1 transition-all focus:outline-none"
                    aria-label="Delete meditation"
                  >
                    <X size={14} className="text-muted-foreground" />
                  </a>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
