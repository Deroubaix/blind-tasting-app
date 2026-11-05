'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconArrowsSplit2, IconCheck, IconChevronLeft, IconChevronRight, IconTilde } from '@tabler/icons-react';
import { useModalProvider } from '../modal/ModalProvider';
import { StatusBadge } from '../archives/RevealScorecard';
import { type FieldStatus, scoredFields } from '../../utils/revealScore';
import { JsonApiError } from '../../utils/ErrorUtils';
import { type WineResultRow, type WineResults } from '../../types/Flight';
import {
	compareStructure,
	structureAttributes,
	structurePhrase,
	type Agreement,
	type StructureAttribute,
} from '../../utils/flightLogic';
import { Avatar, FlightMessage, flightService, useFlight, useRequireLogin } from './FlightBits';
import { flightsText } from '../../i18n/flights';
import { commonText } from '../../i18n/common';
import { useLang, useText } from '../../i18n/LanguageProvider';
import { formatAverage } from '../../utils/NumberUtils';

type ResultsText = (typeof flightsText)['en']['results'];

const AGREEMENT_ICONS: Record<Agreement, typeof IconCheck> = {
	agreed: IconCheck,
	near: IconTilde,
	split: IconArrowsSplit2,
};

/** Reveal field text by key, falling back to the field's own English. */
const byKey = (group: Record<string, string>, key: string, fallback: string) => group[key] ?? fallback;

/** Short scale labels, so five levels fit a phone: "Medium+" → "Med+". */
const shortLevel = (level: string) => level.replace('Medium', 'Med');

function structure(results: WineResults): StructureAttribute[] {
	const answers = results.rows
		.filter((row) => row.status === 'submitted' && row.wineType)
		.map((row) => ({ personId: row.person.id, wineType: row.wineType!, palate: row.palate }));
	return structureAttributes(
		answers.map((a) => a.wineType),
		results.grid,
	)
		.map((name) => compareStructure(name, answers, results.grid))
		.filter((attr): attr is StructureAttribute => attr !== null);
}

function Legend() {
	return (
		<span className="flight-results__legend" aria-hidden="true">
			{(['correct', 'close', 'wrong', 'notcalled'] as FieldStatus[]).map((status) => (
				<StatusBadge key={status} status={status} />
			))}
		</span>
	);
}

const phraseOf = (attr: StructureAttribute, t: ResultsText) =>
	structurePhrase(
		attr.levels,
		attr.calls.map((call) => call.level),
		t.phrase,
	);

function ScaleRow({ attr, results }: { attr: StructureAttribute; results: WineResults }) {
	const t = useText(flightsText).results;
	const word = t.agreement[attr.agreement];
	const Icon = AGREEMENT_ICONS[attr.agreement];
	const phrase = phraseOf(attr, t);
	const last = attr.levels.length - 1;
	const levels = attr.calls.map((c) => c.level);
	const min = Math.min(...levels);
	const max = Math.max(...levels);
	const pos = (level: number) => `${(level / last) * 100}%`;
	const people = (level: number) =>
		attr.calls
			.filter((call) => call.level === level)
			.map((call) => results.rows.find((row) => row.person.id === call.personId)!.person);

	return (
		<li className={`agreement-scale agreement-scale--${attr.agreement}`}>
			<span className="agreement-scale__name">{attr.name === 'Length of Finish' ? 'Finish' : attr.name}</span>
			<div className="agreement-scale__track" role="img" aria-label={`${attr.name}: ${phrase}`}>
				<span className="agreement-scale__line" />
				{max > min && (
					<span
						className="agreement-scale__range"
						style={{ left: pos(min), width: `calc(${pos(max)} - ${pos(min)})` }}
					/>
				)}
				{attr.levels.map((level, index) => {
					const here = people(index);
					return (
						<span key={level} className="agreement-scale__stop" style={{ left: pos(index) }}>
							<span className="agreement-scale__dots">
								{here.map((person) => (
									<Avatar
										key={person.id}
										person={person}
										size="sm"
										title={`${person.name}: ${level}`}
									/>
								))}
							</span>
							<span className={`agreement-scale__tick${here.length ? ' agreement-scale__tick--on' : ''}`}>
								{shortLevel(level)}
							</span>
						</span>
					);
				})}
			</div>
			<span className="agreement-scale__verdict">
				{/* Agreement needs two people. */}
				{attr.calls.length > 1 && (
					<span className="agreement-scale__word">
						<Icon size={12} stroke={2.2} aria-hidden="true" />
						{word}
					</span>
				)}
				<span className="flight-muted">{phrase}</span>
			</span>
		</li>
	);
}

