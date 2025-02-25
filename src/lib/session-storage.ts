interface StoredSession<T> {
  data: T;
  createdAt: number;
}

interface SessionStorageApi {
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
}

export function initializeStorage(key: string): SessionStorageApi {
  const storageKey = `${key}_sessions`;

  function generateId(): string {
    return `${Date.now().toString(36)}${Math.random()
      .toString(36)
      .substring(2, 7)}`;
  }

  function getSessions<T>(): Record<string, StoredSession<T>> {
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

  function saveSession<T>(id: string, data: T): void {
    const sessions = getSessions<T>();
    sessions[id] = {
      data,
      createdAt: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(sessions));
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

      // Convert StoredSession<T> to T with added createdAt
      return Object.fromEntries(
        Object.entries(sessions).map(([id, session]) => [
          id,
          { ...session.data, createdAt: session.createdAt } as unknown as T,
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
      const newData = modifier(currentData);
      saveSession(id, newData);
    }
  }

  function updateSessionIfExists<T>(
    id: string | undefined,
    updates: Partial<T>
  ): void {
    replaceSessionIfExists<T>(id, (currentData) => ({
      ...currentData,
      ...updates,
    }));
  }

  function deleteSession(id: string): void {
    const sessions = getSessions<unknown>();
    delete sessions[id];
    localStorage.setItem(storageKey, JSON.stringify(sessions));
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

    localStorage.setItem(storageKey, JSON.stringify(updatedSessions));
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
  };
}
