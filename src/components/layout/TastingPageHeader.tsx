"use client";

import React from "react";
import Link from "next/link";
import { IconUserCircle } from "@tabler/icons-react";
import useAuthenticatedUser from "../../hooks/UseAuthenticatedUser";
import { useTastingContext } from "../tasting/TastingContext";

type TastingPageHeaderProps = {
  wineType?: "red" | "white";
};

export default function TastingPageHeader({ wineType }: TastingPageHeaderProps) {
  const { user, isInitialLoading } = useAuthenticatedUser();
  const { tastingData } = useTastingContext();
  const isLoggedIn = !isInitialLoading && !!user;
  const timerEnabled = !!tastingData.timerEnabled;

  const wineLabel = wineType === "red"
    ? "RED WINE ASSESSMENT"
    : wineType === "white"
    ? "WHITE WINE ASSESSMENT"
    : null;

  return (
    <header className="tasting-page-header">
      <Link href="/" className="tasting-page-header__logo no-underline">
        The Sommelier&apos;s Ledger
      </Link>

      {wineLabel && (
        <span className="tasting-page-header__wine-label">{wineLabel}</span>
      )}

      <div className="tasting-page-header__actions">
        {timerEnabled && (
          <span className="tasting-page-header__timer">⏱ 25:00</span>
        )}
        {isLoggedIn && (
          <Link href="/account" aria-label="Account" className="tasting-page-header__account-link">
            <IconUserCircle size={20} />
          </Link>
        )}
      </div>
    </header>
  );
}
