import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";

export const voiceIdAtom = atomWithStorage<string>("instant-voiceId", "grace");
export const languageAtom = atom<string>("en");
