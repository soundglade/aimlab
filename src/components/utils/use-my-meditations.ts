import { useLocalStorage } from "@rehooks/local-storage";
import * as cookie from "cookie";

const STORAGE_KEY = "my-meditations";

// Cookie utilities
const setCookie = (name: string, value: string) => {
  const cookieString = cookie.serialize(name, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  document.cookie = cookieString;
};

const deleteCookie = (name: string) => {
  const cookieString = cookie.serialize(name, "", {
    path: "/",
    maxAge: 0,
  });
  document.cookie = cookieString;
};

export interface SavedMeditation {
  id: string;
  title: string;
  url: string;
  ownerKey: string;
  createdAt: number;
  public?: boolean;
  type?: string; // "studio" | "instant" - optional for backward compatibility
}

// Helper function to filter meditations by type
const filterMeditationsByType = (
  meditations: SavedMeditation[],
  type?: string
) => {
  if (!type) return meditations;
  return meditations.filter(
    (med) => med.type === type || (!med.type && type === "studio")
  );
};

export function useMyMeditations() {
  const [meditations, setMeditations] = useLocalStorage<SavedMeditation[]>(
    STORAGE_KEY,
    []
  );

  const getMeditations = () => meditations || [];

  const getSortedMeditations = (type?: string) => {
    return filterMeditationsByType(getMeditations(), type).sort(
      (a, b) => b.createdAt - a.createdAt
    );
  };

  const addMeditation = (meditation: Omit<SavedMeditation, "createdAt">) => {
    const newMeditation = {
      ...meditation,
      createdAt: Date.now(),
    };

    setMeditations([...getMeditations(), newMeditation]);

    // Set cookie for server-side access
    setCookie(
      `meditation-ownerKey-${newMeditation.id}`,
      newMeditation.ownerKey
    );

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

    // Delete cookie
    deleteCookie(`meditation-ownerKey-${id}`);

    // Update local storage regardless of API success
    const updatedMeditations = getMeditations().filter(
      (meditation) => meditation.id !== id
    );
    setMeditations(updatedMeditations);
  };

  const hideMeditation = async (id: string) => {
    // Find the meditation to get the ownerKey
    const meditation = getMeditations().find((med) => med.id === id);

    if (!meditation?.ownerKey) {
      throw new Error("Unable to hide: missing ownership information");
    }

    try {
      // Call the API to hide the meditation
      const response = await fetch("/api/hide-meditation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          readingId: id,
          ownerKey: meditation.ownerKey,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to hide meditation");
      }

      // Update local storage to mark meditation as private
      const updatedMeditations = getMeditations().map((med) =>
        med.id === id ? { ...med, public: false } : med
      );
      setMeditations(updatedMeditations);

      return data;
    } catch (error) {
      console.error("Error hiding meditation:", error);
      throw error;
    }
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

  const clearMeditations = async (type?: string) => {
    const currentMeditations = getMeditations();
    const meditationsToDelete = filterMeditationsByType(
      currentMeditations,
      type
    );

    for (const meditation of meditationsToDelete) {
      await deleteMeditation(meditation.id);
    }

    const remainingMeditations = currentMeditations.filter(
      (med) => !meditationsToDelete.includes(med)
    );

    setMeditations(remainingMeditations);
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

  const saveInstantMeditation = async (
    readingId: string,
    isPublic: boolean = false
  ) => {
    try {
      const response = await fetch("/api/save-instant-meditation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          readingId,
          public: isPublic,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to save meditation");
      }

      // Add to local storage
      const savedMeditation = addMeditation({
        id: readingId,
        title: data.title,
        url: data.url,
        ownerKey: data.ownerKey,
        public: isPublic,
        type: "instant",
      });

      return {
        success: true,
        meditation: savedMeditation,
        url: data.url,
        title: data.title,
      };
    } catch (error) {
      console.error("Error saving instant meditation:", error);
      throw error;
    }
  };

  const shareInstantMeditation = async (readingId: string) => {
    // Find the meditation to get the ownerKey
    const meditation = getMeditations().find((med) => med.id === readingId);

    if (!meditation?.ownerKey) {
      throw new Error("Unable to share: missing ownership information");
    }

    try {
      const response = await fetch("/api/share-meditation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          readingId,
          ownerKey: meditation.ownerKey,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to share meditation");
      }

      // Update local storage to mark meditation as public
      const updatedMeditations = getMeditations().map((med) =>
        med.id === readingId ? { ...med, public: true } : med
      );
      setMeditations(updatedMeditations);

      return {
        success: true,
        url: data.url,
      };
    } catch (error) {
      console.error("Error sharing meditation:", error);
      throw error;
    }
  };

  return {
    meditations: getSortedMeditations("studio"),
    addMeditation,
    deleteMeditation,
    hideMeditation,
    editMeditationTitle,
    editMeditationDescription,
    clearMeditations,
    saveMeditation,
    ownsMeditation,
    editMeditationCoverImage,
    getSortedMeditations, // Export this for type filtering
    saveInstantMeditation,
    shareInstantMeditation,
  };
}
