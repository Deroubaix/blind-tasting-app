"use client";

import { useCallback, useState } from "react";
import { v4 as uuid } from "uuid";

export type TrackedLoader = {
  id: string;
  message?: string;
};

export default function useLoadTracker() {
  const [loaders, setLoaders] = useState<TrackedLoader[]>([]);

  const addLoader = useCallback((id?: string, message?: string) => {
    if (!id) {
      id = uuid();
    }
    setLoaders((existing) => {
      return [...existing, { id, message } as TrackedLoader];
    });
    return id;
  }, []);

  const removeLoader = useCallback((id: string) => {
    setLoaders((loaders) => {
      return loaders.filter((loader) => loader.id !== id);
    });
  }, []);

  const getLoaderMessage = useCallback(
    (id: string) => {
      loaders.find((loader) => loader.id === id)?.message;
    },
    [loaders],
  );

  const hasLoader = useCallback(
    (id: string) => {
      return loaders.some((loader) => loader.id === id);
    },
    [loaders],
  );

  const loadTracker = {
    addLoader,
    removeLoader,
    getLoaderMessage,
    hasLoader,
    count: loaders.length,
    isLoading: loaders.length > 0,
  };

  return loadTracker;
}
