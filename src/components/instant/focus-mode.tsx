import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

import { gradientBackgroundClasses } from "@/components/layout/layout-component";
import { useMount, useUnmount } from "react-use";
import useBus from "use-bus";

const events = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "tap",
];

type FocusModeProps = {
  onExit: any;
  activeStep: any;
  steps: any;
  stepsForPlayer: any;
  pauseMultiplier?: number;
};

export function FocusMode({
  onExit,
  activeStep,
  steps,
  stepsForPlayer,
  pauseMultiplier = 1,
}: FocusModeProps) {
  const [displayStep, setDisplayStep] = useState(activeStep);

  useMount(() => {
    setTimeout(() => {
      events.forEach((event) =>
        window.addEventListener(event, onExit, { once: true })
      );
    }, 1000);
  });

  useUnmount(() => {
    events.forEach((event) => window.removeEventListener(event, onExit));
  });

  useBus("PLAYER_EVENT", (event) => {
    if (event.payload.type === "PLAY") {
      const playerStep = stepsForPlayer[event.payload.idx];
      if (!playerStep) return;

      const playingStepIdx = playerStep.originalIdx;
      const nextStep = (() => {
        if (playingStepIdx == null) return null;
        for (let i = playingStepIdx + 1; i < steps.length; i++) {
          if (steps[i]?.type !== "heading") return steps[i];
        }
        return null;
      })();

      if (playerStep.type == "gap") {
        setDisplayStep(nextStep);
      }

      if (playerStep.type == "pause") {
        setTimeout(() => {
          setDisplayStep(nextStep);
        }, Math.max(0, Math.round(Number(playerStep.duration ?? 0)) * 1000 - 1500));
      }
    }
  });

  useEffect(() => {
    setDisplayStep(activeStep);
  }, [activeStep?.idx]);

  const overlay = <FocusOverlay onExit={onExit} step={displayStep} />;

  if (typeof window === "undefined") return null;
  return createPortal(overlay, document.body);
}

function FocusOverlay({ onExit, step }) {
  const handleExit = (e) => {
    e.stopPropagation();
    onExit();
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center",
        "animate-[fadeIn_1.5s_forwards]",
        gradientBackgroundClasses
      )}
      onClick={handleExit}
      onMouseDown={handleExit}
      onTouchStart={handleExit}
    >
      {step && (
        <OverlayContent
          stepId={step.idx}
          stepText={step.text}
          stepType={step.type}
          stepDuration={step.duration}
        />
      )}
    </div>
  );
}

type OverlayContentProps = {
  stepId: any;
  stepText: any;
  stepType: any;
  stepDuration: any;
};

const OverlayContent = React.memo(function OverlayContent({
  stepId,
  stepText,
  stepType,
  stepDuration,
}: OverlayContentProps) {
  return (
    <div className="text-foreground max-w-2xl px-8 text-center text-2xl leading-tight md:text-3xl">
      <AnimatePresence mode="wait">
        {stepId !== null && (
          <motion.div
            key={stepId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            {stepType === "speech" ? (
              <div>{stepText}</div>
            ) : stepType === "pause" ? (
              <div className="text-muted-foreground/70 italic">
                {Math.round(Number(stepDuration ?? 0))}s pause
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
