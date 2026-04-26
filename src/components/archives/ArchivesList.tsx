"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthProvider } from "../auth/AuthProvider";
import ClientTastingService from "../../services/client/ClientTastingService";
import { TastingData } from "../../types/TastingData";
import Link from "next/link";

type SavedTasting = TastingData & {
  id: number;
  created_at?: string;
};

export default function ArchivesList() {
  const { user, isInitialLoading } = useAuthProvider();
  const [tastings, setTastings] = useState<SavedTasting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const service = new ClientTastingService();

  useEffect(() => {
    if (isInitialLoading) return;
    if (!user) {
      router.push("/login?r=/archives");
      return;
    }
    service
      .getTastings()
      .then((data) => setTastings(data as SavedTasting[]))
      .catch(() => setError("Failed to load tastings."))
      .finally(() => setIsLoading(false));
  }, [user, isInitialLoading]);

  if (isInitialLoading || isLoading) {
    return <div className="archives-loading">Loading your tastings...</div>;
  }

  if (error) {
    return <div className="archives-error">{error}</div>;
  }

  if (tastings.length === 0) {
    return (
      <div className="archives-empty">
        <p>You have no saved tastings yet.</p>
        <Link href="/tastings/start" className="button rounded solid">
          Start Your First Tasting
        </Link>
      </div>
    );
  }

  return (
    <div className="archives-list">
      {tastings.map((tasting) => {
        const date = tasting.created_at
          ? new Date(tasting.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "Unknown date";

        const finalGrape =
          (tasting.conclusion?.final as any)?.["Grape Variety/Blend"] || null;
        const finalCountry =
          (tasting.conclusion?.final as any)?.["Country of Origin"] || null;
        const finalRegion =
          (tasting.conclusion?.final as any)?.["Region/Appellation"] || null;
        const finalVintage =
          (tasting.conclusion?.final as any)?.["Vintage"] || null;

        return (
          <div key={tasting.id} className="archive-card">
            <div className="archive-card__header">
              <span className={`wine-type-badge wine-type-badge--${tasting.wineType?.toLowerCase()}`}>
                {tasting.wineType}
              </span>
              <span className="archive-card__date">{date}</span>
            </div>

            {tasting.wineName && (
              <h3 className="archive-card__name">{tasting.wineName}</h3>
            )}

            <div className="archive-card__details">
              {finalGrape && <p><strong>Grape:</strong> {finalGrape}</p>}
              {finalCountry && <p><strong>Country:</strong> {finalCountry}</p>}
              {finalRegion && <p><strong>Region:</strong> {finalRegion}</p>}
              {finalVintage && <p><strong>Vintage:</strong> {finalVintage}</p>}
            </div>

            {tasting.notes && (
              <p className="archive-card__notes">{tasting.notes}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
