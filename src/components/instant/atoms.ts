import { atomWithStorage } from "jotai/utils";

export const voiceIdAtom = atomWithStorage<string>("instant-voiceId", "grace");
