import { useRef, useEffect, useState } from "react";

/**
 * useUserInactivity
 * Returns true if the user has been inactive for at least the given threshold (in ms).
 * @param thresholdMs Number of milliseconds of inactivity required to be considered inactive
 */
export function useUserInactivity(thresholdMs: number): boolean {
  const [inactive, setInactive] = useState(false);
  const lastInteractionRef = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateInteraction = () => {
      lastInteractionRef.current = Date.now();
      setInactive(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setInactive(true);
      }, thresholdMs);
    };

    // Set up listeners
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) =>
      window.addEventListener(event, updateInteraction, true)
    );

    // Start the timer on mount
    updateInteraction();

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, updateInteraction, true)
      );
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [thresholdMs]);

  return inactive;
}
