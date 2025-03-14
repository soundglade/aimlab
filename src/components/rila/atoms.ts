import { atom } from "jotai";
import type { FormattedScript } from "@/lib/meditation-formatter";

// Define atoms for shared state
export const stepAtom = atom<number>(1);
export const meditationScriptAtom = atom<string>("");
export const structuredMeditationAtom = atom<FormattedScript | null>(null);
export const editableMarkdownAtom = atom<string>("");
export const progressAtom = atom<number>(0);
export const isCompletedAtom = atom<boolean>(false);
