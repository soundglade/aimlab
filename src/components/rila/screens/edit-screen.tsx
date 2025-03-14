import React from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Info } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { stepAtom, editableMarkdownAtom } from "../atoms";

const EditScreen = () => {
  const [, setStep] = useAtom(stepAtom);
  const [editableMarkdown, setEditableMarkdown] = useAtom(editableMarkdownAtom);

  const handleApplyChanges = () => {
    // Here we would process the edited markdown
    // For this prototype, we'll just go back to the review step
    setStep(2);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Edit Your Meditation Script</h2>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-medium">Edit Script</label>
          <HoverCard>
            <HoverCardTrigger asChild>
              <span className="text-sm text-muted-foreground flex items-center cursor-pointer">
                Markdown format <Info className="h-4 w-4 ml-1" />
              </span>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h3 className="font-medium">Markdown Guide:</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <code># Title</code> - Main title of your meditation
                  </p>
                  <p>
                    <code>## Section</code> - Section headings (Introduction,
                    Body, Closing)
                  </p>
                  <p>
                    <code>PAUSE: X seconds</code> - Add a timed pause
                  </p>
                  <p>Empty lines create new paragraphs</p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <Textarea
          className="font-mono text-sm min-h-[300px] max-h-[500px] overflow-y-auto"
          value={editableMarkdown}
          onChange={(e) => setEditableMarkdown(e.target.value)}
        />
      </div>

      <div className="pt-4">
        <Button className="w-full" onClick={handleApplyChanges}>
          <Check className="h-4 w-4 mr-2" /> Apply Changes
        </Button>
      </div>
    </div>
  );
};

export default EditScreen;
