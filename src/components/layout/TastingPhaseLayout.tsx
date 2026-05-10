"use client";

import React, { ReactNode } from "react";
import TastingPageHeader from "./TastingPageHeader";
import TastingFooter from "./TastingFooter";
import LeftSidebar from "../tasting/LeftSideBar";

type FooterProps = {
  onReset?: () => void;
  onBack?: () => void;
  backLabel?: string;
  nextLabel: string;
  onNext: () => void;
  nextLoading?: boolean;
};

type TastingPhaseLayoutProps = {
  wineType: "red" | "white";
  progress?: number;
  timerPage?: "sight" | "nose" | "palate" | "initialConclusion" | "finalConclusion";
  timerDestination?: string;
  footer: FooterProps;
  children: ReactNode;
};

export default function TastingPhaseLayout({
  wineType,
  progress,
  timerPage,
  timerDestination,
  footer,
  children,
}: TastingPhaseLayoutProps) {
  return (
    <div className="tasting-phase-page">
      <TastingPageHeader
        wineType={wineType}
        timerPage={timerPage}
        timerDestination={timerDestination}
      />
      <div className="tasting-phase-body">
        <LeftSidebar wineType={wineType} progress={progress} />
        <main className="tasting-phase-main">
          <div className="tasting-phase-content">
            {children}
          </div>
        </main>
      </div>
      <TastingFooter {...footer} />
    </div>
  );
}
