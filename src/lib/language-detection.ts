import { franc } from "franc-min";

// Map franc language codes (ISO 639-3) to our supported language IDs (ISO 639-1)
const FRANC_TO_LANGUAGE_MAP: Record<string, string> = {
  eng: "en", // English
  fra: "fr", // French
  spa: "es", // Spanish
  ita: "it", // Italian
  jpn: "ja", // Japanese
  cmn: "zh", // Chinese (Mandarin)
  hin: "hi", // Hindi
  por: "pt", // Portuguese
};

// Get all franc codes we support for filtering
const SUPPORTED_FRANC_CODES = Object.keys(FRANC_TO_LANGUAGE_MAP);

/**
 * Detect the language of a text string
 * @param text - The text to analyze
 * @param minLength - Minimum text length to attempt detection (default: 50)
 * @returns The detected language ID or null if not detected/supported
 */
export function detectLanguage(
  text: string,
  minLength: number = 50
): string | null {
  // Skip detection for very short text
  if (!text || text.trim().length < minLength) {
    return null;
  }

  try {
    // Use franc to detect language, restricting to our supported languages
    const detected = franc(text, {
      only: SUPPORTED_FRANC_CODES,
      minLength: Math.max(minLength, 30), // Ensure minimum length for reliability
    });

    // Return mapped language ID or null if not supported
    return FRANC_TO_LANGUAGE_MAP[detected] || null;
  } catch (error) {
    console.warn("Language detection failed:", error);
    return null;
  }
}

/**
 * Get all possible language detections with confidence scores
 * @param text - The text to analyze
 * @param minLength - Minimum text length to attempt detection
 * @returns Array of [languageId, confidence] tuples, sorted by confidence
 */
export function detectLanguageWithConfidence(
  text: string,
  minLength: number = 50
): Array<[string, number]> {
  if (!text || text.trim().length < minLength) {
    return [];
  }

  try {
    // This would require franc-all for francAll function, but franc-min doesn't have it
    // For now, we'll just return the single best detection with confidence 1
    const detected = detectLanguage(text, minLength);
    return detected ? [[detected, 1]] : [];
  } catch (error) {
    console.warn("Language detection with confidence failed:", error);
    return [];
  }
}

/**
 * Check if a language is supported for detection
 * @param languageId - The language ID to check
 * @returns Whether the language is supported
 */
export function isLanguageSupported(languageId: string): boolean {
  return Object.values(FRANC_TO_LANGUAGE_MAP).includes(languageId);
}
