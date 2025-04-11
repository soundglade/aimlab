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

  const getSortedMeditations = () => {
    return getMeditations().sort((a, b) => b.createdAt - a.createdAt);
  };

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

  const editMeditationTitle = async (id: string, newTitle: string) => {
    // Find the meditation to get the ownerKey
    const meditation = getMeditations().find((med) => med.id === id);

    if (meditation) {
      try {
        // Call the API to edit the meditation title
        const response = await fetch("/api/edit-meditation-title", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meditationId: id,
            ownerKey: meditation.ownerKey,
            newTitle,
          }),
        });

        if (!response.ok) {
          console.error("Failed to update meditation title on server");
          return false;
        }
      } catch (error) {
        console.error("Error updating meditation title:", error);
        return false;
      }

      // Update local storage with the new title
      const updatedMeditations = getMeditations().map((med) =>
        med.id === id ? { ...med, title: newTitle } : med
      );
      setMeditations(updatedMeditations);
      return true;
    }
    return false;
  };

  const editMeditationDescription = async (
    id: string,
    description: string | null
  ) => {
    // Find the meditation to get the ownerKey
    const meditation = getMeditations().find((med) => med.id === id);

    if (meditation) {
      try {
        // Call the API to edit the meditation description
        const response = await fetch("/api/edit-meditation-description", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meditationId: id,
            ownerKey: meditation.ownerKey,
            description,
          }),
        });

        if (!response.ok) {
          console.error("Failed to update meditation description on server");
          return false;
        }
      } catch (error) {
        console.error("Error updating meditation description:", error);
        return false;
      }

      return true;
    }
    return false;
  };

  const editMeditationCoverImage = async (
    id: string,
    coverImageUrl: string
  ) => {
    // Find the meditation to get the ownerKey
    const meditation = getMeditations().find((med) => med.id === id);

    if (meditation) {
      try {
        // Call the API to edit the meditation cover image
        const response = await fetch("/api/edit-meditation-cover-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meditationId: id,
            ownerKey: meditation.ownerKey,
            coverImageUrl,
          }),
        });

        if (!response.ok) {
          console.error("Failed to update meditation cover image on server");
          return false;
        }
      } catch (error) {
        console.error("Error updating meditation cover image:", error);
        return false;
      }

      // Optionally update local storage if you want to cache the cover image locally
      // const updatedMeditations = getMeditations().map((med) =>
      //   med.id === id ? { ...med, coverImageUrl } : med
      // );
      // setMeditations(updatedMeditations);

      return true;
    }
    return false;
  };

  const clearMeditations = async () => {
    const currentMeditationsIds = getMeditations().map((med) => med.id);

    for (const meditationId of currentMeditationsIds) {
      await deleteMeditation(meditationId);
    }

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

  const ownsMeditation = (id: string): boolean => {
    return getMeditations().some((meditation) => meditation.id === id);
  };

  return {
    meditations: getSortedMeditations(),
    addMeditation,
    deleteMeditation,
    editMeditationTitle,
    editMeditationDescription,
    clearMeditations,
    saveMeditation,
    ownsMeditation,
    editMeditationCoverImage,
  };
}
