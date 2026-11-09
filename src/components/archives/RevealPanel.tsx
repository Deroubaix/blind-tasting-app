'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IconArrowRight, IconExternalLink, IconX } from '@tabler/icons-react';
import { type TastingData } from '../../types/TastingData';
import ClientTastingService from '../../services/client/ClientTastingService';
import ClientPhotoService from '../../services/client/ClientPhotoService';
import { useToastProvider } from '../toast/ToastProvider';
import { JsonApiError } from '../../utils/ErrorUtils';
import RevealFields from './RevealFields';
import RevealScorecard from './RevealScorecard';
import { type Reveal, compareReveal, isRevealed } from '../../utils/revealScore';
import { gridOf } from '../../data/grids';
import { useLang, useText } from '../../i18n/LanguageProvider';
import { archivesText } from '../../i18n/archives';
import { commonText } from '../../i18n/common';

const service = new ClientTastingService();

type SavedTasting = TastingData & { id: string; created_at: string };

/**
 * The reveal on a saved tasting, in one of three states: an invitation while the wine is still a
 * mystery, the form, and — once revealed — the scorecard comparing the call with the label.
 */
export default function RevealPanel({
	tasting,
	title,
	openForm = false,
	onRevealed,
}: {
	tasting: SavedTasting;
	title: string;
	/** Start on the form rather than the invitation — the archive card's Reveal button. */
	openForm?: boolean;
	onRevealed: (tasting: SavedTasting) => void;
}) {
	const revealed = isRevealed(tasting.reveal);
	const flight = tasting.flight;
	const grid = gridOf(tasting.grid);
	const [editing, setEditing] = useState(openForm && !revealed && !flight);
	const [draft, setDraft] = useState<Reveal>(() => ({ ...(tasting.reveal ?? {}) }));
	const [saving, setSaving] = useState(false);
	const { showToast } = useToastProvider();
	const { lang } = useLang();
	const { panel: t, shared } = useText(archivesText);
	const common = useText(commonText);

	const startEditing = () => {
		setDraft({ ...(tasting.reveal ?? {}) });
		setEditing(true);
	};

	const save = async () => {
		setSaving(true);
		try {
			const updated = await service.saveReveal(tasting.id, draft);
			onRevealed(updated);
			setEditing(false);
			showToast({
				title: isRevealed(updated.reveal) ? t.revealedTitle : t.clearedTitle,
				children: isRevealed(updated.reveal) ? t.revealedBody : t.clearedBody,
				color: 'success',
			});
		} catch (error) {
			showToast({
				title: t.notSaved,
				children: JsonApiError.create(error).message || shared.tryAgain,
				color: 'error',
			});
		} finally {
			setSaving(false);
		}
	};

	if (editing) {
		const photoUrl = tasting.photoKey ? ClientPhotoService.url(tasting.photoKey) : null;
		return (
			<section className="reveal-card reveal-form" aria-labelledby="reveal-form-heading">
				{/* Phone only: the form is a full-screen sheet with its own header. */}
				<div className="reveal-form__sheet-head">
					<button
						type="button"
						className="reveal-form__close"
						onClick={() => setEditing(false)}
						aria-label={common.close}
					>
						<IconX size={22} aria-hidden="true" />
					</button>
					<div className="reveal-form__sheet-title">
						<span>{t.revealWine}</span>
						<span className="reveal-form__sheet-sub">
							{shared.number(tasting.number)}
							{tasting.wineName ? ` · ${tasting.wineName}` : ''}
						</span>
					</div>
				</div>

				<div className="reveal-form__body">
					<span className="page-eyebrow page-eyebrow--plain">{t.eyebrow}</span>
					<h2 className="reveal-heading" id="reveal-form-heading">
						{t.formHeading}
					</h2>
					<p className="reveal-lede">{t.formLede}</p>

					<div className={`reveal-form__layout${photoUrl ? ' reveal-form__layout--photo' : ''}`}>
						{photoUrl && (
							<a
								href={photoUrl}
								target="_blank"
								rel="noopener"
								className="reveal-form__photo"
								aria-label={t.openLabelPhoto}
							>
								{/* Authenticated route; next/image's optimiser would fetch it without the cookie. */}
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={photoUrl} alt={t.labelPhotoAlt(title)} />
								<span className="reveal-form__photo-caption">
									{t.labelPhoto} <IconExternalLink size={13} aria-hidden="true" />
								</span>
							</a>
						)}
						<RevealFields
							grid={grid}
							value={draft}
							onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
						/>
					</div>
				</div>

				<div className="reveal-form__actions">
					<button type="button" className="btn-primary reveal-form__save" onClick={save} disabled={saving}>
						{saving ? t.saving : t.saveReveal}
					</button>
					<button type="button" className="btn-quiet reveal-form__cancel" onClick={() => setEditing(false)}>
						{common.cancel}
					</button>
					<span className="reveal-form__footnote">{t.footnote}</span>
				</div>
			</section>
		);
	}

	if (revealed) {
		const comparison = compareReveal(
			tasting.conclusion?.final,
			tasting.reveal as Reveal,
			tasting.conclusion?.initial,
			grid,
			lang,
		);
		return flight ? (
			<RevealScorecard
				comparison={comparison}
				flightHref={`/flights/${flight.code}/wines/${flight.wineNumber}`}
			/>
		) : (
			<RevealScorecard comparison={comparison} onEdit={startEditing} />
		);
	}

	// A flight wine is revealed once, by the host, for everyone who tasted it.
	if (flight) {
		return (
			<section className="reveal-card reveal-invite" aria-labelledby="reveal-invite-heading">
				<div className="reveal-invite__text">
					<span className="page-eyebrow page-eyebrow--plain">{t.eyebrow}</span>
					<h2 className="reveal-heading" id="reveal-invite-heading">
						{t.waitingHeading}
					</h2>
					<p className="reveal-lede">{t.waitingLede(flight.wineNumber, flight.name)}</p>
				</div>
				<Link href={`/flights/${flight.code}`} className="btn-primary reveal-invite__btn">
					{t.openFlight}
					<IconArrowRight size={16} aria-hidden="true" />
				</Link>
			</section>
		);
	}

	return (
		<section className="reveal-card reveal-invite" aria-labelledby="reveal-invite-heading">
			<div className="reveal-invite__text">
				<span className="page-eyebrow page-eyebrow--plain">{t.eyebrow}</span>
				<h2 className="reveal-heading" id="reveal-invite-heading">
					{t.inviteHeading}
				</h2>
				<p className="reveal-lede">{grid === 'wset' ? t.inviteWset : t.inviteCms}</p>
			</div>
			<button type="button" className="btn-primary reveal-invite__btn" onClick={startEditing}>
				{t.revealWine}
				<IconArrowRight size={16} aria-hidden="true" />
			</button>
		</section>
	);
}
