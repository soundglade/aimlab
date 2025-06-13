import { useCallback, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { languageAtom } from "@/components/instant/atoms";
import { detectLanguage } from "@/lib/language-detection";

interface UseLanguageDetectionOptions {
  /** Minimum text length before attempting detection */
  minLength?: number;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Whether detection is enabled */
  enabled?: boolean;
}

interface UseLanguageDetectionReturn {
  /** Whether the user has manually selected a language */
  hasUserSelectedLanguage: boolean;
  /** The currently detected language (may be null) */
  detectedLanguage: string | null;
  /** Function to detect language from text */
  detectFromText: (text: string) => void;
  /** Function to mark that user has manually selected a language */
  markUserSelected: () => void;
  /** Function to reset user selection state */
  resetUserSelection: () => void;
}

/**
 * Hook for automatic language detection with user preference tracking
 */
export function useLanguageDetection(
  options: UseLanguageDetectionOptions = {}
): UseLanguageDetectionReturn {
  const { minLength = 50, debounceMs = 1000, enabled = true } = options;

  const [selectedLanguage, setSelectedLanguage] = useAtom(languageAtom);

  // Track whether user has manually selected a language
  const hasUserSelectedRef = useRef(false);
  const detectedLanguageRef = useRef<string | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced detection function
  const detectFromText = useCallback(
    (text: string) => {
      if (!enabled || hasUserSelectedRef.current) {
        return;
      }

      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout for debounced detection
      debounceTimeoutRef.current = setTimeout(() => {
        const detected = detectLanguage(text, minLength);

        if (
          detected &&
          detected !== selectedLanguage &&
          !hasUserSelectedRef.current
        ) {
          console.log(
            `Auto-detected language: ${detected} from text: "${text.substring(
              0,
              100
            )}..."`
          );
          detectedLanguageRef.current = detected;
          setSelectedLanguage(detected);
        }
      }, debounceMs);
    },
    [enabled, minLength, debounceMs, selectedLanguage, setSelectedLanguage]
  );

  // Mark that user has manually selected a language
  const markUserSelected = useCallback(() => {
    hasUserSelectedRef.current = true;
    console.log("User manually selected language, auto-detection disabled");
  }, []);

  // Reset user selection state (useful for testing or reset functionality)
  const resetUserSelection = useCallback(() => {
    hasUserSelectedRef.current = false;
    detectedLanguageRef.current = null;
    console.log("Language selection state reset, auto-detection re-enabled");
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    hasUserSelectedLanguage: hasUserSelectedRef.current,
    detectedLanguage: detectedLanguageRef.current,
    detectFromText,
    markUserSelected,
    resetUserSelection,
  };
}
