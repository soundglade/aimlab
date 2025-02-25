import { openDB, IDBPDatabase } from "idb";

export interface StoredFile {
  id: string;
  projectId?: string;
  groupId?: string;
  data: Blob | string;
  createdAt: number;
  contentType?: string;
}

export interface FileStorageApi {
  // Core operations
  saveFile: (
    data: Blob | string,
    options?: { projectId?: string; groupId?: string; contentType?: string }
  ) => Promise<string>;
  getFile: (fileId: string) => Promise<StoredFile | null>;
  deleteFile: (fileId: string) => Promise<boolean>;

  // Query operations
  getFilesByProject: (projectId: string) => Promise<StoredFile[]>;
  getFilesByGroup: (
    groupId: string,
    projectId?: string
  ) => Promise<StoredFile[]>;

  // Utility operations
  generateId: () => string;
  cleanupOldFiles: (maxAgeDays?: number) => Promise<void>;
  cleanupAllFiles: () => Promise<void>; // Helper for testing
  isEphemeral: () => boolean;
}

export interface FileStorageOptions {
  ephemeral?: boolean;
}

/**
 * Initializes a file storage system that can work in either ephemeral (in-memory)
 * or persistent (IndexedDB) mode.
 *
 * @param key A unique identifier for the storage instance
 * @param options Configuration options
 * @returns A FileStorageApi instance
 */
