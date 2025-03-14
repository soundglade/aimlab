import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Play, Edit, Check, Clock, Info } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

// Define types for the component props
interface RilaFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define type for the structured meditation
interface MeditationSection {
  type: string;
  title?: string;
  content?: string | never[];
  number?: number;
  duration?: number;
}

interface StructuredMeditation {
  title: string;
  sections: MeditationSection[];
}

const RilaFlowDialog = ({ open, onOpenChange }: RilaFlowDialogProps) => {
  // Reset state when dialog is closed
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset all state variables when dialog is closed
      setTimeout(() => {
        setStep(1);
        setMeditationScript("");
        setStructuredMeditation(null);
        setEditableMarkdown("");
        setProgress(0);
        setIsCompleted(false);
      }, 300); // Small delay to ensure dialog is closed before resetting state
    }
    onOpenChange(newOpen);
  };
  const [step, setStep] = useState(1);
  const [meditationScript, setMeditationScript] = useState("");
  const [structuredMeditation, setStructuredMeditation] =
    useState<StructuredMeditation | null>(null);
  const [editableMarkdown, setEditableMarkdown] = useState("");
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Sample structured meditation for preview
  const sampleStructuredMeditation: StructuredMeditation = {
    title: "Micro Meditation",
    sections: [
      {
        type: "section",
        title: "Introduction",
        content: [],
      },
      {
        type: "step",
        number: 1,
        content: "Take a deep breath in",
      },
      {
        type: "section",
        title: "Body",
        content: [],
      },
      {
        type: "step",
        number: 2,
        content: "Exhale smiling",
      },
      {
        type: "pause",
        duration: 5,
      },
      {
        type: "text",
        content:
          "Continue to breathe naturally, allowing your thoughts to come and go.",
      },
      {
        type: "pause",
        duration: 10,
      },
      {
        type: "section",
        title: "Closing",
        content: [],
      },
      {
        type: "text",
        content:
          "Slowly bring your awareness back to your surroundings. When you're ready, open your eyes.",
      },
    ],
  };

  const handleContinue = () => {
    if (step === 1) {
      setStructuredMeditation(sampleStructuredMeditation);

      const markdown =
        `# ${sampleStructuredMeditation.title}\n\n` +
        sampleStructuredMeditation.sections
          .filter((item) => item.type === "section")
          .map((section) => `## ${section.title}\n`)
          .join("\n") +
        sampleStructuredMeditation.sections
          .filter((item) => item.type !== "section")
          .map((item) => {
            if (item.type === "step") {
              return `Step ${item.number}: ${item.content}\n`;
            } else if (item.type === "pause") {
              return `PAUSE: ${item.duration} seconds\n`;
            } else {
              return `${item.content}\n`;
            }
          })
          .join("\n");

      setEditableMarkdown(markdown);
      setStep(2);
    } else if (step === 2) {
      setStep(4);
      setIsCompleted(false);

      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 5;
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(interval);
          setIsCompleted(true);
        }
      }, 500);
    }
  };

  const handleEdit = () => {
    setStep(3);
  };

  const handleApplyChanges = () => {
    // Here we would process the edited markdown
    // For this prototype, we'll just go back to the review step
    setStep(2);
  };

  const handlePlayMeditation = () => {
    // Close the dialog when user chooses to play the meditation
    // In a real implementation, this would navigate to the player
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[98vh] overflow-y-auto">
        <div className="p-1">
          <div className="bg-muted text-muted-foreground rounded-full px-4 py-2 inline-flex items-center space-x-2 mb-8">
            <span className="font-medium text-sm">Rila Experiment</span>
            <div className="flex space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  step >= 1 ? "bg-primary" : "bg-primary/30"
                }`}
              ></div>
              <div
                className={`w-2 h-2 rounded-full ${
                  step >= 2 ? "bg-primary" : "bg-primary/30"
                }`}
              ></div>
              <div
                className={`w-2 h-2 rounded-full ${
                  step >= 3 ? "bg-primary" : "bg-primary/30"
                }`}
              ></div>
              <div
                className={`w-2 h-2 rounded-full ${
                  step >= 4 ? "bg-primary" : "bg-primary/30"
                }`}
              ></div>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Create Your Meditation</h2>
                <p className="text-muted-foreground">
                  Paste your AI-generated meditation script below and choose a
                  voice for your guided meditation.
                </p>
              </div>

              <Alert>
                <AlertDescription>
                  This is an experimental public space. Any meditation you
                  create will be visible to others. Please don't include
                  personal or sensitive information.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label className="font-medium">Meditation Script</label>
                <Textarea
                  placeholder="Paste your meditation script here..."
                  className="min-h-[200px] max-h-[300px] overflow-y-auto"
                  value={meditationScript}
                  onChange={(e) => setMeditationScript(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="font-medium">Voice Selection</label>
                <div className="flex items-center space-x-2 border p-2 rounded-md bg-card">
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <span>Sarah (Default)</span>
                      <div className="text-sm text-primary">
                        More voices coming soon
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 w-8 h-8 p-0"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  className="w-full"
                  onClick={handleContinue}
                  disabled={!meditationScript.trim()}
                >
                  Continue to Review
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Review Your Meditation</h2>
                <p className="text-muted-foreground">
                  We've structured your meditation script. Review it to make
                  sure it looks good.
                </p>
              </div>

              <div className="space-y-6 bg-card border rounded-md p-4 max-h-[400px] overflow-y-auto">
                <h1 className="text-2xl font-bold">
                  # {structuredMeditation?.title || "Micro Meditation"}
                </h1>

                {structuredMeditation?.sections.map((item, index) => {
                  if (item.type === "section") {
                    return (
                      <h2 key={index} className="text-xl font-semibold mt-6">
                        {item.title}
                      </h2>
                    );
                  } else if (item.type === "step") {
                    return (
                      <p key={index} className="my-3">
                        Step {item.number}: {item.content}
                      </p>
                    );
                  } else if (item.type === "pause") {
                    return (
                      <div
                        key={index}
                        className="bg-muted text-primary rounded-md px-3 py-2 inline-flex items-center my-3"
                      >
                        <Clock className="h-4 w-4 mr-2" /> Pause:{" "}
                        {item.duration} seconds
                      </div>
                    );
                  } else {
                    return (
                      <p key={index} className="my-3">
                        {item.content}
                      </p>
                    );
                  }
                })}
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit Draft
                </Button>
                <Button className="flex-1" onClick={handleContinue}>
                  <Check className="h-4 w-4 mr-2" /> Confirm & Create
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                  Edit Your Meditation Script
                </h2>
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
                            <code>## Section</code> - Section headings
                            (Introduction, Body, Closing)
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
          )}

          {step === 4 && (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                  {isCompleted
                    ? "Meditation Created"
                    : "Creating Your Meditation"}
                </h2>
                <p className="text-muted-foreground">
                  {isCompleted
                    ? "Your meditation has been successfully generated."
                    : "We're generating your meditation. This may take a minute or two."}
                </p>
              </div>

              {!isCompleted && (
                <>
                  <Progress value={progress} className="w-full max-w-md" />
                  <p className="text-muted-foreground">
                    Generating audio segments...
                  </p>
                </>
              )}

              <div
                className={`bg-muted rounded-md p-6 max-w-md ${
                  isCompleted ? "border border-primary/30" : ""
                }`}
              >
                {!isCompleted ? (
                  <>
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-primary/40 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-primary">
                      Your meditation is being generated with AI voice
                      synthesis.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <p className="text-primary mb-4">
                      Your meditation is ready to play! Experience it now.
                    </p>
                    <Button className="w-full" onClick={handlePlayMeditation}>
                      <Play className="h-4 w-4 mr-2" /> Play Meditation
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RilaFlowDialog;
