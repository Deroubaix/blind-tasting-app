'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconArrowLeft } from '@tabler/icons-react';
import { type TastingData } from '../../types/TastingData';
import ClientTastingService from '../../services/client/ClientTastingService';
import ClientPhotoService from '../../services/client/ClientPhotoService';
import RevealPanel from './RevealPanel';
import { useModalProvider } from '../modal/ModalProvider';
import { useToastProvider } from '../toast/ToastProvider';
import { JsonApiError } from '../../utils/ErrorUtils';
import { compareReveal, isRevealed, revealTitle } from '../../utils/revealScore';
import { formatDate } from '../../utils/DateUtils';
import { gridOf } from '../../data/grids';
import { formatTimerSeconds } from '../../data/timerData';
import { WSET_CONCLUSION_KEYS } from '../wset/wsetFields';
import { useLang, useText } from '../../i18n/LanguageProvider';
import { archivesText } from '../../i18n/archives';
import { commonText } from '../../i18n/common';

const service = new ClientTastingService();

const DELETE_MODAL = 'tasting-delete';

type SavedTasting = TastingData & { id: string; created_at: string };

function formatKey(key: string): string {
	// Splits camelCase keys from older tastings ("StainedTears"); grid labels like
	// "Apple/Pear" or "Intensity of Color" already read correctly and pass through.
	return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (s) => s.toUpperCase());
}

/** One phase of the sheet: its answers as label and value pairs. */
function SheetPhase({
	label,
	data,
}: {
	label: string;
	data: Record<string, string | string[] | null | undefined> | undefined | null;
}) {
	const entries = Object.entries(data ?? {})
		.map(([key, value]) => [formatKey(key), Array.isArray(value) ? value.join(', ') : value] as const)
		.filter(([, value]) => Boolean(value));
	if (entries.length === 0) {
		return null;
	}
	return (
		<div className="sheet-phase">
			<h3>{label}</h3>
			<dl className="sheet-phase__kv">
				{entries.map(([key, value]) => (
					<div key={key} className={key ? undefined : 'sheet-phase__text'}>
						{key && <dt>{key}</dt>}
						<dd>{value}</dd>
					</div>
				))}
			</dl>
		</div>
	);
}

