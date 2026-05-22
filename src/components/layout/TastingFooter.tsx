"use client";

import { useEffect, useState } from "react";
import Loading from "../misc/Loading";

type TastingFooterProps = {
  onReset?: () => void;
  onBack?: () => void;
  backLabel?: string;
  nextLabel: string;
  onNext: () => void;
  nextLoading?: boolean;
  nextDisabled?: boolean;
};

export default function TastingFooter({
  onReset,
  onBack,
  backLabel = "← Back",
  nextLabel,
  onNext,
  nextLoading,
  nextDisabled,
}: TastingFooterProps) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(timer);
  }, [confirming]);

  const handleResetClick = () => setConfirming(true);
  const handleConfirm = () => { setConfirming(false); onReset!(); };
  const handleCancel = () => setConfirming(false);

  return (
    <footer className="tasting-footer">
      <div className="tasting-footer__left">
        {onReset && (
          confirming ? (
            <div className="tasting-footer__reset-confirm">
              <span className="tasting-footer__reset-question">Are you sure?</span>
              <button className="tasting-footer__reset-yes" onClick={handleConfirm}>Yes</button>
              <button className="tasting-footer__reset-no" onClick={handleCancel}>No</button>
            </div>
          ) : (
            <button className="tasting-footer__reset" onClick={handleResetClick}>
              <span className="tasting-footer__reset-icon">↺</span>
              Reset Phase
            </button>
          )
        )}
      </div>

      {onBack && (
        <button className="tasting-footer__back-btn" onClick={onBack}>
          {backLabel}
        </button>
      )}

      <button className="tasting-footer__next" onClick={onNext} disabled={nextLoading || nextDisabled}>
        {nextLoading && <Loading size={14} inline />}
        {nextLabel}
      </button>
    </footer>
  );
}
