import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export function FocusMode({ content, visible, onExit }) {
  useEffect(() => {
    if (!visible) return;
    const exitOnActivity = () => onExit();
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) =>
      window.addEventListener(event, exitOnActivity, { once: true })
    );
    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, exitOnActivity)
      );
    };
  }, [visible, onExit]);

  const overlay = (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-1000",
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-hidden={!visible}
    >
      <div className="text-foreground max-w-2xl px-8 text-center text-2xl font-medium md:text-3xl">
        {content}
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(overlay, document.body);
}
