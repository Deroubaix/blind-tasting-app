"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconCamera, IconX } from "@tabler/icons-react";
import { useTastingContext } from "../tasting/TastingContext";
import ClientTastingService from "../../services/client/ClientTastingService";
import { useAuthProvider } from "../auth/AuthProvider";
import { useToastProvider } from "../../toast/ToastProvider";
import LeftSidebar from "../tasting/LeftSideBar";
import TastingPageHeader from "../layout/TastingPageHeader";
import TastingFooter from "../layout/TastingFooter";

export default function SavedTasting({ wineType }: { wineType: "red" | "white" }) {
  const { tastingData, updateTastingData, resetTastingData } = useTastingContext();
  const [notes, setNotes] = useState(tastingData.notes || "");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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

    setIsSaving(true);
    updateTastingData({ notes });

    try {
      await tastingService.saveTasting({ ...tastingData, notes } as any);
      showToast({
        title: "Tasting saved!",
        children: "Your tasting has been saved to your archives.",
        color: "success",
      });
      resetTastingData();
      router.push("/tastings/thankyou");
    } catch (error: any) {
      const isAuthError = error?.statusCode === 401 || error?.message?.includes("Access Denied");
      if (isAuthError) {
        showToast({ title: "Login required", children: "Please log in to save your tasting.", color: "error" });
        router.push(`/login?r=/tastings/save?wineType=${wineType}`);
      } else {
        showToast({ title: "Save failed", children: "Something went wrong. Please try again.", color: "error" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="tasting-phase-page">
      <TastingPageHeader wineType={wineType} />
      <div className="tasting-phase-body">
        <LeftSidebar wineType={wineType} />
        <main className="tasting-phase-main">
          <div className="tasting-phase-content">

            <div className="phase-label">Wrap Up</div>
            <h1 className="phase-heading">Review &amp; Save</h1>
            <p className="phase-description">
              Add any final notes and capture the wine label before saving your tasting record.
            </p>

            <div className="save-layout">

              {/* Notes */}
              <div className="save-card">
                <div className="save-card__label">Notes</div>
                <textarea
                  className="save-notes"
                  rows={6}
                  placeholder="Add your final observations, impressions, or anything worth remembering..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Photo */}
              <div className="save-card">
                <div className="save-card__label">Wine Label Photo</div>
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

          </div>
        </main>
      </div>
      <TastingFooter
        onBack={() => router.push(`/tastings/final-conclusion?wineType=${wineType}`)}
        backLabel="← Back to Final Conclusion"
        nextLabel={isSaving ? "Saving..." : "Save Tasting"}
        onNext={handleSave}
      />
    </div>
  );
}
