import Link from 'next/link';
import { StatusBadge } from '../archives/RevealScorecard';
import { REVEAL_FIELDS } from '../archives/revealScore';
import { TIMER_PRESETS, formatTimerSeconds } from '../../data/timerData';
import {
	PHASES,
	SAMPLE_ARCHIVE,
	SAMPLE_FLIGHT,
	SAMPLE_LABEL,
	SAMPLE_REVEAL,
	SAMPLE_STRUCTURE,
	SAMPLE_TITLE,
} from './homeSamples';

const COLUMNS: Record<string, string> = {
	grapeVariety: 'Grape',
	countryOfOrigin: 'Country',
	regionAppellation: 'Region',
	qualityLevel: 'Quality',
	vintage: 'Vintage',
};

const shortLevel = (level: string) => level.replace('Medium', 'Med');

/** "3 / 5" in the ledger's serif figures, with a quieter denominator. */
export function Figure({
	score,
	outOf,
	size = 'md',
}: {
	score: number | string;
	outOf?: number;
	size?: 'sm' | 'md' | 'lg';
}) {
	return (
		<span className={`home-figure home-figure--${size}`}>
			{score}
			{outOf !== undefined && <span> / {outOf}</span>}
		</span>
	);
}

/** Section frame: a folio number in the margin, like a ledger's page numbers. */
export function Folio({
	n,
	id,
	tint,
	children,
}: {
	n: number;
	id?: string;
	tint?: boolean;
	children: React.ReactNode;
}) {
	return (
		<section id={id} className={`home-section${tint ? ' home-section--tint' : ''}`}>
			<div className="home-section__inner">
				<span className="home-folio" aria-hidden="true">
					§ {n}
				</span>
				<div className="home-section__body">{children}</div>
			</div>
		</section>
	);
}

/** The hero's scorecard: the sample call, one row per field, totalled under a double rule. */
export function RevealCard() {
	return (
		<article className="home-card home-reveal" aria-label="A sample reveal">
			<div className="home-card__top">
				<span className="home-kicker">The reveal</span>
				<span className="home-no">No. 24</span>
			</div>
			<p className="home-card__title">{SAMPLE_TITLE}</p>
			<ol className="home-rows">
				{SAMPLE_REVEAL.fields.map((field, i) => (
					<li key={field.key} className="home-row">
						<span className="home-row__n">{String(i + 1).padStart(2, '0')}</span>
						<span className="home-row__text">
							<span className="home-label">{COLUMNS[field.key]}</span>
							<span>{field.call}</span>
						</span>
						<StatusBadge status={field.status} />
					</li>
				))}
			</ol>
			<div className="home-total">
				<span>{SAMPLE_REVEAL.detail}</span>
				<Figure score={SAMPLE_REVEAL.score} outOf={SAMPLE_REVEAL.outOf} size="lg" />
			</div>
		</article>
	);
}

/** § 1: the same reveal as a full table — your call, the label, the result. */
export function RevealTable() {
	return (
		<div className="home-card home-table" role="table" aria-label="Your call against the label">
			<div className="home-table__row home-table__row--head" role="row">
				<span role="columnheader" aria-label="Row" />
				<span role="columnheader">Field</span>
				<span role="columnheader">Your call</span>
				<span role="columnheader">The label</span>
				<span role="columnheader">Result</span>
			</div>
			{SAMPLE_REVEAL.fields.map((field, i) => (
				<div key={field.key} className="home-table__row" role="row">
					<span role="cell" className="home-row__n">
						{String(i + 1).padStart(2, '0')}
					</span>
					<span role="cell" className="home-table__field">
						{COLUMNS[field.key]}
					</span>
					<span role="cell" className="home-muted">
						{field.call}
					</span>
					<span role="cell" className="home-table__label">
						<strong>{field.actual}</strong>
						{field.note && <span className="home-muted">{field.note}</span>}
					</span>
					<span role="cell" className="home-table__result">
						<StatusBadge status={field.status} />
					</span>
				</div>
			))}
			<div className="home-total">
				<span>
					{SAMPLE_REVEAL.headline} · {SAMPLE_REVEAL.detail.toLowerCase()}
				</span>
				<Figure score={SAMPLE_REVEAL.score} outOf={SAMPLE_REVEAL.outOf} size="lg" />
			</div>
			<div className="home-legend" aria-hidden="true">
				{(['correct', 'close', 'wrong', 'notcalled', 'na'] as const).map((status) => (
					<StatusBadge key={status} status={status} />
				))}
			</div>
		</div>
	);
}

