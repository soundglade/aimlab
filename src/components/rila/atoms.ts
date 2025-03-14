import { atom } from "jotai";
import { StructuredMeditation } from "./types";

// Define atoms for shared state
export const stepAtom = atom<number>(1);
export const meditationScriptAtom = atom<string>("");
export const structuredMeditationAtom = atom<StructuredMeditation | null>(null);
export const editableMarkdownAtom = atom<string>("");
export const progressAtom = atom<number>(0);
export const isCompletedAtom = atom<boolean>(false);
