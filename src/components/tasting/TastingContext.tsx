"use client";

import React, { createContext, useContext, useState } from "react";
import { TastingData } from "../../types/TastingData"; // Import the shared type

type TastingContextValue = {
  tastingData: Partial<TastingData>;
  updateTastingData: (updates: Partial<TastingData>) => void;
  resetTastingData: () => void;
};

const TastingContext = createContext<TastingContextValue | undefined>(
  undefined
);

export const TastingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tastingData, setTastingData] = useState<Partial<TastingData>>({});

  const updateTastingData = (updates: Partial<TastingData>) => {
    setTastingData((prev) => ({ ...prev, ...updates }));
  };

  const resetTastingData = () => {
    setTastingData({});
  };

  return (
    <TastingContext.Provider
      value={{ tastingData, updateTastingData, resetTastingData }}
    >
      {children}
    </TastingContext.Provider>
  );
};

export const useTastingContext = () => {
  const context = useContext(TastingContext);
  if (!context) {
    throw new Error("useTastingContext must be used within a TastingProvider");
  }
  return context;
};
