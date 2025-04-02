import { getDefaultStore } from "jotai";
import { atomWithReset, atomWithStorage, RESET } from "jotai/utils";
import type { Meditation } from "../types";

// Define atoms for shared state using atomWithReset for resettable atoms
export const stepAtom = atomWithReset<number>(1);
export const meditationScriptAtom = atomWithReset<string>("");
export const structuredMeditationAtom = atomWithReset<Meditation | null>(null);
export const editableMarkdownAtom = atomWithReset<string>("");
export const progressAtom = atomWithReset<number>(0);
export const isCompletedAtom = atomWithReset<boolean>(false);
export const meditationUrlAtom = atomWithReset<string | null>(null);
export const voiceIdAtom = atomWithStorage<string>("voiceId", "drew");

/**
 * Resets all atoms to their default values
 */
export const resetAtoms = () => {
  const store = getDefaultStore();
  store.set(stepAtom, RESET);
  store.set(meditationScriptAtom, RESET);
  store.set(structuredMeditationAtom, RESET);
  store.set(editableMarkdownAtom, RESET);
  store.set(progressAtom, RESET);
  store.set(isCompletedAtom, RESET);
  store.set(meditationUrlAtom, RESET);
};
