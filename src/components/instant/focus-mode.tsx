import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

import { gradientBackgroundClasses } from "@/components/layout/layout-component";
import { ReadingStep } from "../types";

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

export function FocusMode({ visible, onExit, activeStep }) {
  useEffect(() => {
    if (!visible) return;
    let timeoutId;
    let cleanup = () => {};
    timeoutId = setTimeout(() => {
      const exitOnActivity = () => onExit();
      const events = [
        "mousemove",
        "mousedown",
        "keydown",
        "scroll",
        "touchstart",
        "tap",
      ];
      events.forEach((event) =>
        window.addEventListener(event, exitOnActivity, { once: true })
      );
      cleanup = () => {
        events.forEach((event) =>
          window.removeEventListener(event, exitOnActivity)
        );
      };
    }, 1000);
    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [visible, onExit]);

  const overlay = (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-[1.5s]",
        gradientBackgroundClasses,
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-hidden={!visible}
    >
      <div className="text-foreground max-w-2xl px-8 text-center text-2xl leading-tight md:text-3xl">
        {renderStep(activeStep)}
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(overlay, document.body);
}