function ScaleRow({ attr }: { attr: (typeof SAMPLE_STRUCTURE)[number] }) {
	const last = attr.levels.length - 1;
	const levels = attr.calls.map((c) => c.level);
	const [min, max] = [Math.min(...levels), Math.max(...levels)];
	const pos = (level: number) => `${(level / last) * 100}%`;
	const word = attr.agreement === 'split' ? 'Split' : attr.agreement === 'near' ? 'Near' : 'Agreed';
	return (
		<li className={`home-scale home-scale--${attr.agreement}`}>
			<span className="home-scale__name">
				{attr.name === 'Length of Finish' ? 'Finish' : attr.name === 'Tannin Volume' ? 'Tannin' : attr.name}
			</span>
			<span className="home-scale__track" role="img" aria-label={`${attr.name}: ${attr.phrase}`}>
				<span className="home-scale__line" />
				{max > min && (
					<span
						className="home-scale__range"
						style={{ left: pos(min), width: `calc(${pos(max)} - ${pos(min)})` }}
					/>
				)}
				{attr.levels.map((level, index) => {
					const here = attr.calls.filter((c) => c.level === index);
					return (
						<span key={level} className="home-scale__stop" style={{ left: pos(index) }}>
							<span className="home-scale__dots">
								{here.map((c) => {
									const taster = SAMPLE_FLIGHT.find((t) => t.id === c.personId)!;
									return (
										<span
											key={c.personId}
											className={`home-dot home-dot--t${taster.tint}`}
											title={taster.name}
										>
											{taster.initial}
										</span>
									);
								})}
							</span>
							<span className={`home-scale__tick${here.length ? ' home-scale__tick--on' : ''}`}>
								{shortLevel(level)}
							</span>
						</span>
					);
				})}
			</span>
			<span className="home-scale__verdict">
				<span className={`home-agreement home-agreement--${attr.agreement}`}>{word}</span>
				<span className="home-muted">{attr.phrase}</span>
			</span>
		</li>
	);
}

/** § 2's results: the label as the answer key, one row per taster, and the group's structure. */
export function FlightPreview() {
	const scores = SAMPLE_FLIGHT.map((t) => t.result.score);
	const average = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
	const outOf = SAMPLE_REVEAL.outOf;
	const splits = SAMPLE_STRUCTURE.filter((attr) => attr.agreement === 'split').length;
	const tannin = SAMPLE_STRUCTURE.find((attr) => attr.name === 'Tannin Volume');

	return (
		<div className="home-card home-flight">
			<div className="home-flight__head">
				<span className="home-no">Wine 3 of 6</span>
				<strong>{SAMPLE_TITLE}</strong>
				<span className="home-muted">Tuesday study group</span>
				<span className="home-flight__stat">
					Group average <Figure score={average} outOf={outOf} />
				</span>
				<span className="home-flight__stat">
					Best <Figure score={Math.max(...scores)} outOf={outOf} />
				</span>
			</div>

			{/* Desktop and tablet: the full table (cards below 1000px, via CSS). */}
			<div className="home-ftable" role="table" aria-label="Each taster's call against the label">
				<div className="home-ftable__row home-ftable__row--head" role="row">
					<span role="columnheader">Taster</span>
					{REVEAL_FIELDS.map((f) => (
						<span key={f.key} role="columnheader">
							{COLUMNS[f.key]}
						</span>
					))}
					<span role="columnheader" className="home-ftable__score-col">
						Score
					</span>
				</div>
				<div className="home-ftable__row home-ftable__row--label" role="row">
					<span role="rowheader" className="home-ftable__who">
						<span className="home-kicker">The label</span>
					</span>
					{REVEAL_FIELDS.map((f) => (
						<span key={f.key} role="cell" className="home-ftable__cell" data-col={COLUMNS[f.key]}>
							<strong>{SAMPLE_LABEL[f.key]}</strong>
						</span>
					))}
					<span role="cell" />
				</div>
				{SAMPLE_FLIGHT.map((t) => (
					<div key={t.id} className="home-ftable__row" role="row">
						<span role="rowheader" className="home-ftable__who">
							<span className={`home-dot home-dot--t${t.tint}`} aria-hidden="true">
								{t.initial}
							</span>
							{t.name}
						</span>
						{t.result.fields.map((field) => (
							<span
								key={field.key}
								role="cell"
								className="home-ftable__cell"
								data-col={COLUMNS[field.key]}
							>
								<span className={field.status === 'correct' ? '' : 'home-muted'}>{field.call}</span>
								<StatusBadge status={field.status} />
							</span>
						))}
						<span role="cell" className="home-ftable__score">
							<Figure score={t.result.score} outOf={t.result.outOf} />
						</span>
					</div>
				))}
				<div className="home-ftable__row home-ftable__row--group" role="row">
					<span role="rowheader" className="home-label">
						Group, right
					</span>
					{REVEAL_FIELDS.map((f) => {
						const right = SAMPLE_FLIGHT.filter(
							(t) => t.result.fields.find((x) => x.key === f.key)?.status === 'correct',
						).length;
						return (
							<span
								key={f.key}
								role="cell"
								className={`home-figure home-figure--sm${right ? '' : ' home-figure--warn'}`}
							>
								{right} of {SAMPLE_FLIGHT.length}
							</span>
						);
					})}
					<span role="cell" />
				</div>
			</div>

			{/* Phone: one line per taster. */}
			<ul className="home-fcompact">
				{SAMPLE_FLIGHT.map((t) => {
					const n = (s: string) => t.result.fields.filter((f) => f.status === s).length;
					const summary = [
						n('correct') && `${n('correct')} right`,
						n('close') && `${n('close')} close`,
						n('wrong') && `${n('wrong')} wrong`,
					]
						.filter(Boolean)
						.join(' · ');
					return (
						<li key={t.id} className="home-fcompact__row">
							<span className={`home-dot home-dot--t${t.tint}`} aria-hidden="true">
								{t.initial}
							</span>
							<span className="home-fcompact__text">
								<strong>{t.name}</strong>
								<span className="home-muted">{summary}</span>
							</span>
							<Figure score={t.result.score} outOf={t.result.outOf} />
						</li>
					);
				})}
			</ul>

			<div className="home-structure">
				<div className="home-structure__head">
					<span className="home-label">Structure</span>
					<span className="home-muted">
						<span className="home-figure home-figure--warn">{splits}</span> of{' '}
						<span className="home-figure">{SAMPLE_STRUCTURE.length}</span> split the group
					</span>
				</div>
				<ul className="home-scales home-scales--all">
					{SAMPLE_STRUCTURE.map((attr) => (
						<ScaleRow key={attr.name} attr={attr} />
					))}
				</ul>
				{tannin && (
					<ul className="home-scales home-scales--one">
						<ScaleRow attr={tannin} />
					</ul>
				)}
			</div>
		</div>
	);
}

