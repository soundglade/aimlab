import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Play, PenSquare, RefreshCw, Plus, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { MeditationStep as MeditationStepType } from "./Rila";

// Import dropdown components from shadcn/ui
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  // Determine if edit option should be shown
  const showEditOption = !isUILocked;

  // Determine if play option should be shown
  const showPlayOption = isAudioGenerated && onPreview;

  // Determine if generate/regenerate option should be shown
  const showGenerateOption =
    onGenerateAudio && (step.type === "speech" || step.type === "heading");

  return (
    <div
      className="relative flex mb-4 group transition-colors rounded-r"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Actions dropdown menu */}
      <div
        className={cn(
          "absolute left-0 top-2 z-10",
          // On desktop: show only on hover, on mobile: always show but dimmed
          !isHovered && !isSelected ? "md:opacity-0 opacity-40" : "opacity-100",
          isEditing || isUILocked ? "hidden" : "flex"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {showEditOption && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <PenSquare className="h-4 w-4 mr-2" />
                <span>Edit</span>
              </DropdownMenuItem>
            )}

            {showPlayOption && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview!();
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                <span>Play</span>
              </DropdownMenuItem>
            )}

            {showGenerateOption && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateAudio!();
                }}
              >
                {isAudioOutOfSync ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 text-amber-500" />
                    <span>Regenerate Audio</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    <span>Generate Audio</span>
                  </>
                )}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status bar on the left */}
      <div
        className={`w-1 self-stretch rounded-l ml-9 ${getStatusColor()}`}
      ></div>

      {/* Main content area */}
      <div
        className={cn(
          "flex-1 pl-4 pr-6 py-3 rounded-r",
          isHovered ? "bg-accent/40" : "bg-transparent"
        )}
      >
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
    </div>
  );
}
