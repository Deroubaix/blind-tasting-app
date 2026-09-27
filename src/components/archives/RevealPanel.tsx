'use client';

import { useState } from 'react';
import { IconArrowRight, IconExternalLink, IconX } from '@tabler/icons-react';
import { type TastingData } from '../../types/TastingData';
import ClientTastingService from '../../services/client/ClientTastingService';
import ClientPhotoService from '../../services/client/ClientPhotoService';
import { useToastProvider } from '../../toast/ToastProvider';
import { JsonApiError } from '../../utils/ErrorUtils';
import RevealFields from './RevealFields';
import RevealScorecard from './RevealScorecard';
import { type Reveal, compareReveal, isRevealed } from './revealScore';

const service = new ClientTastingService();

type SavedTasting = TastingData & { id: string; created_at: string };

/**
 * The reveal on a saved tasting, in one of three states: an invitation while the wine is still a
 * mystery, the form, and — once revealed — the scorecard comparing the call with the label.
 */
export default function RevealPanel({
	tasting,
	title,
	onRevealed,
}: {
	tasting: SavedTasting;
	title: string;
	onRevealed: (tasting: SavedTasting) => void;
}) {
	const revealed = isRevealed(tasting.reveal);
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState<Reveal>({});
	const [saving, setSaving] = useState(false);
	const { showToast } = useToastProvider();

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
				title: isRevealed(updated.reveal) ? 'Wine revealed' : 'Reveal cleared',
				children: isRevealed(updated.reveal)
					? 'Your call has been scored against the label.'
					: 'With no fields filled in, the tasting is back to unrevealed.',
				color: 'success',
			});
		} catch (error) {
			showToast({
				title: 'Reveal not saved',
				children: JsonApiError.create(error).message || 'Something went wrong. Please try again.',
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
						aria-label="Close"
					>
						<IconX size={22} aria-hidden="true" />
					</button>
					<div className="reveal-form__sheet-title">
						<span>Reveal the wine</span>
						<span className="reveal-form__sheet-sub">
							No. {tasting.number}
							{tasting.wineName ? ` · ${tasting.wineName}` : ''}
						</span>
					</div>
				</div>

				<div className="reveal-form__body">
					<span className="reveal-eyebrow">The reveal</span>
					<h2 className="reveal-form__heading" id="reveal-form-heading">
						What was in the glass?
					</h2>
					<p className="reveal-form__lede">
						Copy it from the label. Your call stays exactly as you saved it.
					</p>

					<div className={`reveal-form__layout${photoUrl ? ' reveal-form__layout--photo' : ''}`}>
						{photoUrl && (
							<a
								href={photoUrl}
								target="_blank"
								rel="noopener"
								className="reveal-form__photo no-underline"
								aria-label="Open your label photo full size"
							>
								{/* Authenticated route; next/image's optimiser would fetch it without the cookie. */}
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={photoUrl} alt={`Label photo for ${title}`} />
								<span className="reveal-form__photo-caption">
									Your label photo <IconExternalLink size={13} aria-hidden="true" />
								</span>
							</a>
						)}
						<RevealFields value={draft} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} />
					</div>
				</div>

				<div className="reveal-form__actions">
					<button type="button" className="btn-primary reveal-form__save" onClick={save} disabled={saving}>
						{saving ? 'Saving…' : 'Save reveal'}
					</button>
					<button
						type="button"
						className="reveal-btn-quiet reveal-form__cancel"
						onClick={() => setEditing(false)}
					>
						Cancel
					</button>
					<span className="reveal-form__footnote">You can edit the reveal at any time.</span>
				</div>
			</section>
		);
	}

	if (revealed) {
		const comparison = compareReveal(
			tasting.conclusion?.final,
			tasting.reveal as Reveal,
			tasting.conclusion?.initial,
		);
		return <RevealScorecard comparison={comparison} onEdit={startEditing} />;
	}

	return (
		<section className="reveal-card reveal-invite" aria-labelledby="reveal-invite-heading">
			<div className="reveal-invite__text">
				<span className="reveal-eyebrow">The reveal</span>
				<h2 className="reveal-invite__heading" id="reveal-invite-heading">
					Bottle unwrapped?
				</h2>
				<p className="reveal-invite__lede">
					Enter what&apos;s on the label. Your call is compared with it, field by field, and scored.
				</p>
			</div>
			<button type="button" className="btn-primary reveal-invite__btn" onClick={startEditing}>
				Reveal the wine
				<IconArrowRight size={16} aria-hidden="true" />
			</button>
		</section>
	);
}