export default function TastingDetail({ id, openReveal = false }: { id: string; openReveal?: boolean }) {
	const [tasting, setTasting] = useState<SavedTasting | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	// The kind of failure, so its message follows a language switch.
	const [error, setError] = useState<'notFound' | 'loadFailed' | null>(null);
	const [deleting, setDeleting] = useState(false);
	const router = useRouter();
	const { openModal, closeModal } = useModalProvider();
	const { showToast } = useToastProvider();
	const { lang } = useLang();
	const { detail: t, shared, list, scorecard } = useText(archivesText);
	const common = useText(commonText);

	useEffect(() => {
		service
			.getTasting(id)
			.then(setTasting)
			.catch((err) => setError(JsonApiError.create(err).statusCode === 404 ? 'notFound' : 'loadFailed'))
			.finally(() => setIsLoading(false));
	}, [id]);

	const back = (
		<Link href="/archives" className="back-link">
			<IconArrowLeft size={18} aria-hidden="true" />
			{t.back}
		</Link>
	);

	if (isLoading) {
		return (
			<div className="tasting-detail">
				<div className="empty-state">{common.loading}</div>
			</div>
		);
	}

	if (error || !tasting) {
		return (
			<div className="tasting-detail">
				{back}
				<div className="empty-state">{t[error ?? 'notFound']}</div>
			</div>
		);
	}

	const final = (tasting.conclusion?.final as Record<string, string | null>) ?? {};
	const grid = gridOf(tasting.grid);
	const wset = grid === 'wset';

	// Before the reveal the title is the taster's own label ("Flight 3, wine 2"); after it, the wine itself.
	const revealed = isRevealed(tasting.reveal);
	const title = revealed
		? revealTitle(tasting.reveal!, lang)
		: tasting.wineName || final.grapeVariety || shared.untitled;
	const result = revealed ? compareReveal(final, tasting.reveal!, tasting.conclusion?.initial, grid, lang) : null;

	const meta = t.meta(
		tasting.wineType === 'Red' ? common.red : tasting.wineType === 'White' ? common.white : '',
		t.gridName[grid],
		formatDate(tasting.created_at, lang),
		tasting.flight ? '' : tasting.timerSeconds ? t.clock(formatTimerSeconds(tasting.timerSeconds)) : t.untimed,
	);

	const deleteTasting = async () => {
		closeModal(DELETE_MODAL);
		setDeleting(true);
		try {
			await service.deleteTasting(tasting.id);
			showToast({ title: t.deletedTitle, children: t.deleted(tasting.number) });
			router.push('/archives');
		} catch {
			showToast({ title: t.deleteFailed, children: shared.tryAgain, color: 'error' });
			setDeleting(false);
		}
	};

	// Deleting cannot be undone, so the dialog names what goes with it before it goes.
	const confirmDelete = () =>
		openModal({
			modalId: DELETE_MODAL,
			title: t.confirmTitle,
			closeOnClickOutside: true,
			closeOnEsc: true,
			children: (
				<div className="dialog">
					<p className="dialog__lead">{t.confirmLead(tasting.number, title, !!tasting.photoKey)}</p>
					{tasting.flight && (
						<p className="dialog__note">
							{t.confirmFlight(tasting.flight.wineNumber, tasting.flight.name)}
						</p>
					)}
					<p className="dialog__note">{t.cannotUndo}</p>
					<div className="dialog__actions">
						<button className="btn-quiet" onClick={() => closeModal(DELETE_MODAL)}>
							{t.keep}
						</button>
						<button className="btn-primary" onClick={deleteTasting}>
							{t.deleteTasting}
						</button>
					</div>
				</div>
			),
		});

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
	const finalFields = Object.fromEntries(
		FINAL_LABELS.filter(([key]) => final[key]).map(([key, label]) => [label, final[key]!]),
	);
	const initialFields: Record<string, string | string[] | null | undefined> = {
		[t.initial.grapeVarieties]: initial?.grapeVarieties,
		[t.initial.climate]: initial?.climate,
		[t.initial.possibleCountries]: initial?.possibleCountries,
		[t.initial.ageRange]: initial?.ageRange,
		[t.initial.worldOrigin]: initial?.worldOrigin,
	};
	const photoUrl = tasting.photoKey ? ClientPhotoService.url(tasting.photoKey) : null;

	return (
		<div className="tasting-detail">
			<div className="tasting-detail__top">
				{back}
				{tasting.number != null && <span>{list.tasting(tasting.number)}</span>}
			</div>

			<header className="tasting-detail__head">
				<div>
					<h1>{title}</h1>
					<p>{meta}</p>
					{tasting.flight && (
						<Link href={`/flights/${tasting.flight.code}`} className="text-link">
							{t.flight(tasting.flight.name, tasting.flight.wineNumber)}
						</Link>
					)}
				</div>
				{result && result.outOf > 0 && (
					<span className="figure figure--xl" aria-label={scorecard.scoreLabel(result.score, result.outOf)}>
						{result.score}
						<span className="figure__of"> / {result.outOf}</span>
					</span>
				)}
			</header>

			<RevealPanel
				tasting={tasting}
				title={title}
				openForm={openReveal}
				onRevealed={(updated) => setTasting(updated)}
			/>

			<section className="detail-card">
				<h2 className="detail-card__label">{t.sheet}</h2>
				<SheetPhase label={common.phase[grid].sight} data={tasting.sight} />
				<SheetPhase label={common.phase[grid].nose} data={tasting.nose} />
				<SheetPhase label={common.phase[grid].palate} data={tasting.palate} />
				<SheetPhase label={t.confirmNose} data={tasting.confirmNose ? { '': tasting.confirmNose } : null} />
				<SheetPhase label={common.phase[grid].initialConclusion} data={initialFields} />
				<SheetPhase label={common.phase[grid].finalConclusion} data={finalFields} />
			</section>

			{(photoUrl || tasting.notes) && (
				<section className="detail-card">
					<h2 className="detail-card__label">{photoUrl ? t.labelAndNotes : t.notes}</h2>
					{photoUrl && (
						<a
							href={photoUrl}
							target="_blank"
							rel="noopener"
							className="tasting-detail__photo"
							aria-label={t.openPhoto}
						>
							{/* Served by an authenticated route with its own caching; next/image's optimiser
							    would fetch it without the taster's cookie and get a 401. */}
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={photoUrl} alt={t.photoAlt(title)} />
						</a>
					)}
					{tasting.notes && <p className="tasting-detail__notes">{tasting.notes}</p>}
				</section>
			)}

			<div className="tasting-detail__actions">
				<button type="button" className="tasting-detail__delete" onClick={confirmDelete} disabled={deleting}>
					{t.deleteTasting}
				</button>
			</div>
		</div>
	);
}