export function ExamPace() {
	return (
		<div className="home-pace">
			{TIMER_PRESETS.map((preset) => (
				<div key={preset.seconds} className="home-pace__cell">
					<span className="home-figure home-figure--xl">{formatTimerSeconds(preset.seconds)}</span>
					<span className="home-pace__label">
						{preset.label}
						<span>{preset.note.replace(' min', ' minutes')}</span>
					</span>
				</div>
			))}
		</div>
	);
}

export function GridPhases() {
	return (
		<ol className="home-phases">
			{PHASES.map(([name, body], i) => (
				<li key={name} className="home-phases__row">
					<span className="home-figure home-phases__n">{String(i + 1).padStart(2, '0')}</span>
					<span className="home-phases__name">{name}</span>
					<span className="home-muted">{body}</span>
				</li>
			))}
		</ol>
	);
}

export function ArchivePreview() {
	return (
		<div className="home-archive">
			{SAMPLE_ARCHIVE.map((card) => (
				<article key={card.no} className="home-card home-archive__card">
					<div className="home-card__top">
						<span className={`home-type home-type--${card.red ? 'red' : 'white'}`}>
							{card.red ? 'Red wine' : 'White wine'}
						</span>
						<span className="home-no">No. {card.no}</span>
					</div>
					<h3 className="home-archive__title">{card.title}</h3>
					<p className="home-muted">{card.sub}</p>
					<div className={`home-total home-total--card${card.score ? '' : ' home-total--quiet'}`}>
						<span className="home-muted">{card.date}</span>
						{card.score ? (
							<span className="home-figure home-figure--md">{card.score}</span>
						) : (
							<span className="home-figure home-figure--md home-figure--pending">Not revealed</span>
						)}
					</div>
				</article>
			))}
		</div>
	);
}

export const WHO = [
	['Certified and Advanced candidates', 'Drill the grid until the order is automatic, at the pace your exam runs.'],
	['Study groups', 'Pour a flight, taste on your own phones, then go through the results together.'],
	[
		'Mentors running a tasting',
		"Host from your phone, reveal each label once, and see everyone's reasoning side by side.",
	],
];

export function CtaLinks({ join = true }: { join?: boolean }) {
	return (
		<div className="home-ctas">
			<Link href="/tastings/start" className="btn-primary home-btn no-underline">
				Start a tasting →
			</Link>
			{join && (
				<Link href="/flights/join" className="home-btn home-btn--outline no-underline">
					Join a flight
				</Link>
			)}
		</div>
	);
}
