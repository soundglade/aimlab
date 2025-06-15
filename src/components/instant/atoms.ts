import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";

export const languageAtom = atom<string>("en");
export const voiceIdAtom = atom<string>("instant-voiceId");
