"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconCamera, IconX } from "@tabler/icons-react";
import { useTastingContext } from "../tasting/TastingContext";
import ClientTastingService from "../../services/client/ClientTastingService";
import { useAuthProvider } from "../auth/AuthProvider";
import { useToastProvider } from "../../toast/ToastProvider";
import useLoadTracker from "../../hooks/useLoadTracker";
import TastingPhaseLayout from "../layout/TastingPhaseLayout";
import PhaseHeading from "../layout/PhaseHeading";

export default function SavedTasting({ wineType }: { wineType: "red" | "white" }) {
  const { tastingData, updateTastingData, resetTastingData } = useTastingContext();
  const [notes, setNotes] = useState(tastingData.notes || "");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { isLoading, addLoader, removeLoader } = useLoadTracker();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const tastingService = new ClientTastingService();
  const { user, isInitialLoading } = useAuthProvider();
  const { showToast } = useToastProvider();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) {
      showToast({
        title: "Login required",
        children: "Please log in or sign up to save your tasting.",
        color: "error",
      });
      router.push(`/login?r=/tastings/save?wineType=${wineType}`);
      return;
    }

    const loader = addLoader();
    updateTastingData({ notes });

    try {
      await tastingService.saveTasting({ ...tastingData, notes } as any);
      resetTastingData();
      router.push("/archives");
    } catch (error: any) {
      const isAuthError = error?.statusCode === 401 || error?.message?.includes("Access Denied");
      if (isAuthError) {
        showToast({ title: "Login required", children: "Please log in to save your tasting.", color: "error" });
        router.push(`/login?r=/tastings/save?wineType=${wineType}`);
      } else {
        showToast({ title: "Save failed", children: "Something went wrong. Please try again.", color: "error" });
      }
    } finally {
      removeLoader(loader);
    }
  };

  return (
    <TastingPhaseLayout
      wineType={wineType}
      footer={{
        onBack: () => router.push(`/tastings/final-conclusion?wineType=${wineType}`),
        backLabel: "← Back to Final Conclusion",
        nextLabel: "Save Tasting",
        onNext: handleSave,
        nextLoading: isLoading,
      }}
    >
      <PhaseHeading
        phase="Wrap Up"
        title="Review & Save"
        description="Add any final notes and capture the wine label before saving your tasting record."
      />

            <div className="save-layout">

              {/* Notes */}
              <div className="tasting-card">
                <div className="tasting-card__label">Notes</div>
                <textarea
                  className="tasting-textarea"
                  rows={6}
                  placeholder="Add your final observations, impressions, or anything worth remembering..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Photo */}
              <div className="tasting-card">
                <div className="tasting-card__label">Wine Label Photo</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={handlePhotoChange}
                />
                {photoPreview ? (
                  <div className="save-photo-preview">
                    <img src={photoPreview} alt="Wine label" className="save-photo-preview__img" />
                    <button
                      className="save-photo-remove"
                      onClick={() => {
                        setPhotoPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <IconX size={14} />
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    className="save-photo-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <IconCamera size={18} />
                    Take / Choose Photo
                  </button>
                )}
              </div>

            </div>

            {/* Auth notice */}
            {!isInitialLoading && !user && (
              <div className="save-auth-notice">
                <p className="save-auth-notice__text">You need an account to save tastings.</p>
                <div className="save-auth-notice__actions">
                  <Link href={`/signup?r=/tastings/save?wineType=${wineType}`} className="save-auth-btn save-auth-btn--primary">
                    Sign Up
                  </Link>
                  <Link href={`/login?r=/tastings/save?wineType=${wineType}`} className="save-auth-btn save-auth-btn--secondary">
                    Log In
                  </Link>
                </div>
              </div>
            )}

    </TastingPhaseLayout>
  );
}
