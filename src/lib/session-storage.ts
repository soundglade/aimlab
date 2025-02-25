interface StoredSession<T> {
  data: T;
  createdAt: number;
}

export interface SessionStorageApi {
  generateId: () => string;
  saveSession: <T>(id: string, data: T) => void;
  getSession: <T>(id: string) => T | null;
  getAllSessions: <T>() => Record<string, T> | null;
  replaceSessionIfExists: <T>(
    id: string | undefined,
    modifier: (data: T) => T
  ) => void;
  updateSessionIfExists: <T>(
    id: string | undefined,
    updates: Partial<T>
  ) => void;
  deleteSession: (id: string) => void;
  cleanupOldSessions: (maxAgeDays?: number) => void;
  isEphemeral: () => boolean;
}

export interface StorageOptions {
  ephemeral?: boolean;
}

export function initializeStorage(
  key: string,
  options?: StorageOptions
): SessionStorageApi {
  const storageKey = `${key}_sessions`;
  const ephemeral = options?.ephemeral ?? false;

  // In-memory storage for ephemeral mode
  let memoryStorage: Record<string, StoredSession<unknown>> = {};

  /**
   * Generates a unique session ID combining timestamp and random characters
   */
  function generateId(): string {
    return `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .substring(2, 7)}`;
  }

  /**
   * Retrieves all sessions from the appropriate storage
   */
  function getSessions<T>(): Record<string, StoredSession<T>> {
    if (ephemeral) {
      return memoryStorage as Record<string, StoredSession<T>>;
    }

    try {
      const sessionsStr = localStorage.getItem(storageKey);
      return sessionsStr
        ? (JSON.parse(sessionsStr) as Record<string, StoredSession<T>>)
        : {};
    } catch (error) {
      console.error("Error reading sessions from localStorage:", error);
      return {};
    }
  }

  /**
   * Persists sessions to the appropriate storage
   */
  function persistSessions(
    sessions: Record<string, StoredSession<unknown>>
  ): void {
    if (ephemeral) {
      memoryStorage = sessions;
    } else {
      localStorage.setItem(storageKey, JSON.stringify(sessions));
    }
  }

  function saveSession<T>(id: string, data: T): void {
    const sessions = getSessions<T>();
    sessions[id] = {
      data,
      createdAt: Date.now(),
    };

    persistSessions(sessions as Record<string, StoredSession<unknown>>);
  }

  function getSession<T>(id: string): T | null {
    const sessions = getSessions<T>();
    const session = sessions[id];
    return session ? session.data : null;
  }

  function getAllSessions<T>(): Record<string, T> | null {
    try {
      const sessions = getSessions<T>();
      if (Object.keys(sessions).length === 0) {
        return null;
      }

      // Convert StoredSession<T> to T while preserving createdAt
      return Object.fromEntries(
        Object.entries(sessions).map(([id, session]) => [
          id,
          // Add createdAt to the returned data for informational purposes
          {
            ...(session.data as object),
            createdAt: session.createdAt,
          } as unknown as T,
        ])
      );
    } catch (error) {
      console.error("Error getting all sessions:", error);
      return null;
    }
  }

  function replaceSessionIfExists<T>(
    id: string | undefined,
    modifier: (data: T) => T
  ): void {
    if (!id) return;

    const currentData = getSession<T>(id);
    if (currentData !== null) {
      saveSession(id, modifier(currentData));
    }
  }

  function updateSessionIfExists<T>(
    id: string | undefined,
    updates: Partial<T>
  ): void {
    if (!id) return;

    replaceSessionIfExists<T>(id, (currentData) => ({
      ...currentData,
      ...updates,
    }));
  }

  function deleteSession(id: string): void {
    const sessions = getSessions<unknown>();

    if (!sessions[id]) return;

    delete sessions[id];
    persistSessions(sessions);
  }

  function cleanupOldSessions(maxAgeDays: number = 7): void {
    const sessions = getSessions<unknown>();
    const now = Date.now();
    const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;

    const updatedSessions = Object.fromEntries(
      Object.entries(sessions).filter(
        ([_, session]) => now - session.createdAt <= maxAge
      )
    );

    persistSessions(updatedSessions);
  }

  function isEphemeral(): boolean {
    return ephemeral;
  }

  return {
    generateId,
    saveSession,
    getSession,
    getAllSessions,
    replaceSessionIfExists,
    updateSessionIfExists,
    deleteSession,
    cleanupOldSessions,
    isEphemeral,
  };
}
