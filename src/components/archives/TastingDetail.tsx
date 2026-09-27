'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { type TastingData } from '../../types/TastingData';
import ClientTastingService from '../../services/client/ClientTastingService';
import ClientPhotoService from '../../services/client/ClientPhotoService';
import RevealPanel from './RevealPanel';
import { describeWine, isRevealed, revealTitle } from './revealScore';

const service = new ClientTastingService();

type SavedTasting = TastingData & { id: string; created_at: string };

function formatKey(key: string): string {
	// Splits camelCase keys from older tastings ("StainedTears"); grid labels like
	// "Apple/Pear" or "Intensity of Color" already read correctly and pass through.
	return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (s) => s.toUpperCase());
}

function PhaseSection({ label, data }: { label: string; data: Record<string, string | string[]> | undefined | null }) {
	if (!data) {
		return null;
	}
	const entries = Object.entries(data).filter(([, v]) =>
		Array.isArray(v) ? (v as string[]).length > 0 : Boolean(v),
	);
	if (entries.length === 0) {
		return null;
	}

	return (
		<div className="tasting-detail__section">
			<div className="tasting-detail__section-label">{label}</div>
			<div className="tasting-detail__grid">
				{entries.map(([key, value]) => (
					<div key={key} className="tasting-detail__field">
						<div className="tasting-detail__field-label">{formatKey(key)}</div>
						<div className="tasting-detail__field-value">
							{Array.isArray(value) ? value.join(', ') : value}
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
			.catch(() => setError('Tasting not found.'))
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
				<div className="archives-error">{error ?? 'Tasting not found.'}</div>
			</div>
		);
	}

	const final = (tasting.conclusion?.final as Record<string, string | null>) ?? {};
	const grapeVariety = final.grapeVariety ?? null;
	const countryOfOrigin = final.countryOfOrigin ?? null;
	const regionAppellation = final.regionAppellation ?? null;
	const qualityLevel = final.qualityLevel ?? null;
	const styleCategory = final.styleCategory ?? null;
	const vintage = final.vintage ?? null;

	// Before the reveal the title is the taster's own label ("Flight 3, wine 2"); after it, the wine
	// itself, with the call kept underneath so the two read against each other.
	const revealed = isRevealed(tasting.reveal);
	const callSummary = describeWine(final) || null;
	const title = revealed ? revealTitle(tasting.reveal!) : tasting.wineName || grapeVariety || 'Untitled Tasting';
	const subtitle = revealed ? describeWine(tasting.reveal) : callSummary;

	const date = new Date(tasting.created_at).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: '2-digit',
	});

	const initial = tasting.conclusion?.initial;

	const finalConclusionFields: Record<string, string> = {};
	if (grapeVariety) {
		finalConclusionFields['Grape Variety or Blend'] = grapeVariety;
	}
	if (countryOfOrigin) {
		finalConclusionFields['Country of Origin'] = countryOfOrigin;
	}
	if (regionAppellation) {
		finalConclusionFields['Region and Appellation'] = regionAppellation;
	}
	if (qualityLevel) {
		finalConclusionFields['Official Quality Level'] = qualityLevel;
	}
	if (styleCategory) {
		finalConclusionFields['Official Style Category'] = styleCategory;
	}
	if (vintage) {
		finalConclusionFields['Vintage'] = vintage;
	}

	const initialFields: Record<string, string> = {};
	if (initial?.worldOrigin) {
		initialFields['World Origin'] = initial.worldOrigin;
	}
	if (initial?.climate) {
		initialFields['Climate'] = initial.climate;
	}
	if (initial?.ageRange) {
		initialFields['Age Range'] = initial.ageRange;
	}
	if (initial?.grapeVarieties?.length) {
		initialFields['Possible Grape Varieties'] = initial.grapeVarieties.join(', ');
	}
	if (initial?.possibleCountries?.length) {
		initialFields['Possible Countries'] = initial.possibleCountries.join(', ');
	}

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
					{tasting.number != null && <span className="tasting-detail__id">No. {tasting.number}</span>}
					{revealed && tasting.wineName && <span className="tasting-detail__id">{tasting.wineName}</span>}
					<span className="tasting-detail__date">{date}</span>
				</div>
			</div>

			<div className="tasting-detail__title-row">
				<div className="tasting-detail__title-text">
					<h1>{title}</h1>
					{subtitle && <p className="tasting-detail__subtitle">{subtitle}</p>}
					{revealed && callSummary && (
						<p className="tasting-detail__call">
							<span className="tasting-detail__call-label">Your call</span>
							{callSummary}
						</p>
					)}
				</div>

				{tasting.photoKey && (
					<a
						href={ClientPhotoService.url(tasting.photoKey)}
						target="_blank"
						rel="noopener"
						className="tasting-detail__photo-link no-underline"
						aria-label="Open photo full size"
					>
						{/* Served by an authenticated route with its own caching; next/image's optimiser
						    would fetch it without the taster's cookie and get a 401. */}
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={ClientPhotoService.url(tasting.photoKey)}
							alt={`Photo for ${title}`}
							className="tasting-detail__photo"
						/>
					</a>
				)}
			</div>

			<RevealPanel tasting={tasting} title={title} onRevealed={(updated) => setTasting(updated)} />

			<PhaseSection label="Sight" data={tasting.sight as Record<string, string>} />
			<PhaseSection label="Nose" data={tasting.nose as Record<string, string[]>} />
			<PhaseSection label="Palate" data={tasting.palate as Record<string, string>} />

			{tasting.confirmNose && (
				<div className="tasting-detail__section">
					<div className="tasting-detail__section-label">Confirm the Nose</div>
					<p className="tasting-detail__notes">&ldquo;{tasting.confirmNose}&rdquo;</p>
				</div>
			)}

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
					<p className="tasting-detail__notes">&ldquo;{tasting.notes}&rdquo;</p>
				</div>
			)}
		</div>
	);
}
