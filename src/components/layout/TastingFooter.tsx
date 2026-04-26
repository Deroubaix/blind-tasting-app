"use client";

import Link from "next/link";
import { useState } from "react";

type TastingFooterProps = {
  onReset?: () => void;
  backHref?: string;
  onBack?: () => void;
  backLabel?: string;
  nextLabel: string;
  onNext: () => void;
};

export default function TastingFooter({
  onReset,
  backHref,
  onBack,
  backLabel = "← Back",
  nextLabel,
  onNext,
}: TastingFooterProps) {
  const [autoSaveTime] = useState(() =>
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );

  return (
    <footer className="tasting-footer">
      <div className="tasting-footer__left">
        <span className="tasting-footer__autosave">Autosaved at {autoSaveTime}</span>
        {onReset && (
          <button className="tasting-footer__reset" onClick={onReset}>
            Reset Phase
          </button>
        )}
      </div>

      {backHref ? (
        <Link href={backHref} className="tasting-footer__back">
          {backLabel}
        </Link>
      ) : onBack ? (
        <button className="tasting-footer__back-btn" onClick={onBack}>
          {backLabel}
        </button>
      ) : null}

      <button className="tasting-footer__next" onClick={onNext}>
        {nextLabel}
      </button>
    </footer>
  );
}
