"use client";

import React from "react";
import Link from "next/link";
import useAuthenticatedUser from "../../hooks/UseAuthenticatedUser";
import TimerConditional from "./TimerConditional";
import { useTastingContext } from "../tasting/TastingContext";

type TastingPageHeaderProps = {
  wineType?: "red" | "white";
  timerPage?: "sight" | "nose" | "palate" | "initialConclusion" | "finalConclusion";
  timerDestination?: string;
};

function getInitials(email: string): string {
  const local = email.split("@")[0];
  const parts = local.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export default function TastingPageHeader({ wineType, timerPage, timerDestination }: TastingPageHeaderProps) {
  const { user, isInitialLoading } = useAuthenticatedUser();
  const { tastingData } = useTastingContext();
  const isLoggedIn = !isInitialLoading && !!user;
  const showTimer = !!timerPage && !!timerDestination && !!tastingData.timerEnabled;

  const wineLabel = wineType === "red"
    ? "Red Wine Assessment"
    : wineType === "white"
    ? "White Wine Assessment"
    : null;

  const initials = user?.email ? getInitials(user.email) : "";

  return (
    <header className={`tasting-page-header${showTimer ? "" : " tasting-page-header--no-timer"}`}>
      <Link href="/" className="tasting-page-header__logo">
        The Sommelier&apos;s Ledger
      </Link>

      <div className="tasting-page-header__center">
        {showTimer && (
          <>
            <span className="tasting-page-header__timer-label">Time Remaining</span>
            <div className="tasting-page-header__timer-display">
              <TimerConditional page={timerPage!} destination={timerDestination!} />
            </div>
          </>
        )}
      </div>

      <div className="tasting-page-header__right">
        {wineLabel && (
          <span className="tasting-page-header__wine-label">{wineLabel}</span>
        )}
        {isLoggedIn && (
          <Link href="/account" aria-label="Account" className="tasting-page-header__avatar">
            {initials}
          </Link>
        )}
      </div>
    </header>
  );
}
