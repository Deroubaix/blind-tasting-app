'use client';

import Link from 'next/link';
import Mark from '../misc/Mark';
import { type Comparison, type ComparedField, type FieldStatus } from '../../utils/revealScore';
import { useText } from '../../i18n/LanguageProvider';
import { archivesText } from '../../i18n/archives';
import { useFieldValue } from '../../i18n/useTerm';

/** The mark with its word under it, so no status relies on the mark alone. */
export function StatusBadge({ status }: { status: FieldStatus }) {
	const word = useText(archivesText).scorecard.status[status];
	return (
		<span className={`reveal-status reveal-status--${status}`}>
			<Mark status={status} size={22} />
			<span className="reveal-status__word">{word}</span>
		</span>
	);
}

/** One field: your call, the label's correction under it where it differs, and the mark. */
function FieldRow({ field }: { field: ComparedField }) {
	const { scorecard: t } = useText(archivesText);
	const show = useFieldValue();
	const differs = field.status !== 'correct' && field.actual;
	return (
		<li className="scorecard__row">
			<span className="scorecard__field">{field.label}</span>
			<span className="scorecard__call">
				{field.call ? show(field.key, field.call) : <span className="scorecard__blank">{t.leftBlank}</span>}
				{differs && (
					<span className="scorecard__fix">
						<span className="visually-hidden">{t.label}: </span>
						{show(field.key, field.actual!)}
					</span>
				)}
				{field.note && <span className="scorecard__note">{field.note}</span>}
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