export function initializeFileStorage(
  key: string,
  options?: FileStorageOptions
): FileStorageApi {
  const storageKey = `${key}_files`;
  const ephemeral = options?.ephemeral ?? false;

  // In-memory storage for ephemeral mode
  let memoryStorage = new Map<string, StoredFile>();

  // IndexedDB database reference for persistent mode
  let dbPromise: Promise<IDBPDatabase | null> | null = null;

  /**
   * Initializes and returns the IndexedDB database
   */
  function getDB(): Promise<IDBPDatabase | null> {
    if (!dbPromise) {
      try {
        dbPromise = openDB(storageKey, 1, {
          upgrade(db) {
            // Create the files store with indexes
            const store = db.createObjectStore("files", { keyPath: "id" });
            store.createIndex("byProject", "projectId");
            store.createIndex("byGroup", "groupId");
            store.createIndex("byCreatedAt", "createdAt");
          },
        });
      } catch (error) {
        console.error("Error opening IndexedDB:", error);
        return Promise.resolve(null);
      }
    }
    return dbPromise;
  }

  /**
   * Generates a unique file ID combining timestamp and random characters
   */
  function generateId(): string {
    return `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .substring(2, 7)}`;
  }

  /**
   * Saves a file to storage
   */
  async function saveFile(
    data: Blob | string,
    options?: { projectId?: string; groupId?: string; contentType?: string }
  ): Promise<string> {
    const id = generateId();

    const file: StoredFile = {
      id,
      projectId: options?.projectId,
      groupId: options?.groupId,
      data,
      createdAt: Date.now(),
      contentType:
        options?.contentType ||
        (typeof data !== "string" ? data.type : "text/plain"),
    };

    const saveToMemory = () => {
      memoryStorage.set(id, file);
      return id;
    };

    if (ephemeral) {
      return saveToMemory();
    }

    try {
      const db = await getDB();
      if (!db) {
        return saveToMemory();
      }
      await db.put("files", file);
      return id;
    } catch (error) {
      console.error("Error saving file:", error);
      return saveToMemory();
    }
  }

  /**
   * Retrieves a file from storage by ID
   */
  async function getFile(fileId: string): Promise<StoredFile | null> {
    return queryWithFallback(
      async (db) => {
        const file = await db.get("files", fileId);
        return file || null; // Ensure we return null for non-existent files
      },
      () => memoryStorage.get(fileId) || null
    );
  }

  /**
   * Deletes a file from storage
   */
  async function deleteFile(fileId: string): Promise<boolean> {
    const deleteFromMemory = () => memoryStorage.delete(fileId);

    if (ephemeral) {
      return deleteFromMemory();
    }

    try {
      const db = await getDB();
      if (!db) {
        return deleteFromMemory();
      }

      // Check if file exists before deleting
      const file = await db.get("files", fileId);
      if (!file) {
        return false;
      }

      await db.delete("files", fileId);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return deleteFromMemory();
    }
  }

  /**
   * Helper function to handle fallbacks for query operations
   */
  async function queryWithFallback<T>(
    dbOperation: (db: IDBPDatabase) => Promise<T>,
    memoryOperation: () => T
  ): Promise<T> {
    if (ephemeral) {
      return memoryOperation();
    }

    try {
      const db = await getDB();
      if (!db) {
        return memoryOperation();
      }
      return await dbOperation(db);
    } catch (error) {
      console.error("Error in database operation:", error);
      return memoryOperation();
    }
  }

  /**
   * Retrieves files by project ID
   */
  async function getFilesByProject(projectId: string): Promise<StoredFile[]> {
    return queryWithFallback(
      async (db) => {
        const files = await db.getAllFromIndex("files", "byProject", projectId);
        return files || [];
      },
      () =>
        Array.from(memoryStorage.values()).filter(
          (file) => file.projectId === projectId
        )
    );
  }

  /**
   * Retrieves files by group ID, optionally filtered by project ID
   */
  async function getFilesByGroup(
    groupId: string,
    projectId?: string
  ): Promise<StoredFile[]> {
    return queryWithFallback(
      async (db) => {
        const files = await db.getAllFromIndex("files", "byGroup", groupId);
        const filteredFiles = files || [];

        if (projectId) {
          return filteredFiles.filter((file) => file.projectId === projectId);
        }
        return filteredFiles;
      },
      () =>
        Array.from(memoryStorage.values()).filter(
          (file) =>
            file.groupId === groupId &&
            (projectId ? file.projectId === projectId : true)
        )
    );
  }

  /**
   * Cleans up files older than the specified number of days
   */
  async function cleanupOldFiles(maxAgeDays: number = 7): Promise<void> {
    const now = Date.now();
    const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;

    const cleanupMemoryStorage = () => {
      for (const [id, file] of memoryStorage.entries()) {
        if (now - file.createdAt > maxAge) {
          memoryStorage.delete(id);
        }
      }
    };

    if (ephemeral) {
      cleanupMemoryStorage();
    } else {
      try {
        const db = await getDB();
        if (!db) {
          // Fallback to memory storage if IndexedDB is not available
          cleanupMemoryStorage();
          return;
        }

        const tx = db.transaction("files", "readwrite");
        const store = tx.objectStore("files");
        const files = await store.index("byCreatedAt").getAll();

        for (const file of files) {
          if (now - file.createdAt > maxAge) {
            await store.delete(file.id);
          }
        }

        await tx.done;
      } catch (error) {
        console.error("Error cleaning up old files:", error);
        // Fallback to memory storage on error
        cleanupMemoryStorage();
      }
    }
  }

  /**
   * Cleans up all files (helper for testing)
   */
  async function cleanupAllFiles(): Promise<void> {
    if (ephemeral) {
      memoryStorage.clear();
    } else {
      try {
        const db = await getDB();
        if (!db) {
          // Fallback to memory storage if IndexedDB is not available
          memoryStorage.clear();
          return;
        }

        const tx = db.transaction("files", "readwrite");
        await tx.objectStore("files").clear();
        await tx.done;
      } catch (error) {
        console.error("Error cleaning up all files:", error);
        // Fallback to memory storage on error
        memoryStorage.clear();
      }
    }
  }

  /**
   * Returns whether the storage is in ephemeral mode
   */
  function isEphemeral(): boolean {
    return ephemeral;
  }

  return {
    saveFile,
    getFile,
    deleteFile,
    getFilesByProject,
    getFilesByGroup,
    generateId,
    cleanupOldFiles,
    cleanupAllFiles,
    isEphemeral,
  };
}
