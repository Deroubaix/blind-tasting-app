"use client";

import React, { ReactNode, useEffect } from "react";
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
  nextDisabled?: boolean;
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
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isEditable = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable;

      if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !footer.nextLoading) {
        e.preventDefault();
        footer.onNext();
        return;
      }

      if (e.key === "Escape" && !isEditable && footer.onBack) {
        e.preventDefault();
        footer.onBack();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [footer]);

  return (
    <div className="tasting-phase-page">
      <a className="skip-link" href="#main">Skip to assessment</a>
      <TastingPageHeader
        wineType={wineType}
        timerPage={timerPage}
        timerDestination={timerDestination}
      />
      <div className="tasting-phase-body">
        <LeftSidebar wineType={wineType} progress={progress} />
        <main id="main" className="tasting-phase-main">
          <div className="tasting-phase-content">
            {children}
          </div>
        </main>
      </div>
      <TastingFooter {...footer} />
    </div>
  );
}
