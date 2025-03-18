import { useLocalStorage } from "@rehooks/local-storage";

const STORAGE_KEY = "my-meditations";

export interface SavedMeditation {
  id: string;
  title: string;
  url: string;
  ownerKey: string;
  createdAt: number;
}

export function useMyMeditations() {
  const [meditations, setMeditations] = useLocalStorage<SavedMeditation[]>(
    STORAGE_KEY,
    []
  );

  const getMeditations = () => meditations || [];

  const addMeditation = (meditation: Omit<SavedMeditation, "createdAt">) => {
    const newMeditation = {
      ...meditation,
      createdAt: Date.now(),
    };

    setMeditations([...getMeditations(), newMeditation]);
    return newMeditation;
  };

  const deleteMeditation = (id: string) => {
    const updatedMeditations = getMeditations().filter(
      (meditation) => meditation.id !== id
    );
    setMeditations(updatedMeditations);
  };

  const clearMeditations = () => {
    setMeditations([]);
  };

  const saveMeditation = (
    title: string,
    url: string,
    id: string,
    ownerKey: string
  ) => {
    return addMeditation({ id, title, url, ownerKey });
  };

  return {
    meditations: getMeditations(),
    addMeditation,
    deleteMeditation,
    clearMeditations,
    saveMeditation,
  };
}
