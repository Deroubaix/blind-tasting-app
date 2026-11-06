'use client';

import Link from 'next/link';
import { IconBan, IconCheck, IconMinus, IconTilde, IconX } from '@tabler/icons-react';
import { type Comparison, type ComparedField, type FieldStatus } from '../../utils/revealScore';
import { useText } from '../../i18n/LanguageProvider';
import { archivesText } from '../../i18n/archives';

/** Every status has an icon and a word (scorecard.status), so none relies on colour alone. */
const STATUS_ICON: Record<FieldStatus, typeof IconCheck> = {
	correct: IconCheck,
	close: IconTilde,
	wrong: IconX,
	notcalled: IconMinus,
	na: IconBan,
};

export function StatusBadge({ status }: { status: FieldStatus }) {
	const word = useText(archivesText).scorecard.status[status];
	const Icon = STATUS_ICON[status];
	return (
		<span className={`reveal-status reveal-status--${status}`}>
			<Icon size={12} stroke={2.2} aria-hidden="true" />
			{word}
		</span>
	);
}

/** One field: your call, the label where it differs, and the result. */
function FieldRow({ field }: { field: ComparedField }) {
	const { scorecard: t } = useText(archivesText);
	const differs = field.status !== 'correct' && field.actual;
	return (
		<li className="scorecard__row">
			<span>
				<span className="scorecard__field">{field.label}</span>
				{field.call ?? <span className="scorecard__blank">{t.leftBlank}</span>}
				{(differs || field.note) && (
					<span className="scorecard__label">
						{differs && (
							<>
								{t.label}: <b>{field.actual}</b>
							</>
						)}
						{differs && field.note && ' · '}
						{field.note}
					</span>
				)}
			</span>
			<StatusBadge status={field.status} />
		</li>
	);
}

export default function RevealScorecard({
	comparison,
	onEdit,
	flightHref,
}: {
	comparison: Comparison;
	/** Absent for a flight wine: the host owns its reveal. */
	onEdit?: () => void;
	flightHref?: string;
}) {
	const { scorecard: t } = useText(archivesText);
	const { fields, shortlist } = comparison;
	const shortlistItems = [
		{ text: t.theGrape, held: shortlist.grape },
		{ text: t.theCountry, held: shortlist.country },
	].filter((item) => item.held !== null);

	return (
		<section className="detail-card scorecard" aria-labelledby="scorecard-heading">
			<div className="detail-card__head">
				<h2 className="detail-card__label" id="scorecard-heading">
					{t.againstLabel}
				</h2>
				{onEdit ? (
					<button type="button" className="btn-quiet btn-quiet--sm" onClick={onEdit}>
						{t.editReveal}
					</button>
				) : (
					flightHref && (
						<Link href={flightHref} className="btn-quiet btn-quiet--sm">
							{t.flightResults}
						</Link>
					)
				)}
			</div>
			<ul className="scorecard__rows">
				{fields.map((field) => (
					<FieldRow key={field.key} field={field} />
				))}
			</ul>
			{shortlistItems.length > 0 && (
				<p className="scorecard__shortlist">
					{t.shortlistIncluded}{' '}
					{shortlistItems.map((item, i) => (
						<span key={item.text}>
							{i > 0 && ' · '}
							{item.text}: <b>{item.held ? t.yes : t.no}</b>
						</span>
					))}
				</p>
			)}
			<p className="scorecard__foot">{t.footnote}</p>
		</section>
	);
}
