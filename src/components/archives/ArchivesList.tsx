'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconCheck, IconTrash } from '@tabler/icons-react';
import { useAuthProvider } from '../auth/AuthProvider';
import { useModalProvider } from '../modal/ModalProvider';
import { useToastProvider } from '../../toast/ToastProvider';
import ClientTastingService from '../../services/client/ClientTastingService';
import { compareReveal, describeWine, isRevealed, revealTitle } from './revealScore';
import { type TastingData } from '../../types/TastingData';

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
	const [error, setError] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const router = useRouter();
	const { openModal, closeModal } = useModalProvider();
	const { showToast } = useToastProvider();

	const deleteTasting = async (tasting: SavedTasting) => {
		closeModal(DELETE_MODAL);
		setDeletingId(tasting.id);
		try {
			await service.deleteTasting(tasting.id);
			setTastings((current) => current.filter((t) => t.id !== tasting.id));
			showToast({ title: 'Tasting deleted', children: `No. ${tasting.number} has been deleted.` });
		} catch {
			showToast({ title: 'Delete failed', children: 'Something went wrong. Please try again.', color: 'error' });
		} finally {
			setDeletingId(null);
		}
	};

	// Deleting cannot be undone, so the dialog names what goes with it before it goes.
	const confirmDelete = (tasting: SavedTasting, title: string) =>
		openModal({
			modalId: DELETE_MODAL,
			title: 'Delete this tasting?',
			closeOnClickOutside: true,
			closeOnEsc: true,
			children: (
				<div className="confirm-dialog">
					<p className="confirm-dialog__lead">
						No. {tasting.number}, {title}, will be deleted for good
						{tasting.photoKey ? ', along with its photo' : ''}.
					</p>
					<p className="confirm-dialog__note">This cannot be undone.</p>
					<div className="confirm-dialog__actions">
						<button className="outline confirm-dialog__cancel" onClick={() => closeModal(DELETE_MODAL)}>
							Keep it
						</button>
						<button className="btn-primary confirm-dialog__confirm" onClick={() => deleteTasting(tasting)}>
							<IconTrash size={16} />
							Delete tasting
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
			.catch(() => setError('Failed to load tastings.'))
			.finally(() => setIsLoading(false));
	}, [user, isInitialLoading, router]);

	if (isInitialLoading || isLoading) {
		return <div className="archives-loading">Loading your tastings…</div>;
	}

	if (error) {
		return <div className="archives-error">{error}</div>;
	}

	if (tastings.length === 0) {
		return (
			<div className="archives-empty">
				<p>You have no saved tastings yet.</p>
				<Link href="/tastings/start" className="btn-primary no-underline">
					Start Your First Tasting
				</Link>
			</div>
		);
	}

	return (
		<div className="archives-grid">
			{/* First, not last: the list runs newest first, so a card at the end sank further out of
			    sight with every tasting saved. */}
			<Link href="/tastings/start" className="archive-card archive-card--new no-underline">
				<span className="archive-card__new-icon">+</span>
				<span className="archive-card__new-label">New Tasting</span>
			</Link>

			{tastings.map((tasting) => {
				const final = (tasting.conclusion?.final as Record<string, string | null>) ?? {};
				const callSummary = describeWine(final) || null;

				// Revealed: the wine is the title and the call a line beneath it, as on the detail page.
				const revealed = isRevealed(tasting.reveal);
				const comparison = revealed ? compareReveal(final, tasting.reveal!) : null;
				const title = revealed
					? revealTitle(tasting.reveal!)
					: tasting.wineName || final.grapeVariety || 'Untitled Tasting';
				const subtitle = revealed ? describeWine(tasting.reveal) : callSummary;
				const perfect = comparison !== null && comparison.outOf > 0 && comparison.score === comparison.outOf;

				const date = tasting.created_at
					? new Date(tasting.created_at).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: '2-digit',
						})
					: null;

				return (
					// Not a link itself: a button cannot sit inside one. The Details link stretches over
					// the whole card instead (see .archive-card__link), with Delete raised above it.
					<article key={tasting.id} className="archive-card">
						<div className="archive-card__top">
							<div className="archive-card__badges">
								<span className={`wine-type-badge wine-type-badge--${tasting.wineType?.toLowerCase()}`}>
									{tasting.wineType} Wine
								</span>
								{comparison ? (
									<span
										className="archive-card__score"
										title={`Score: ${comparison.score} of ${comparison.outOf}`}
										aria-label={`Score: ${comparison.score} of ${comparison.outOf}`}
									>
										{perfect && <IconCheck size={11} stroke={2.5} aria-hidden="true" />}
										{comparison.score} / {comparison.outOf}
									</span>
								) : (
									<span className="archive-card__unrevealed">Not revealed</span>
								)}
							</div>
							{tasting.number != null && <span className="archive-card__id">No. {tasting.number}</span>}
						</div>

						<h3 className="archive-card__title">{title}</h3>
						{subtitle && <p className="archive-card__subtitle">{subtitle}</p>}
						{revealed && callSummary && (
							<p className="archive-card__call">
								<span className="archive-card__call-label">Your call</span>
								{callSummary}
							</p>
						)}

						{tasting.notes && (
							<div className="archive-card__conclusions">
								<div className="archive-card__conclusions-label">Key Conclusions</div>
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
									aria-label={`Delete No. ${tasting.number}, ${title}`}
									title="Delete tasting"
								>
									<IconTrash size={15} />
								</button>
								<Link
									href={`/archives/${tasting.id}`}
									className="archive-card__details archive-card__link no-underline"
									aria-label={`View details for ${title}`}
								>
									Details →
								</Link>
							</div>
						</div>
					</article>
				);
			})}
		</div>
	);
}
