import { useState, useEffect, useCallback } from "react";
import type { SessionStorageApi } from "./session-storage";

/**
 * Custom hook to manage session state with automatic synchronization to storage
 *
 * @param sessionId The ID of the session to manage
 * @param storage The storage API instance
 * @param initialState The initial state to use if no session exists
 * @returns [state, updateState] tuple for accessing and updating state
 */
export function useSessionState<T>(
  sessionId: string | undefined,
  storage: SessionStorageApi,
  initialState: T
): [T, (updates: Partial<T>) => void] {
  const [state, setState] = useState<T>(initialState);

  // Load from session on mount or when sessionId changes
  useEffect(() => {
    if (sessionId) {
      const savedState = storage.getSession<T>(sessionId);
      if (savedState) {
        setState(savedState);
      }
    }
  }, [sessionId, storage]);

  // Update function that syncs with storage
  const updateState = useCallback(
    (updates: Partial<T>) => {
      const newState = { ...state, ...updates };
      setState(newState);

      if (sessionId) {
        storage.updateSessionIfExists(sessionId, newState);
      }
    },
    [state, sessionId, storage]
  );

  return [state, updateState];
}
