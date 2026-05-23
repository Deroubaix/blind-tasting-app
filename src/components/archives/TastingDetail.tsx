"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TastingData } from "../../types/TastingData";
import ClientTastingService from "../../services/client/ClientTastingService";

const service = new ClientTastingService();

type SavedTasting = TastingData & { id: number; created_at: string };

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function PhaseSection({
  label,
  data,
  isMulti = false,
}: {
  label: string;
  data: Record<string, string | string[]> | undefined | null;
  isMulti?: boolean;
}) {
  if (!data) return null;
  const entries = Object.entries(data).filter(([, v]) =>
    Array.isArray(v) ? (v as string[]).length > 0 : Boolean(v)
  );
  if (entries.length === 0) return null;

  return (
    <div className="tasting-detail__section">
      <div className="tasting-detail__section-label">{label}</div>
      <div className="tasting-detail__grid">
        {entries.map(([key, value]) => (
          <div key={key} className="tasting-detail__field">
            <div className="tasting-detail__field-label">{formatKey(key)}</div>
            <div className="tasting-detail__field-value">
              {Array.isArray(value) ? value.join(", ") : value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TastingDetail({ id }: { id: string }) {
  const [tasting, setTasting] = useState<SavedTasting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    service
      .getTasting(id)
      .then(setTasting)
      .catch(() => setError("Tasting not found."))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="tasting-detail__container">
        <div className="archives-loading">Loading…</div>
      </div>
    );
  }

  if (error || !tasting) {
    return (
      <div className="tasting-detail__container">
        <Link href="/archives" className="tasting-detail__back no-underline">
          ← Back to Archives
        </Link>
        <div className="archives-error">{error ?? "Tasting not found."}</div>
      </div>
    );
  }

  const final = (tasting.conclusion?.final as Record<string, string | null>) ?? {};
  const grapeVariety = final.grapeVariety ?? null;
  const countryOfOrigin = final.countryOfOrigin ?? null;
  const regionAppellation = final.regionAppellation ?? null;
  const qualityLevel = final.qualityLevel ?? null;
  const vintage = final.vintage ?? null;

  const title = tasting.wineName || grapeVariety || "Untitled Tasting";
  const subtitleParts = [grapeVariety, regionAppellation, countryOfOrigin].filter(Boolean);
  const subtitle = subtitleParts.length > 0
    ? `${subtitleParts.join(", ")}${vintage ? ` — ${vintage}` : ""}`
    : vintage ?? null;

  const date = new Date(tasting.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  const initial = tasting.conclusion?.initial;

  const finalConclusionFields: Record<string, string> = {};
  if (grapeVariety) finalConclusionFields["Grape Variety"] = grapeVariety;
  if (countryOfOrigin) finalConclusionFields["Country of Origin"] = countryOfOrigin;
  if (regionAppellation) finalConclusionFields["Region / Appellation"] = regionAppellation;
  if (qualityLevel) finalConclusionFields["Quality Level"] = qualityLevel;
  if (vintage) finalConclusionFields["Vintage"] = vintage;

  const initialFields: Record<string, string> = {};
  if (initial?.worldOrigin) initialFields["World Origin"] = initial.worldOrigin;
  if (initial?.climate) initialFields["Climate"] = initial.climate;
  if (initial?.ageRange) initialFields["Age Range"] = initial.ageRange;
  if (initial?.grapeVarieties?.length)
    initialFields["Grape Varieties"] = initial.grapeVarieties.join(", ");
  if (initial?.possibleCountries?.length)
    initialFields["Possible Countries"] = initial.possibleCountries.join(", ");

  return (
    <div className="tasting-detail__container">
        <Link href="/archives" className="tasting-detail__back no-underline">
          ← Back to Archives
        </Link>

        <div className="tasting-detail__hero-top">
          <span className={`wine-type-badge wine-type-badge--${tasting.wineType?.toLowerCase()}`}>
            {tasting.wineType} Wine
          </span>
          <div className="tasting-detail__hero-meta">
            <span className="tasting-detail__id">ID #{tasting.id}</span>
            <span className="tasting-detail__date">{date}</span>
          </div>
        </div>

        <h1 className="tasting-detail__title">{title}</h1>
        {subtitle && <p className="tasting-detail__subtitle">{subtitle}</p>}

        <PhaseSection label="Sight" data={tasting.sight as Record<string, string>} />
        <PhaseSection
          label="Nose"
          data={tasting.nose as Record<string, string[]>}
          isMulti
        />
        <PhaseSection label="Palate" data={tasting.palate as Record<string, string>} />

        {Object.keys(initialFields).length > 0 && (
          <div className="tasting-detail__section">
            <div className="tasting-detail__section-label">Initial Conclusion</div>
            <div className="tasting-detail__grid">
              {Object.entries(initialFields).map(([label, value]) => (
                <div key={label} className="tasting-detail__field">
                  <div className="tasting-detail__field-label">{label}</div>
                  <div className="tasting-detail__field-value">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.keys(finalConclusionFields).length > 0 && (
          <div className="tasting-detail__section">
            <div className="tasting-detail__section-label">Final Conclusion</div>
            <div className="tasting-detail__grid">
              {Object.entries(finalConclusionFields).map(([label, value]) => (
                <div key={label} className="tasting-detail__field">
                  <div className="tasting-detail__field-label">{label}</div>
                  <div className="tasting-detail__field-value">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tasting.notes && (
          <div className="tasting-detail__section">
            <div className="tasting-detail__section-label">Notes</div>
            <p className="tasting-detail__notes">"{tasting.notes}"</p>
          </div>
        )}
    </div>
  );
}
