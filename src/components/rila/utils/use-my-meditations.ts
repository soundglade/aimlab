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

  const deleteMeditation = async (id: string) => {
    // Find the meditation to get the ownerKey
    const meditation = getMeditations().find((med) => med.id === id);

    if (meditation) {
      try {
        // Call the API to delete the meditation
        const response = await fetch("/api/delete-meditation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meditationId: id,
            ownerKey: meditation.ownerKey,
          }),
        });

        if (!response.ok) {
          console.error("Failed to delete meditation from server");
        }
      } catch (error) {
        console.error("Error deleting meditation:", error);
      }
    }

    // Update local storage regardless of API success
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
