import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Play, PenSquare, RefreshCw, AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";
import { MeditationStep as MeditationStepType } from "../Rila";
import { useAtomValue } from "jotai";
import {
  isUILockedAtom,
  editingStepIndexAtom,
  selectedStepIndexAtom,
  editableTextsAtom,
  editablePauseDurationsAtom,
} from "../MeditationWorkspace";

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
  onEdit: () => void;
  onTextChange: (text: string) => void;
  onPauseDurationChange: (duration: number) => void;
  onBlur: () => void;
  onPreview?: () => void;
  isAudioGenerated: boolean;
  isAudioOutOfSync: boolean;
  onGenerateAudio?: () => void;
  onSelect: () => void;
}

export function MeditationStep({
  step,
  index,
  onEdit,
  onTextChange,
  onPauseDurationChange,
  onBlur,
  onPreview,
  isAudioGenerated,
  isAudioOutOfSync,
  onGenerateAudio,
  onSelect,
}: MeditationStepProps) {
  // Use atoms instead of props
  const isUILocked = useAtomValue(isUILockedAtom);
  const editingStepIndex = useAtomValue(editingStepIndexAtom);
  const selectedStepIndex = useAtomValue(selectedStepIndexAtom);
  const editableTexts = useAtomValue(editableTextsAtom);
  const editablePauseDurations = useAtomValue(editablePauseDurationsAtom);

  // Derive values from atoms
  const isEditing = editingStepIndex === index;
  const isSelected = selectedStepIndex === index;
  const editableText = editableTexts[index] || "";
  const editablePauseDuration = editablePauseDurations[index] || 1;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  // Determine the status color for the left bar
  const getStatusColor = () => {
    if (step.type !== "speech") return "bg-transparent";
    if (isAudioOutOfSync) return "bg-amber-500";
    if (isAudioGenerated) return "bg-primary/60";
    return "bg-gray-200";
  };

  // Handle click on the step
  const handleClick = (e: React.MouseEvent) => {
    if (isUILocked || isEditing) return;

    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();

    // Select the step
    onSelect();

    // Store click position for dropdown positioning
    setDropdownPosition({ x: e.clientX, y: e.clientY });

    // Open the dropdown
    setDropdownOpen(true);
  };

  // Determine if edit option should be shown
  const showEditOption = !isUILocked;

  // Determine if play option should be shown
  const showPlayOption = isAudioGenerated && onPreview;

  const showGenerateOption =
    onGenerateAudio &&
    (step.type === "speech" || step.type === "heading") &&
    !isAudioGenerated;

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger className="hidden" />
        <DropdownMenuContent
          align="start"
          style={{
            position: "fixed",
            top: `${dropdownPosition.y}px`,
            left: `${dropdownPosition.x}px`,
          }}
          forceMount
        >
          {showPlayOption && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onPreview!();
                setDropdownOpen(false);
              }}
            >
              <Play className="h-4 w-4 mr-2" />
              <span>Play</span>
            </DropdownMenuItem>
          )}

          {showEditOption && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
                setDropdownOpen(false);
              }}
            >
              <PenSquare className="h-4 w-4 mr-2" />
              <span>Edit</span>
            </DropdownMenuItem>
          )}

          {showGenerateOption && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onGenerateAudio!();
                setDropdownOpen(false);
              }}
            >
              {isAudioOutOfSync ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 text-amber-500" />
                  <span>Regenerate</span>
                </>
              ) : (
                <>
                  <AudioLines className="h-4 w-4 mr-2" />
                  <span>Generate</span>
                </>
              )}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Main component */}
      <div
        className={cn(
          "relative flex mb-4 group transition-colors rounded-r cursor-pointer",
          isEditing && "cursor-default"
        )}
        onMouseEnter={() => onSelect()}
        onClick={handleClick}
      >
        {/* Status bar on the left */}
        <div className={`w-1 self-stretch rounded-l ${getStatusColor()}`}></div>

        {/* Main content area */}
        <div
          className={cn(
            "flex-1 pl-4 pr-6 py-3 rounded-r",
            isSelected
              ? isAudioGenerated
                ? "bg-accent/40"
                : "bg-gray-200/40"
              : "bg-transparent"
          )}
        >
          {isEditing ? (
            step.type === "pause" ? (
              <div
                className="flex items-center gap-4"
                onClick={(e) => e.stopPropagation()}
              >
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
                <span className="w-12 text-right">
                  {editablePauseDuration}s
                </span>
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
                onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => e.stopPropagation()}
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
    </>
  );
}
