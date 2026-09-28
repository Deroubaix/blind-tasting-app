'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconArrowsSplit2, IconCheck, IconChevronLeft, IconChevronRight, IconTilde } from '@tabler/icons-react';
import { useModalProvider } from '../modal/ModalProvider';
import { StatusBadge } from '../archives/RevealScorecard';
import { REVEAL_FIELDS, type FieldStatus } from '../archives/revealScore';
import { JsonApiError } from '../../utils/ErrorUtils';
import { type WineResultRow, type WineResults } from '../../types/Flight';
import { compareStructure, structureAttributes, type Agreement, type StructureAttribute } from './flightLogic';
import { Avatar, FlightMessage, flightService, useFlight, useRequireLogin } from './FlightBits';

const AGREEMENT: Record<Agreement, { word: string; Icon: typeof IconCheck }> = {
	agreed: { word: 'Agreed', Icon: IconCheck },
	near: { word: 'Near', Icon: IconTilde },
	split: { word: 'Split', Icon: IconArrowsSplit2 },
};

/** Short scale labels, so five levels fit a phone: "Medium+" → "Med+". */
const shortLevel = (level: string) => level.replace('Medium', 'Med');

function structure(results: WineResults): StructureAttribute[] {
	const answers = results.rows
		.filter((row) => row.status === 'submitted' && row.wineType)
		.map((row) => ({ personId: row.person.id, wineType: row.wineType!, palate: row.palate }));
	return structureAttributes(answers.map((a) => a.wineType))
		.map((name) => compareStructure(name, answers))
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

function ScaleRow({ attr, results }: { attr: StructureAttribute; results: WineResults }) {
	const { word, Icon } = AGREEMENT[attr.agreement];
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
		<li className={`flight-scale flight-scale--${attr.agreement}`}>
			<span className="flight-scale__name">{attr.name === 'Length of Finish' ? 'Finish' : attr.name}</span>
			<div className="flight-scale__track" role="img" aria-label={`${attr.name}: ${attr.phrase}`}>
				<span className="flight-scale__line" />
				{max > min && (
					<span
						className="flight-scale__range"
						style={{ left: pos(min), width: `calc(${pos(max)} - ${pos(min)})` }}
					/>
				)}
				{attr.levels.map((level, index) => {
					const here = people(index);
					return (
						<span key={level} className="flight-scale__stop" style={{ left: pos(index) }}>
							<span className="flight-scale__dots">
								{here.map((person) => (
									<Avatar
										key={person.id}
										person={person}
										size="sm"
										title={`${person.name}: ${level}`}
									/>
								))}
							</span>
							<span className={`flight-scale__tick${here.length ? ' flight-scale__tick--on' : ''}`}>
								{shortLevel(level)}
							</span>
						</span>
					);
				})}
			</div>
			<span className="flight-scale__verdict">
				{/* Agreement needs two people. */}
				{attr.calls.length > 1 && (
					<span className="flight-scale__word">
						<Icon size={12} stroke={2.2} aria-hidden="true" />
						{word}
					</span>
				)}
				<span className="flight-muted">{attr.phrase}</span>
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
	const palateRows = attrs
		.map((attr) => {
			const mine = attr.calls.find((call) => call.personId === row.person.id);
			const levels = attr.calls.map((call) => call.level);
			const group =
				attr.agreement === 'agreed'
					? 'all agreed'
					: `group: ${shortLevel(attr.levels[Math.min(...levels)])} to ${shortLevel(attr.levels[Math.max(...levels)])}`;
			return mine ? { name: attr.name, value: attr.levels[mine.level], group } : null;
		})
		.filter(Boolean) as { name: string; value: string; group: string }[];

	return (
		<div className="flight-sheet">
			<div className="flight-sheet__head">
				<Avatar person={row.person} size="lg" />
				<div>
					<span className="flight-muted">
						Wine {results.number} ·{' '}
						{row.submittedLeft ? `submitted with ${row.submittedLeft}` : 'submitted'}
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
					<span className="tasting-card__label">Palate, against the group</span>
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
					<span className="tasting-card__label">Nose</span>
					<p className="flight-sheet__nose">{row.nose.join(' · ')}</p>
				</div>
			)}
			{row.tastingId && (
				<Link href={`/archives/${row.tastingId}`} className="flight-link no-underline">
					Full tasting sheet →
				</Link>
			)}
		</div>
	);
}

