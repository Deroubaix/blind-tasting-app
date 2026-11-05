'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { type TastingData } from '../../types/TastingData';
import ClientTastingService from '../../services/client/ClientTastingService';
import ClientPhotoService from '../../services/client/ClientPhotoService';
import RevealPanel from './RevealPanel';
import { JsonApiError } from '../../utils/ErrorUtils';
import { describeCall, describeWine, isRevealed, revealTitle } from './revealScore';
import { formatDate } from '../../utils/DateUtils';
import { gridOf } from '../../data/grids';
import { WSET_CONCLUSION_KEYS } from '../wset/wsetFields';
import { useLang, useText } from '../../i18n/LanguageProvider';
import { archivesText } from '../../i18n/archives';
import { commonText } from '../../i18n/common';

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

export default function TastingDetail({ id, openReveal = false }: { id: string; openReveal?: boolean }) {
	const [tasting, setTasting] = useState<SavedTasting | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	// The kind of failure, so its message follows a language switch.
	const [error, setError] = useState<'notFound' | 'loadFailed' | null>(null);
	const { lang } = useLang();
	const { detail: t, shared } = useText(archivesText);
	const common = useText(commonText);

	useEffect(() => {
		service
			.getTasting(id)
			.then(setTasting)
			.catch((err) => setError(JsonApiError.create(err).statusCode === 404 ? 'notFound' : 'loadFailed'))
			.finally(() => setIsLoading(false));
	}, [id]);

	if (isLoading) {
		return (
			<div className="tasting-detail__container">
				<div className="archives-loading">{common.loading}</div>
			</div>
		);
	}

	if (error || !tasting) {
		return (
			<div className="tasting-detail__container">
				<Link href="/archives" className="tasting-detail__back no-underline">
					{t.back}
				</Link>
				<div className="archives-error">{t[error ?? 'notFound']}</div>
			</div>
		);
	}

	const final = (tasting.conclusion?.final as Record<string, string | null>) ?? {};
	const grid = gridOf(tasting.grid);
	const wset = grid === 'wset';

	// Before the reveal the title is the taster's own label ("Flight 3, wine 2"); after it, the wine
	// itself, with the call kept underneath so the two read against each other.
	const revealed = isRevealed(tasting.reveal);
	const callSummary = describeCall(final, grid) || null;
	const title = revealed
		? revealTitle(tasting.reveal!, lang)
		: tasting.wineName || final.grapeVariety || shared.untitled;
	const subtitle = revealed ? describeWine(tasting.reveal) || null : callSummary;

	const date = formatDate(tasting.created_at, lang);

	const initial = tasting.conclusion?.initial;

	// The call's fields in grid order, labelled as the grid names them.
	const FINAL_LABELS: [string, string][] = wset
		? [
				[WSET_CONCLUSION_KEYS.quality, t.final.quality],
				[WSET_CONCLUSION_KEYS.readiness, t.final.readiness],
				[WSET_CONCLUSION_KEYS.reasons, t.final.reasons],
				['grapeVariety', t.final.grapeVariety],
				['countryOfOrigin', t.final.countryOfOrigin],
				['regionAppellation', t.final.regionAppellation],
				['vintage', t.final.vintage],
			]
		: [
				['grapeVariety', t.final.grapeVariety],
				['countryOfOrigin', t.final.countryOfOrigin],
				['regionAppellation', t.final.regionAppellation],
				['qualityLevel', t.final.qualityLevel],
				['styleCategory', t.final.styleCategory],
				['vintage', t.final.vintage],
			];
	const finalConclusionFields: Record<string, string> = {};
	for (const [key, label] of FINAL_LABELS) {
		if (final[key]) {
			finalConclusionFields[label] = final[key]!;
		}
	}

	const initialFields: Record<string, string> = {};
	if (initial?.worldOrigin) {
		initialFields[t.initial.worldOrigin] = initial.worldOrigin;
	}
	if (initial?.climate) {
		initialFields[t.initial.climate] = initial.climate;
	}
	if (initial?.ageRange) {
		initialFields[t.initial.ageRange] = initial.ageRange;
	}
	if (initial?.grapeVarieties?.length) {
		initialFields[t.initial.grapeVarieties] = initial.grapeVarieties.join(', ');
	}
	if (initial?.possibleCountries?.length) {
		initialFields[t.initial.possibleCountries] = initial.possibleCountries.join(', ');
	}

	return (
		<div className="tasting-detail__container">
			<Link href="/archives" className="tasting-detail__back no-underline">
				{t.back}
			</Link>

			<div className="tasting-detail__hero-top">
				<span className={`wine-type-badge wine-type-badge--${tasting.wineType?.toLowerCase()}`}>
					{tasting.wineType === 'Red' ? common.redWine : tasting.wineType === 'White' ? common.whiteWine : ''}
				</span>
				{wset && <span className="grid-badge">{common.grid.wset.short}</span>}
				<div className="tasting-detail__hero-meta">
					{tasting.number != null && (
						<span className="tasting-detail__id">{shared.number(tasting.number)}</span>
					)}
					{tasting.flight && (
						<Link href={`/flights/${tasting.flight.code}`} className="tasting-detail__flight no-underline">
							{t.flight(tasting.flight.name, tasting.flight.wineNumber)}
						</Link>
					)}
					{revealed && tasting.wineName && !tasting.flight && (
						<span className="tasting-detail__id">{tasting.wineName}</span>
					)}
					<span className="tasting-detail__date">{date}</span>
				</div>
			</div>

			<div className="tasting-detail__title-row">
				<div className="tasting-detail__title-text">
					<h1>{title}</h1>
					{subtitle && <p className="tasting-detail__subtitle">{subtitle}</p>}
					{revealed && callSummary && (
						<p className="tasting-detail__call">
							<span className="tasting-detail__call-label">{shared.yourCall}</span>
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
						aria-label={t.openPhoto}
					>
						{/* Served by an authenticated route with its own caching; next/image's optimiser
						    would fetch it without the taster's cookie and get a 401. */}
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={ClientPhotoService.url(tasting.photoKey)}
							alt={t.photoAlt(title)}
							className="tasting-detail__photo"
						/>
					</a>
				)}
			</div>

			<RevealPanel
				tasting={tasting}
				title={title}
				openForm={openReveal}
				onRevealed={(updated) => setTasting(updated)}
			/>

			<PhaseSection label={common.phase[grid].sight} data={tasting.sight as Record<string, string>} />
			<PhaseSection label={common.phase[grid].nose} data={tasting.nose as Record<string, string[]>} />
			<PhaseSection
				label={common.phase[grid].palate}
				data={tasting.palate as Record<string, string | string[]>}
			/>

			{tasting.confirmNose && (
				<div className="tasting-detail__section">
					<div className="tasting-detail__section-label">{t.confirmNose}</div>
					<p className="tasting-detail__notes">&ldquo;{tasting.confirmNose}&rdquo;</p>
				</div>
			)}

			{Object.keys(initialFields).length > 0 && (
				<div className="tasting-detail__section">
					<div className="tasting-detail__section-label">{common.phase[grid].initialConclusion}</div>
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
					<div className="tasting-detail__section-label">{common.phase[grid].finalConclusion}</div>
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
					<div className="tasting-detail__section-label">{t.notes}</div>
					<p className="tasting-detail__notes">&ldquo;{tasting.notes}&rdquo;</p>
				</div>
			)}
		</div>
	);
}