function TasterSheet({
	row,
	results,
	attrs,
}: {
	row: WineResultRow;
	results: WineResults;
	attrs: StructureAttribute[];
}) {
	const text = useText(flightsText);
	const t = text.results;
	const palateRows = attrs
		.map((attr) => {
			const mine = attr.calls.find((call) => call.personId === row.person.id);
			const levels = attr.calls.map((call) => call.level);
			const group =
				attr.agreement === 'agreed'
					? t.allAgreed
					: t.groupRange(
							shortLevel(attr.levels[Math.min(...levels)]),
							shortLevel(attr.levels[Math.max(...levels)]),
						);
			return mine ? { name: attr.name, value: attr.levels[mine.level], group } : null;
		})
		.filter(Boolean) as { name: string; value: string; group: string }[];

	return (
		<div className="flight-sheet">
			<div className="flight-sheet__head">
				<Avatar person={row.person} size="lg" />
				<div>
					<span className="flight-muted">
						{text.bits.wineN(results.number)} ·{' '}
						{row.submittedLeft ? t.submittedWith(row.submittedLeft) : t.submitted}
					</span>
				</div>
			</div>
			<div className="flight-sheet__score">
				<span className="flight-sheet__big">
					{row.score}
					<span> / {row.outOf}</span>
				</span>
				<span>
					<strong>{row.headline}</strong>
					<span className="flight-muted">{row.detail}</span>
				</span>
			</div>
			{palateRows.length > 0 && (
				<div className="flight-card flight-sheet__palate">
					<span className="tasting-card__label">{t.palateAgainst}</span>
					<dl>
						{palateRows.map((item) => (
							<div key={item.name}>
								<dt>{item.name}</dt>
								<dd>{item.value}</dd>
								<dd className="flight-muted">{item.group}</dd>
							</div>
						))}
					</dl>
				</div>
			)}
			{row.nose.length > 0 && (
				<div className="flight-card">
					<span className="tasting-card__label">{t.nose}</span>
					<p className="flight-sheet__nose">{row.nose.join(' · ')}</p>
				</div>
			)}
			{row.tastingId && (
				<Link href={`/archives/${row.tastingId}`} className="text-link text-link--sm">
					{t.fullSheet}
				</Link>
			)}
		</div>
	);
}

