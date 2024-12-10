"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToastProvider } from "../../toast/ToastProvider";
import { useTastingContext } from "../../components/tasting/TastingContext";
import ClientTastingService from "../../services/client/ClientTastingService";

const timerDurationMap = {
  "7.5 min": 7,
  "4 min": 4,
} as const;

type TimerDurationKey = keyof typeof timerDurationMap;

export default function TastingStartPage() {
  const router = useRouter();
  const tastingService = new ClientTastingService();
  const { showToast } = useToastProvider();
  const { tastingData, updateTastingData } = useTastingContext();

  const [wineType, setWineType] = useState<"White" | "Red" | null>(
    tastingData.wineType || null
  );
  const [timer, setTimer] = useState<TimerDurationKey | null>(
    tastingData.timerDuration
      ? (Object.keys(timerDurationMap).find(
          (key) =>
            timerDurationMap[key as TimerDurationKey] ===
            tastingData.timerDuration
        ) as TimerDurationKey | null)
      : null
  );
  const [wineName, setWineName] = useState<string>("");
  const [step, setStep] = useState<"select" | "wineName">("select");
  const [isSaving, setIsSaving] = useState(false);

  const handleNext = () => {
    if (!wineType) {
      showToast({
        title: "Validation Error",
        children: "Please select a wine type.",
        color: "error",
      });
      return;
    }

    if (step === "select") {
      setStep("wineName");
      return;
    }

    if (!wineName.trim()) {
      showToast({
        title: "Validation Error",
        children: "Please provide the wine name.",
        color: "error",
      });
      return;
    }

    updateTastingData({
      wineType,
      timerEnabled: !!timer,
      timerDuration: timer ? timerDurationMap[timer] : null,
      wineName,
      conclusion: {
        initial: {},
        final: {},
      },
    });
    

    router.push(`/tastings/${wineType.toLowerCase()}`);
  };

  return (
    <div>
      <h1>Start Tasting</h1>
      {step === "select" && (
        <>
          <div>
            <h2>Select Wine Type</h2>
            <button
              onClick={() => setWineType("White")}
              className={wineType === "White" ? "selected" : ""}
            >
              White
            </button>
            <button
              onClick={() => setWineType("Red")}
              className={wineType === "Red" ? "selected" : ""}
            >
              Red
            </button>
          </div>
          <div>
            <h2>Select Timer</h2>
            <button
              onClick={() => setTimer("7.5 min")}
              className={timer === "7.5 min" ? "selected" : ""}
            >
              7.5 min
            </button>
            <button
              onClick={() => setTimer("4 min")}
              className={timer === "4 min" ? "selected" : ""}
            >
              4 min
            </button>
          </div>
        </>
      )}
      {step === "wineName" && (
        <div>
          <h2>Enter Wine Name</h2>
          <input
            type="text"
            value={wineName}
            onChange={(e) => setWineName(e.target.value)}
            placeholder="Enter the name of the wine"
          />
        </div>
      )}
      <button onClick={handleNext} disabled={isSaving}>
        {isSaving ? "Saving..." : "Next"}
      </button>
    </div>
  );
}
