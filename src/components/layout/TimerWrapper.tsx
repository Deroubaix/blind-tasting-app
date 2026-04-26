"use client";

import Timer from "../layout/Timer";
import { useRouter } from "next/navigation";
import { useTastingContext } from "../tasting/TastingContext";

interface TimerWrapperProps {
  defaultDuration: number;
  destination: string;
}

function playBeep() {
  try {
    const AudioCtx =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const audioCtx = new AudioCtx();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.8);
  } catch (e) {
    // Audio not available
  }
}

export default function TimerWrapper({
  defaultDuration,
  destination,
}: TimerWrapperProps) {
  const router = useRouter();
  const { tastingData } = useTastingContext();

  const handleTimeUp = () => {
    if (tastingData.soundEnabled !== false) {
      playBeep();
    }
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    router.push(destination);
  };

  return <Timer initialTime={defaultDuration} onTimeUp={handleTimeUp} />;
}
