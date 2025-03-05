import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Play, PenSquare, RefreshCw, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MeditationStep as MeditationStepType } from "./Rila";

export interface MeditationStepProps {
  step: MeditationStepType;
  index: number;
  isEditing: boolean;
  isSelected: boolean;
  editableText: string;
  editablePauseDuration: number;
  onEdit: () => void;
  onTextChange: (text: string) => void;
  onPauseDurationChange: (duration: number) => void;
  onBlur: () => void;
  onPreview?: () => void;
  isAudioGenerated: boolean;
  isAudioOutOfSync: boolean;
  onGenerateAudio?: () => void;
  isUILocked: boolean;
  onSelect: () => void;
}

export function MeditationStep({
  step,
  index,
  isEditing,
  isSelected,
  editableText,
  editablePauseDuration,
  onEdit,
  onTextChange,
  onPauseDurationChange,
  onBlur,
  onPreview,
  isAudioGenerated,
  isAudioOutOfSync,
  onGenerateAudio,
  isUILocked,
  onSelect,
}: MeditationStepProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine the status color for the left bar
  const getStatusColor = () => {
    if (step.type !== "speech") return "bg-transparent";
    if (isAudioOutOfSync) return "bg-amber-500";
    if (isAudioGenerated) return "bg-primary/50";
    return "bg-gray-300";
  };

  // Show action buttons on hover (desktop) or when selected (mobile)
  const showActions = (isHovered || isSelected) && !isEditing && !isUILocked;

  // Handle click on the step - only used for mobile/touch devices
  const handleClick = () => {
    if (isUILocked) return;
    onSelect();
  };

  return (
    <div
      className="relative flex mb-4 group hover:bg-muted/30 transition-colors rounded-r"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Status bar on the left */}
      <div className={`w-1 self-stretch rounded-l ${getStatusColor()}`}></div>

      {/* Main content area */}
      <div className="flex-1 px-4 py-3 rounded-r">
        {isEditing ? (
          step.type === "pause" ? (
            <div className="flex items-center gap-4">
              <Slider
                id={`pause-${index}`}
                min={1}
                max={30}
                step={1}
                value={[editablePauseDuration]}
                onValueChange={(value) => onPauseDurationChange(value[0])}
                onValueCommit={onBlur}
                className="flex-1"
                disabled={isUILocked}
              />
              <span className="w-12 text-right">{editablePauseDuration}s</span>
            </div>
          ) : step.type === "heading" ? (
            <Input
              id={`heading-${index}`}
              value={editableText}
              onChange={(e) => onTextChange(e.target.value)}
              onBlur={onBlur}
              autoFocus
              className={cn(
                "font-medium",
                step.level === 1 ? "text-xl" : "text-lg"
              )}
              disabled={isUILocked}
            />
          ) : (
            <Textarea
              id={`speech-${index}`}
              value={editableText}
              onChange={(e) => onTextChange(e.target.value)}
              onBlur={onBlur}
              autoFocus
              className="min-h-24"
              disabled={isUILocked}
            />
          )
        ) : (
          <>
            {step.type === "pause" ? (
              <div className="text-muted-foreground">
                [Pause for {step.durationMs ? step.durationMs / 1000 : 1}{" "}
                seconds]
              </div>
            ) : step.type === "heading" ? (
              <div
                className={cn(
                  "font-medium",
                  step.level === 1 ? "text-xl" : "text-lg"
                )}
              >
                {step.text}
              </div>
            ) : step.type === "speech" ? (
              <div className="whitespace-pre-wrap">{step.text}</div>
            ) : step.type === "sound" ? (
              <div className="text-muted-foreground">
                {step.soundId}
                {step.description && (
                  <span className="text-sm ml-2">({step.description})</span>
                )}
              </div>
            ) : step.type === "aside" ? (
              <div className="text-muted-foreground italic">{step.text}</div>
            ) : step.type === "direction" ? (
              <div className="text-primary">{step.text}</div>
            ) : (
              // Fallback for any other step types
              <div>Unknown step type: {(step as any).type}</div>
            )}
          </>
        )}
      </div>

      {/* Action buttons that appear on hover/select */}
      {showActions && (
        <div className="absolute right-4 top-4 flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="h-8 w-8 rounded-full bg-background shadow-sm hover:bg-muted transition"
          >
            <PenSquare className="h-4 w-4" />
          </Button>

          {/* Show play button only if audio exists */}
          {isAudioGenerated && onPreview && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              className="h-8 w-8 rounded-full bg-background shadow-sm hover:bg-muted transition"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}

          {/* Show generate/regenerate button */}
          {onGenerateAudio &&
            (step.type === "speech" || step.type === "heading") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateAudio();
                }}
                className="h-8 w-8 rounded-full bg-background shadow-sm hover:bg-muted transition"
              >
                {isAudioOutOfSync ? (
                  <RefreshCw className="h-4 w-4 text-amber-500" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            )}
        </div>
      )}
    </div>
  );
}
