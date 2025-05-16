import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

import { gradientBackgroundClasses } from "@/components/layout/layout-component";
import { ReadingStep } from "../types";
import { useMount, useUnmount } from "react-use";
import useBus from "use-bus";

const renderStep = (step: ReadingStep | undefined) => {
  if (!step) return null;
  if (step.type === "speech") return <div>{step.text}</div>;
  if (step.type === "pause")
    return (
      <div className="text-muted-foreground/70 italic">
        {step.duration}s pause
      </div>
    );
  return null;
};

const events = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "tap",
];

export function FocusMode({ onExit, activeStep }) {
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
    console.log("FocusMode received PLAYER_EVENT:", event.payload);
  });

  const handleExit = (e) => {
    e.stopPropagation();
    onExit();
  };

  const overlay = (
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
      <div className="text-foreground max-w-2xl px-8 text-center text-2xl leading-tight md:text-3xl">
        <AnimatePresence mode="wait">
          {activeStep && (
            <motion.div
              key={activeStep.id || activeStep.text || activeStep.type}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
            >
              {renderStep(activeStep)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(overlay, document.body);
}