export default function WineResultsClient({ code, number }: { code: string; number: number }) {
	const { lang } = useLang();
	const text = useText(flightsText);
	const t = text.results;
	const common = useText(commonText);
	const ready = useRequireLogin(`/flights/${code}/wines/${number}`);
	const { flight } = useFlight(code, ready);
	const [results, setResults] = useState<WineResults | null>(null);
	const [error, setError] = useState<string | null>(null);
	const { openModal } = useModalProvider();

	useEffect(() => {
		if (!ready) {
			return;
		}
		flightService
			.results(code, number)
			.then(setResults)
			.catch((err) => setError(JsonApiError.create(err).message));
		// The headlines are written on the server, so a language switch fetches them again.
	}, [ready, code, number, lang]);

	if (error !== null) {
		return (
			<FlightMessage>
				<p>{error || t.loadFailed}</p>
				<Link href={`/flights/${code}`} className="text-link text-link--sm">
					{t.back}
				</Link>
			</FlightMessage>
		);
	}
	if (!results) {
		return <div className="empty-state">{common.loading}</div>;
	}

	const attrs = structure(results);
	const splits = attrs.filter((attr) => attr.agreement === 'split').length;
	const submittedRows = results.rows.filter((row) => row.status === 'submitted');
	const missing = results.rows.filter((row) => row.status !== 'submitted');
	const revealedNumbers = flight?.wines.filter((w) => w.revealed).map((w) => w.number) ?? [];
	const prev = [...revealedNumbers].reverse().find((n) => n < number);
	const next = revealedNumbers.find((n) => n > number);

	const openSheet = (row: WineResultRow) =>
		openModal({
			modalId: `taster-${row.person.id}`,
			title: row.person.name,
			className: 'FlightSheetModal',
			closeOnClickOutside: true,
			closeOnEsc: true,
			children: <TasterSheet row={row} results={results} attrs={attrs} />,
		});

	const fields = scoredFields(results.grid);
	const group = fields.map((field) => {
		const statuses = submittedRows.map((row) => row.fields?.find((f) => f.key === field.key)?.status ?? 'na');
		const right = statuses.filter((s) => s === 'correct').length;
		const close = statuses.filter((s) => s === 'close').length;
		return {
			key: field.key,
			statuses,
			text: t.right(right, submittedRows.length, close),
		};
	});

	return (
		<main className="flight-main">
			<nav className="flight-results__nav" aria-label={t.winesAria}>
				<Link href={`/flights/${code}`} className="back-link">
					← {results.flightName}
				</Link>
				<span className="flight-results__pager">
					{prev && (
						<Link href={`/flights/${code}/wines/${prev}`} className="btn-quiet btn-quiet--sm">
							<IconChevronLeft size={14} aria-hidden="true" /> {text.bits.wineN(prev)}
						</Link>
					)}
					{next && (
						<Link href={`/flights/${code}/wines/${next}`} className="btn-quiet btn-quiet--sm">
							{text.bits.wineN(next)} <IconChevronRight size={14} aria-hidden="true" />
						</Link>
					)}
				</span>
			</nav>

			<header className="page-head">
				<div>
					<span className="flight-results__kicker">
						{results.wineType && (
							<span className={`wine-type-badge wine-type-badge--${results.wineType}`}>
								{results.wineType === 'red' ? common.redWine : common.whiteWine}
							</span>
						)}
						<span className="page-eyebrow">
							{common.wineOf(results.number, results.wineCount)} · {t.revealed}
						</span>
					</span>
					<h1 className="page-head__title">{results.title}</h1>
					<p className="page-head__sub">{results.detail}</p>
				</div>
				<dl className="flight-stats">
					<div>
						<dt>{t.groupAverage}</dt>
						<dd className="flight-stats__value">
							{formatAverage(results.average, lang)}
							<span> / {results.outOf}</span>
						</dd>
						<dd className="flight-stats__sub">{t.ofSubmitted(results.submitted)}</dd>
					</div>
					<div>
						<dt>{t.best}</dt>
						<dd className="flight-stats__value">
							{results.best?.score ?? '—'}
							<span> / {results.outOf}</span>
						</dd>
						<dd className="flight-stats__sub">{results.best?.name ?? '—'}</dd>
					</div>
					<div>
						<dt>{t.submittedHeading}</dt>
						<dd className="flight-stats__value">
							{results.submitted}
							<span>{t.ofTotal(results.memberCount)}</span>
						</dd>
						<dd className="flight-stats__sub">
							{missing.length === 0
								? t.everyone
								: missing.length === 1
									? t.oneMissing(missing[0].person.name.split(' ')[0])
									: t.manyMissing(missing.length)}
						</dd>
					</div>
				</dl>
			</header>

			<section className="flight-card flight-results__card" aria-labelledby="conclusions-heading">
				<div className="flight-card__head">
					<h2 className="tasting-card__label" id="conclusions-heading">
						{t.conclusions}
					</h2>
					<Legend />
				</div>

				<div
					className="flight-table"
					role="table"
					aria-label={t.tableAria}
					// The column count is data, so this is the one inline style.
					style={{ '--fields': fields.length } as React.CSSProperties}
				>
					<div className="flight-table__row flight-table__row--head" role="row">
						<span role="columnheader">{t.taster}</span>
						{fields.map((field) => (
							<span key={field.key} role="columnheader">
								{byKey(t.column, field.key, field.abbr)}
							</span>
						))}
					</div>
					<div className="flight-table__row flight-table__row--label" role="row">
						<span role="rowheader" className="flight-table__who">
							<span className="flight-table__label-mark" aria-hidden="true" />
							<strong>{t.theLabel}</strong>
						</span>
						{fields.map((field) => (
							<span
								key={field.key}
								role="cell"
								className="flight-table__cell"
								data-col={byKey(t.field, field.key, field.label)}
							>
								<strong>{results.reveal[field.key] || '—'}</strong>
							</span>
						))}
					</div>
					{results.rows.map((row) => (
						<div
							key={row.person.id}
							className={`flight-table__row${row.status === 'submitted' ? '' : ' flight-table__row--missing'}`}
							role="row"
						>
							<span role="rowheader" className="flight-table__who">
								<Avatar person={row.person} />
								<span className="flight-table__name">
									{row.status === 'submitted' ? (
										<button type="button" className="text-link" onClick={() => openSheet(row)}>
											{row.person.name} ›
										</button>
									) : (
										<span>{row.person.name}</span>
									)}
									{row.status === 'submitted' ? (
										<span className="score-tag">
											{row.score} / {row.outOf}
										</span>
									) : (
										<span className="flight-status flight-status--notsubmitted">
											{text.bits.status.notsubmitted}
										</span>
									)}
								</span>
							</span>
							{row.status === 'submitted' ? (
								fields.map((field) => {
									const cell = row.fields?.find((f) => f.key === field.key);
									return (
										<span
											key={field.key}
											role="cell"
											className="flight-table__cell"
											data-col={byKey(t.field, field.key, field.label)}
										>
											<span className={cell?.status === 'correct' ? '' : 'flight-muted'}>
												{cell?.call ?? '—'}
											</span>
											{cell && cell.status !== 'na' && <StatusBadge status={cell.status} />}
										</span>
									);
								})
							) : (
								<span role="cell" className="flight-table__note">
									{t.missingNote}
								</span>
							)}
						</div>
					))}
					<div className="flight-table__row flight-table__row--group" role="row">
						<span role="rowheader" className="flight-muted">
							{t.groupRow(submittedRows.length)}
						</span>
						{group.map((g) => (
							<span key={g.key} role="cell" className="flight-table__cell">
								<span className="flight-muted">{g.text}</span>
								<span className="flight-table__bar" aria-hidden="true">
									{g.statuses.map((status, i) => (
										<span key={i} className={`flight-table__seg flight-table__seg--${status}`} />
									))}
								</span>
							</span>
						))}
					</div>
				</div>
			</section>

			{attrs.length > 0 && (
				<section className="flight-card flight-results__card" aria-labelledby="structure-heading">
					<div className="flight-card__head">
						<h2 className="tasting-card__label" id="structure-heading">
							{t.structure}
						</h2>
						<span className={splits ? 'flight-split-count' : 'flight-muted'}>
							{t.splits(splits, attrs.length)}
						</span>
					</div>
					<p className="flight-muted">{t.structureNote}</p>
					<ul className="agreement-scales">
						{attrs.map((attr) => (
							<ScaleRow key={attr.name} attr={attr} results={results} />
						))}
					</ul>
				</section>
			)}
		</main>
	);
}
