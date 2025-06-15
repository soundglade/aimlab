import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";

export const languageAtom = atom<string>("en");
export const voiceIdAtom = atomWithStorage<string>("instantp-voiceId", "kate");
