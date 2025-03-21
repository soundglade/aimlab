import { atom } from "jotai";
import type { Meditation } from "./types";

// Define atoms for shared state
export const stepAtom = atom<number>(1);
export const meditationScriptAtom = atom<string>("");
export const structuredMeditationAtom = atom<Meditation | null>(null);
export const editableMarkdownAtom = atom<string>("");
export const progressAtom = atom<number>(0);
export const isCompletedAtom = atom<boolean>(false);
export const meditationUrlAtom = atom<string | null>(null);
