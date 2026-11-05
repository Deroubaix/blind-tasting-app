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

const isHit = (field: ComparedField) => field.status === 'correct' || field.status === 'na';

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

/** A correct or not-applicable field: one quiet line. */
function HitRow({ field }: { field: ComparedField }) {
	const word = useText(archivesText).scorecard.status[field.status];
	const Icon = STATUS_ICON[field.status];
	return (
		<li className={`reveal-hit reveal-hit--${field.status}`}>
			<Icon size={16} stroke={2} className="reveal-hit__icon" aria-hidden="true" />
			<span className="reveal-hit__label">{field.label}</span>
			<span className="reveal-hit__value">
				{field.actual ?? <span className="reveal-muted-italic">{field.note}</span>}
				{field.actual && field.note && <span className="reveal-hit__note">{field.note}</span>}
			</span>
			<span className="reveal-hit__word">{word}</span>
		</li>
	);
}

/** A miss (close, wrong, not called): opened out, your call struck through above the actual. */
function MissRow({ field }: { field: ComparedField }) {
	const { shared, scorecard: t } = useText(archivesText);
	return (
		<li className={`reveal-miss reveal-miss--${field.status}`}>
			<div className="reveal-miss__head">
				<span className="reveal-miss__label">{field.label}</span>
				<StatusBadge status={field.status} />
			</div>
			<dl className="reveal-miss__pair">
				<dt>{shared.yourCall}</dt>
				<dd className="reveal-miss__call">
					{field.call ? <s>{field.call}</s> : <span className="reveal-muted-italic">{t.leftBlank}</span>}
				</dd>
				<dt>{t.actual}</dt>
				<dd className="reveal-miss__actual">
					<span>{field.actual}</span>
				</dd>
			</dl>
			{field.note && <p className="reveal-miss__note">{field.note}</p>}
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
	const { panel, scorecard: t } = useText(archivesText);
	const { fields, score, outOf, headline, detail, shortlist } = comparison;
	const shortlistItems = [
		{ text: t.theGrape, held: shortlist.grape },
		{ text: t.theCountry, held: shortlist.country },
	].filter((item) => item.held !== null);

	return (
		<section className="reveal-card reveal-scorecard" aria-labelledby="reveal-score-heading">
			<div className="reveal-scorecard__summary">
				<span className="accent-label" id="reveal-score-heading">
					{panel.eyebrow}
				</span>
				<p className="reveal-score" aria-label={t.scoreLabel(score, outOf)}>
					<span className="reveal-score__value">{score}</span>
					<span className="reveal-score__of">/ {outOf}</span>
				</p>
				<div>
					<p className="reveal-scorecard__headline">{headline}</p>
					<p className="reveal-scorecard__detail">{detail}</p>
				</div>
				{/* Decorative: each row below states its result in words. */}
				<ol className="reveal-strip" aria-hidden="true">
					{fields.map((field) => {
						const Icon = STATUS_ICON[field.status];
						return (
							<li key={field.key} className={`reveal-strip__item reveal-strip__item--${field.status}`}>
								<span className="reveal-strip__bar" />
								<Icon size={12} stroke={2.2} />
								<span className="reveal-strip__abbr">{field.abbr}</span>
							</li>
						);
					})}
				</ol>
				{shortlistItems.length > 0 && (
					<div className="reveal-shortlist">
						<span>{t.shortlistIncluded}</span>
						{shortlistItems.map((item) => (
							<span key={item.text} className="reveal-shortlist__item">
								<span>{item.text}</span>
								<span
									className={`reveal-shortlist__answer reveal-shortlist__answer--${item.held ? 'yes' : 'no'}`}
								>
									{item.held ? (
										<IconCheck size={12} stroke={2.2} aria-hidden="true" />
									) : (
										<IconX size={12} stroke={2.2} aria-hidden="true" />
									)}
									{item.held ? t.yes : t.no}
								</span>
							</span>
						))}
					</div>
				)}
			</div>

			<div className="reveal-scorecard__fields">
				<div className="reveal-scorecard__fields-head">
					<span className="reveal-scorecard__fields-title">{t.fieldByField}</span>
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
				<ul className="reveal-rows">
					{fields.map((field) =>
						isHit(field) ? (
							<HitRow key={field.key} field={field} />
						) : (
							<MissRow key={field.key} field={field} />
						),
					)}
				</ul>
			</div>
		</section>
	);
}
