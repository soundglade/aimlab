import { atomWithStorage } from "jotai/utils";

export const voiceIdAtom = atomWithStorage<string>("instant-voiceId", "grace");
export const languageAtom = atomWithStorage<string>("instant-language", "en");
