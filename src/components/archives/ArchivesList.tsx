'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconCheck, IconTrash } from '@tabler/icons-react';
import { useAuthProvider } from '../auth/AuthProvider';
import { useModalProvider } from '../modal/ModalProvider';
import { useToastProvider } from '../toast/ToastProvider';
import ClientTastingService from '../../services/client/ClientTastingService';
import { compareReveal, describeCall, describeWine, isRevealed, revealTitle } from '../../utils/revealScore';
import { type TastingData } from '../../types/TastingData';
import { formatDate } from '../../utils/DateUtils';
import { gridOf } from '../../data/grids';
import { useLang, useText } from '../../i18n/LanguageProvider';
import { archivesText } from '../../i18n/archives';
import { commonText } from '../../i18n/common';

const service = new ClientTastingService();

const DELETE_MODAL = 'tasting-delete';

type SavedTasting = TastingData & {
	id: string;
	number?: number;
	created_at?: string;
};

export default function ArchivesList() {
	const { user, isInitialLoading } = useAuthProvider();
	const [tastings, setTastings] = useState<SavedTasting[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadFailed, setLoadFailed] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const router = useRouter();
	const { openModal, closeModal } = useModalProvider();
	const { showToast } = useToastProvider();
	const { lang } = useLang();
	const { list: t, shared } = useText(archivesText);
	const common = useText(commonText);

	const deleteTasting = async (tasting: SavedTasting) => {
		closeModal(DELETE_MODAL);
		setDeletingId(tasting.id);
		try {
			await service.deleteTasting(tasting.id);
			setTastings((current) => current.filter((t) => t.id !== tasting.id));
			showToast({ title: t.deletedTitle, children: t.deleted(tasting.number) });
		} catch {
			showToast({ title: t.deleteFailed, children: shared.tryAgain, color: 'error' });
		} finally {
			setDeletingId(null);
		}
	};

	// Deleting cannot be undone, so the dialog names what goes with it before it goes.
	const confirmDelete = (tasting: SavedTasting, title: string) =>
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
						<button className="btn-primary" onClick={() => deleteTasting(tasting)}>
							<IconTrash size={16} />
							{t.deleteTasting}
						</button>
					</div>
				</div>
			),
		});

	useEffect(() => {
		if (isInitialLoading) {
			return;
		}
		if (!user) {
			router.push('/login?r=/archives');
			return;
		}
		service
			.getTastings()
			.then((data) => setTastings(data as SavedTasting[]))
			.catch(() => setLoadFailed(true))
			.finally(() => setIsLoading(false));
	}, [user, isInitialLoading, router]);

	if (isInitialLoading || isLoading) {
		return <div className="empty-state">{t.loading}</div>;
	}

	if (loadFailed) {
		return <div className="empty-state">{t.loadFailed}</div>;
	}

	if (tastings.length === 0) {
		return (
			<div className="empty-state archives-empty">
				<p>{t.empty}</p>
				<Link href="/tastings/start" className="btn-primary">
					{t.startFirst}
				</Link>
			</div>
		);
	}

	return (
		<div className="archives-grid">
			{/* First, not last: the list runs newest first, so a card at the end sank further out of
			    sight with every tasting saved. */}
			<Link href="/tastings/start" className="archive-card archive-card--new">
				<span className="archive-card__new-icon">+</span>
				<span className="archive-card__new-label">{t.newTasting}</span>
			</Link>

			{tastings.map((tasting) => {
				const final = (tasting.conclusion?.final as Record<string, string | null>) ?? {};
				const grid = gridOf(tasting.grid);
				const callSummary = describeCall(final, grid) || null;

				// Revealed: the wine is the title and the call a line beneath it, as on the detail page.
				const revealed = isRevealed(tasting.reveal);
				const comparison = revealed ? compareReveal(final, tasting.reveal!, null, grid, lang) : null;
				const title = revealed
					? revealTitle(tasting.reveal!, lang)
					: tasting.wineName || final.grapeVariety || shared.untitled;
				const subtitle = revealed ? describeWine(tasting.reveal) || null : callSummary;
				const perfect = comparison !== null && comparison.outOf > 0 && comparison.score === comparison.outOf;

				const date = tasting.created_at ? formatDate(tasting.created_at, lang) : null;

				return (
					// Not a link itself: a button cannot sit inside one. The Details link stretches over
					// the whole card instead (see .archive-card__link), with Delete raised above it.
					<article key={tasting.id} className="archive-card">
						<div className="archive-card__top">
							<div className="archive-card__badges">
								<span className={`wine-type-badge wine-type-badge--${tasting.wineType?.toLowerCase()}`}>
									{tasting.wineType === 'Red'
										? common.redWine
										: tasting.wineType === 'White'
											? common.whiteWine
											: ''}
								</span>
								{grid === 'wset' && <span className="grid-badge">{common.grid.wset.short}</span>}
								{comparison ? (
									<span
										className="score-tag"
										title={t.score(comparison.score, comparison.outOf)}
										aria-label={t.score(comparison.score, comparison.outOf)}
									>
										{perfect && <IconCheck size={11} stroke={2.5} aria-hidden="true" />}
										{comparison.score} / {comparison.outOf}
									</span>
								) : tasting.flight ? (
									<span className="archive-card__waiting">{t.awaitingHost}</span>
								) : (
									<Link
										href={`/archives/${tasting.id}?reveal=1`}
										className="archive-card__reveal"
										aria-label={t.revealFor(title)}
									>
										{t.reveal}
									</Link>
								)}
							</div>
							{tasting.number != null && (
								<span className="archive-card__id">{shared.number(tasting.number)}</span>
							)}
						</div>

						<h3 className="archive-card__title">{title}</h3>
						{subtitle && <p className="archive-card__subtitle">{subtitle}</p>}
						{revealed && callSummary && (
							<p className="archive-card__call">
								<span className="archive-card__call-label">{shared.yourCall}</span>
								{callSummary}
							</p>
						)}

						{tasting.notes && (
							<div className="archive-card__conclusions">
								<div className="archive-card__conclusions-label">{t.keyConclusions}</div>
								<p className="archive-card__conclusions-text">&ldquo;{tasting.notes}&rdquo;</p>
							</div>
						)}

						<div className="archive-card__footer">
							{date && <span className="archive-card__date">{date}</span>}
							<div className="archive-card__actions">
								<button
									className="archive-card__delete"
									onClick={() => confirmDelete(tasting, title)}
									disabled={deletingId === tasting.id}
									aria-label={t.deleteLabel(tasting.number, title)}
									title={t.deleteTasting}
								>
									<IconTrash size={15} />
								</button>
								<Link
									href={`/archives/${tasting.id}`}
									className="archive-card__details archive-card__link"
									aria-label={t.viewDetails(title)}
								>
									{t.details}
								</Link>
							</div>
						</div>
					</article>
				);
			})}
		</div>
	);
}