export default function WineResultsClient({ code, number }: { code: string; number: number }) {
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
			.catch((err) => setError(JsonApiError.create(err).message || 'The results could not be loaded.'));
	}, [ready, code, number]);

	if (error) {
		return (
			<FlightMessage>
				<p>{error}</p>
				<Link href={`/flights/${code}`} className="flight-link">
					← Back to the flight
				</Link>
			</FlightMessage>
		);
	}
	if (!results) {
		return <div className="archives-loading">Loading…</div>;
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

	const group = REVEAL_FIELDS.map((field) => {
		const statuses = submittedRows.map((row) => row.fields?.find((f) => f.key === field.key)?.status ?? 'na');
		const right = statuses.filter((s) => s === 'correct').length;
		const close = statuses.filter((s) => s === 'close').length;
		return {
			key: field.key,
			statuses,
			text: `${right} of ${submittedRows.length} right${close ? ` · ${close} close` : ''}`,
		};
	});

	return (
		<main className="flight-main">
			<nav className="flight-results__nav" aria-label="Wines">
				<Link href={`/flights/${code}`} className="flight-back no-underline">
					← {results.flightName}
				</Link>
				<span className="flight-results__pager">
					{prev && (
						<Link href={`/flights/${code}/wines/${prev}`} className="outline flight-btn-small no-underline">
							<IconChevronLeft size={14} aria-hidden="true" /> Wine {prev}
						</Link>
					)}
					{next && (
						<Link href={`/flights/${code}/wines/${next}`} className="outline flight-btn-small no-underline">
							Wine {next} <IconChevronRight size={14} aria-hidden="true" />
						</Link>
					)}
				</span>
			</nav>

			<header className="flight-results__head">
				<div>
					<span className="flight-results__kicker">
						{results.wineType && (
							<span className={`wine-type-badge wine-type-badge--${results.wineType}`}>
								{results.wineType === 'red' ? 'Red' : 'White'} wine
							</span>
						)}
						<span className="page-eyebrow">
							Wine {results.number} of {results.wineCount} · Revealed
						</span>
					</span>
					<h1 className="flight-results__title">{results.title}</h1>
					<p className="flight-head__sub">{results.detail}</p>
				</div>
				<dl className="flight-stats">
					<div>
						<dt>Group average</dt>
						<dd>
							{results.average ?? '—'}
							<span> / {results.outOf}</span>
						</dd>
						<dd className="flight-muted">Of {results.submitted} who submitted</dd>
					</div>
					<div>
						<dt>Best</dt>
						<dd>
							{results.best?.score ?? '—'}
							<span> / {results.outOf}</span>
						</dd>
						<dd className="flight-muted">{results.best?.name ?? '—'}</dd>
					</div>
					<div>
						<dt>Submitted</dt>
						<dd>
							{results.submitted}
							<span> of {results.memberCount}</span>
						</dd>
						<dd className="flight-muted">
							{missing.length === 0
								? 'Everyone'
								: missing.length === 1
									? `${missing[0].person.name.split(' ')[0]} didn't submit`
									: `${missing.length} didn't submit`}
						</dd>
					</div>
				</dl>
			</header>

			<section className="flight-card flight-results__card" aria-labelledby="conclusions-heading">
				<div className="flight-card__head">
					<h2 className="tasting-card__label" id="conclusions-heading">
						Conclusions
					</h2>
					<Legend />
				</div>

				<div className="flight-table" role="table" aria-label="Each taster's call against the label">
					<div className="flight-table__row flight-table__row--head" role="row">
						<span role="columnheader">Taster</span>
						{REVEAL_FIELDS.map((field) => (
							<span key={field.key} role="columnheader">
								{field.abbr === 'Ctry'
									? 'Country'
									: field.abbr === 'Qual'
										? 'Quality'
										: field.abbr === 'Vint'
											? 'Vintage'
											: field.abbr}
							</span>
						))}
					</div>
					<div className="flight-table__row flight-table__row--label" role="row">
						<span role="rowheader" className="flight-table__who">
							<span className="flight-table__label-mark" aria-hidden="true" />
							<strong>The label</strong>
						</span>
						{REVEAL_FIELDS.map((field) => (
							<span key={field.key} role="cell" className="flight-table__cell" data-col={field.label}>
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
										<button
											type="button"
											className="flight-link-button"
											onClick={() => openSheet(row)}
										>
											{row.person.name} ›
										</button>
									) : (
										<span>{row.person.name}</span>
									)}
									{row.status === 'submitted' ? (
										<span className="flight-score">
											{row.score} / {row.outOf}
										</span>
									) : (
										<span className="flight-status flight-status--notsubmitted">Not submitted</span>
									)}
								</span>
							</span>
							{row.status === 'submitted' ? (
								REVEAL_FIELDS.map((field) => {
									const cell = row.fields?.find((f) => f.key === field.key);
									return (
										<span
											key={field.key}
											role="cell"
											className="flight-table__cell"
											data-col={field.label}
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
									Not submitted before the reveal. Not scored, and not counted in the average.
								</span>
							)}
						</div>
					))}
					<div className="flight-table__row flight-table__row--group" role="row">
						<span role="rowheader" className="flight-muted">
							Group · {submittedRows.length} submitted
						</span>
						{group.map((g) => (
							<span key={g.key} role="cell" className="flight-table__cell">
								<span className="flight-muted">{g.text}</span>
								<span className="flight-table__bar" aria-hidden="true">
									{g.statuses.map((status, i) => (
										<span key={i} className={`reveal-status--${status}`} />
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
							Structure
						</h2>
						<span className={splits ? 'flight-split-count' : 'flight-muted'}>
							{splits} of {attrs.length} split the group
						</span>
					</div>
					<p className="flight-muted">
						Where each taster placed the palate. The label can&apos;t say, so this isn&apos;t scored.
					</p>
					<ul className="flight-scales">
						{attrs.map((attr) => (
							<ScaleRow key={attr.name} attr={attr} results={results} />
						))}
					</ul>
				</section>
			)}
		</main>
	);
}
