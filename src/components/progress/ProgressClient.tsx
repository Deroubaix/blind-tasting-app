'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { type Grid } from '../../data/grids';
import { type Lang } from '../../i18n';
import { formatMonth, formatMonthYear, formatShortDate } from '../../utils/DateUtils';
import { formatDecimal } from '../../utils/NumberUtils';
import { useLang, useText } from '../../i18n/LanguageProvider';
import { progressText } from '../../i18n/progress';
import {
	MIN_FOR_TREND,
	ROLLING_WINDOW,
	type PalateSample,
	type ProgressTasting,
	type TypeFilter,
	averageShare,
	bestRun,
	biasWord,
	confusions,
	matchesType,
	palateBias,
	revealedFor,
	share,
	trendOf,
} from '../../utils/progressStats';

type T = (typeof progressText)['en'];

const noSubscription = () => () => {};
/** UTC until hydrated: the server can't know the browser's time zone, and both renders must match. */
const useTimeZone = () =>
	useSyncExternalStore(
		noSubscription,
		() => undefined,
		() => 'UTC',
	);

/** CMS reads as fields right out of 5, WSET as a percentage, since its sheets score 2 to 6 fields. */
function figure(value: number, grid: Grid, lang: Lang): { value: string; unit: string } {
	return grid === 'wset'
		? { value: String(Math.round(value * 100)), unit: '%' }
		: { value: formatDecimal(value * 5, lang), unit: ' / 5' };
}
const figureText = (value: number, grid: Grid, lang: Lang) =>
	grid === 'wset' ? `${Math.round(value * 100)}%` : formatDecimal(value * 5, lang);

type Props = { list: ProgressTasting[]; palate: PalateSample[]; name: string; memberSince: string | null };

export default function ProgressClient({ list, palate, name, memberSince }: Props) {
	const { lang } = useLang();
	const t = useText(progressText);
	const [grid, setGrid] = useState<Grid | null>(null);
	const [type, setType] = useState<TypeFilter>('all');

	const timeZone = useTimeZone();
	const since = memberSince ? formatMonthYear(memberSince, lang, timeZone) : null;
	const revealedCount = list.filter((x) => x.revealed).length;

	if (revealedCount < MIN_FOR_TREND) {
		return <ProgressEmpty list={list} name={name} since={since} t={t} />;
	}

	// Open on the grid the user has revealed the most on.
	const wsetCount = list.filter((x) => x.revealed && x.grid === 'wset').length;
	const shown: Grid = grid ?? (wsetCount > revealedCount - wsetCount ? 'wset' : 'cms');

	return (
		<div className="progress">
			<div className="progress__head">
				<div>
					{since && (
						<div className="progress__eyebrow">
							<span className="progress__wide">{t.since(name, since)}</span>
							<span className="progress__narrow">{t.sinceShort(since)}</span>
						</div>
					)}
					<h1 className="progress__title">{t.title}</h1>
				</div>
				<div className="progress__filters">
					<Segmented
						label={t.filters.grid}
						value={shown}
						onChange={setGrid}
						options={[
							['cms', t.filters.cms],
							['wset', t.filters.wset],
						]}
					/>
					<Segmented
						label={t.filters.type}
						value={type}
						onChange={setType}
						options={[
							['all', t.filters.all],
							['red', t.filters.red],
							['white', t.filters.white],
						]}
					/>
				</div>
			</div>
			<ProgressBody list={list} grid={shown} type={type} palate={palate} t={t} lang={lang} />
		</div>
	);
}

function Segmented<V extends string>({
	label,
	value,
	onChange,
	options,
}: {
	label: string;
	value: V;
	onChange: (value: V) => void;
	options: [V, string][];
}) {
	return (
		<div className={`progress-seg progress-seg--${options.length}`} role="group" aria-label={label}>
			{options.map(([option, text]) => (
				<button
					key={option}
					type="button"
					aria-pressed={value === option}
					className="progress-seg__btn"
					onClick={() => onChange(option)}
				>
					{text}
				</button>
			))}
		</div>
	);
}

type Tile = { label: string; value: string; unit?: string; sub?: string; quiet?: boolean };

function Totals({ tiles, className = '' }: { tiles: Tile[]; className?: string }) {
	return (
		<div className={`progress-totals ${className}`.trim()}>
			{tiles.map((tile) => (
				<div key={tile.label} className="progress-totals__tile">
					<div className="progress-label">{tile.label}</div>
					<div className={`progress-totals__value${tile.quiet ? ' progress-totals__value--quiet' : ''}`}>
						{tile.value}
						{tile.unit && <span>{tile.unit}</span>}
					</div>
					{tile.sub && <div className="progress-totals__sub">{tile.sub}</div>}
				</div>
			))}
		</div>
	);
}

function Folio({ n, children, className = '' }: { n: number; children: React.ReactNode; className?: string }) {
	return (
		<section className={`progress-section ${className}`.trim()}>
			<div className="progress-section__folio" aria-hidden="true">
				§ {n}
			</div>
			<div className="progress-section__body">{children}</div>
		</section>
	);
}

function ProgressBody({
	list,
	grid,
	type,
	palate,
	t,
	lang,
}: {
	list: ProgressTasting[];
	grid: Grid;
	type: TypeFilter;
	palate: PalateSample[];
	t: T;
	lang: Lang;
}) {
	const revealed = revealedFor(list, grid, type);
	const waiting = list.filter((x) => !x.revealed && x.grid === grid && matchesType(x, type)).length;
	const mean = averageShare(revealed);
	const avg = mean === null ? { value: '—', unit: '' } : figure(mean, grid, lang);

	return (
		<>
			<Totals
				tiles={[
					{
						label: t.totals.tastings,
						value: String(revealed.length + waiting),
						sub: grid === 'cms' ? t.filters.cms : t.filters.wset,
					},
					{
						label: t.totals.revealed,
						value: String(revealed.length),
						sub: waiting ? t.totals.waiting(waiting) : t.totals.allRevealed,
					},
					{
						label: t.totals.average,
						value: avg.value,
						unit: avg.unit,
						sub: grid === 'cms' ? t.totals.averageCms : t.totals.averageWset,
					},
					{
						label: t.totals.bestRun,
						value: String(bestRun(revealed)),
						sub: t.totals.run(grid === 'cms' ? '3 / 5' : '60%'),
					},
				]}
			/>
			{waiting ? (
				<p className="progress-note">
					<span className="progress__wide">{t.waiting(waiting)} </span>
					<Link href="/archives" className="progress-link">
						<span className="progress__wide">{t.revealThem}</span>
						<span className="progress__narrow">
							{t.waiting(waiting)} {t.revealShort}
						</span>
					</Link>
				</p>
			) : (
				<p className="progress-note">{t.everyRevealed}</p>
			)}

			<Trend revealed={revealed} grid={grid} t={t} lang={lang} />

			<div className="progress-pair">
				<Folio n={2}>
					<h2 className="progress-h2">
						{t.confuse.title} <em>{t.confuse.titleEm}</em>
					</h2>
					<p className="progress-lede">
						<span className="progress__wide">{t.confuse.lede}</span>
						<span className="progress__narrow">{t.confuse.ledeShort}</span>
					</p>
					<ConfusionList title={t.confuse.grapes} pairs={confusions(list, 'grape', type)} t={t} />
					<ConfusionList title={t.confuse.countries} pairs={confusions(list, 'country', type)} t={t} />
				</Folio>
				<PalateSection samples={palate} grid={grid} type={type} t={t} lang={lang} />
			</div>
		</>
	);
}

function Trend({ revealed, grid, t, lang }: { revealed: ProgressTasting[]; grid: Grid; t: T; lang: Lang }) {
	const [table, setTable] = useState(false);
	const [hovered, setHovered] = useState<number | null>(null);
	const [focusedMark, setFocusedMark] = useState<number | null>(null);
	const focused = hovered ?? focusedMark;
	const timeZone = useTimeZone();
	const shortDate = (iso: string) => (iso ? formatShortDate(iso, lang, timeZone) : '');
	const trend = trendOf(revealed);
	const n = revealed.length;
	const xOf = (i: number) => (n > 1 ? (i / (n - 1)) * 100 : 50);
	const yOf = (v: number) => (1 - v) * 100;
	const fmt = (v: number) => figureText(v, grid, lang);
	const typeWord = (x: ProgressTasting) =>
		x.wineType === 'white' ? t.trend.white : x.wineType === 'red' ? t.trend.red : '';

	const ticks = (
		grid === 'cms'
			? [0, 1, 2, 3, 4, 5].map((k) => [k / 5, String(k)])
			: [0, 25, 50, 75, 100].map((k) => [k / 100, `${k}%`])
	) as [number, string][];

	// One label per calendar month, skipped when it would crowd the one before.
	const months: { key: string; label: string; short: string; left: number }[] = [];
	revealed.forEach((x, i) => {
		if (!x.date) {
			return;
		}
		const d = new Date(x.date);
		const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
		const previous = months[months.length - 1];
		if (!months.some((m) => m.key === key) && (!previous || xOf(i) - previous.left >= 12)) {
			const label = formatMonth(d, lang, 'long', 'UTC');
			months.push({ key, label, short: formatMonth(d, lang, 'short', 'UTC'), left: xOf(i) });
		}
	});

	const headline = trend
		? [
				trend.direction === 'up' ? t.trend.up : trend.direction === 'down' ? t.trend.down : t.trend.level,
				trend.direction === 'level'
					? t.trend.at(fmt(trend.last), n)
					: t.trend.fromTo(fmt(trend.first), fmt(trend.last), n),
			]
		: [t.trend.notEnough, t.trend.forFilter];

	const markLabel = (x: ProgressTasting) =>
		`${t.trend.markNo(x.number, shortDate(x.date))} · ${x.title}${x.wineType ? ` · ${typeWord(x)}` : ''} · ${x.score} / ${x.outOf}`;

	return (
		<Folio n={1} className="progress-section--trend">
			<div className="progress-trend__head">
				<div>
					<h2 className="progress-h2">
						{t.trend.title} <em>{t.trend.titleEm}</em>
					</h2>
					<p className="progress-trend__headline">
						<strong>{headline[0]}</strong>
						{headline[1]}
					</p>
					{trend && (
						<p className="progress-lede progress-lede--tight">
							{t.trend.note(ROLLING_WINDOW, trend.compared)}
							{grid === 'wset' ? t.trend.noteWset : ''}
						</p>
					)}
				</div>
				{trend && (
					<button
						type="button"
						className="progress-toggle progress-toggle--top"
						aria-pressed={table}
						onClick={() => setTable((v) => !v)}
					>
						{table ? t.trend.showChart : t.trend.readTable}
					</button>
				)}
			</div>

			<div className="progress-card">
				{!trend && (
					<div className="progress-card__empty">
						<span className="progress__wide">{t.trend.tooFew}</span>
						<span className="progress__narrow">{t.trend.tooFewShort}</span>
					</div>
				)}

				{trend && !table && (
					<>
						<div className="progress-chart" role="group" aria-label={t.trend.chartLabel}>
							{ticks.map(([f, label]) => (
								<React.Fragment key={label}>
									<div
										className={`progress-chart__rule${f === 0 ? ' progress-chart__rule--zero' : ''}`}
										style={{ top: `${yOf(f)}%` }}
									/>
									<span className="progress-chart__tick" style={{ top: `${yOf(f)}%` }}>
										{label}
									</span>
								</React.Fragment>
							))}
							<svg
								className="progress-chart__line"
								viewBox="0 0 100 100"
								preserveAspectRatio="none"
								aria-hidden="true"
							>
								<path
									d={trend.rolling
										.map((v, i) => `${i ? 'L' : 'M'}${xOf(i).toFixed(2)} ${yOf(v).toFixed(2)}`)
										.join(' ')}
									vectorEffect="non-scaling-stroke"
								/>
							</svg>
							{revealed.map((x, i) => (
								<Link
									key={x.id}
									href={`/archives/${x.id}`}
									className={`progress-mark progress-mark--${x.wineType === 'white' ? 'white' : 'red'}`}
									style={{ left: `${xOf(i)}%`, top: `${yOf(share(x))}%` }}
									aria-label={markLabel(x)}
									title={markLabel(x)}
									onFocus={() => setFocusedMark(i)}
									onBlur={() => setFocusedMark(null)}
									onMouseEnter={() => setHovered(i)}
									onMouseLeave={() => setHovered(null)}
								/>
							))}
							{focused !== null && revealed[focused] && (
								<div
									className="progress-callout"
									style={{
										left: `${xOf(focused)}%`,
										top: `${yOf(share(revealed[focused]))}%`,
										// Slides along with the point, so it never runs past either edge; drops below near the top.
										transform: `translate(-${xOf(focused)}%, ${share(revealed[focused]) > 0.7 ? '14px' : 'calc(-100% - 14px)'})`,
									}}
									aria-hidden="true"
								>
									<span className="progress-callout__no">
										{t.trend.markNo(revealed[focused].number, shortDate(revealed[focused].date))}
									</span>
									<strong>{revealed[focused].title}</strong>
									<span>
										{typeWord(revealed[focused])} · {revealed[focused].score} /{' '}
										{revealed[focused].outOf}
										{revealed[focused].score === revealed[focused].outOf
											? ` · ${t.trend.everyField}`
											: ''}
									</span>
								</div>
							)}
							<span className="progress-chart__end" style={{ top: `${yOf(trend.rolling[n - 1])}%` }}>
								<span className="progress-chart__end-value">{fmt(trend.rolling[n - 1])}</span>
								<span className="progress-chart__end-label">{t.trend.rolling}</span>
							</span>
						</div>
						<div className="progress-chart__months" aria-hidden="true">
							{months.map((m) => (
								<span key={m.key} style={{ left: `${m.left}%` }}>
									<span className="progress__wide">{m.label}</span>
									<span className="progress__narrow">{m.short}</span>
								</span>
							))}
						</div>
						<div className="progress-legend">
							<span>
								<span className="progress-legend__mark progress-mark--red" />
								<span className="progress__wide">{t.trend.legendRed}</span>
								<span className="progress__narrow">{t.trend.legendRedShort}</span>
							</span>
							<span>
								<span className="progress-legend__mark progress-mark--white" />
								<span className="progress__wide">{t.trend.legendWhite}</span>
								<span className="progress__narrow">{t.trend.legendWhiteShort}</span>
							</span>
							<span>
								<span className="progress-legend__line" />
								<span className="progress__wide">{t.trend.legendRolling(ROLLING_WINDOW)}</span>
								<span className="progress__narrow">{t.trend.legendRollingShort(ROLLING_WINDOW)}</span>
							</span>
							<span className="progress-legend__axis progress__wide">
								{grid === 'cms' ? t.trend.axisCms : t.trend.axisWset}
							</span>
						</div>
					</>
				)}

				{trend && table && (
					<div className="progress-table" role="table">
						<div className="progress-table__row progress-table__row--head" role="row">
							<span role="columnheader">{t.trend.no}</span>
							<span role="columnheader">{t.trend.date}</span>
							<span role="columnheader">{t.trend.wine}</span>
							<span role="columnheader">{t.trend.type}</span>
							<span role="columnheader">{t.trend.score}</span>
							<span role="columnheader">{t.trend.rollingAvg}</span>
						</div>
						{revealed
							.map((x, i) => ({ x, roll: trend.rolling[i] }))
							.reverse()
							.map(({ x, roll }) => (
								<div key={x.id} className="progress-table__row" role="row">
									<span role="cell" className="progress-table__no">
										{x.number}
									</span>
									<span role="cell" className="progress-table__date">
										{shortDate(x.date)}
									</span>
									<span role="cell" className="progress-table__wine">
										<Link href={`/archives/${x.id}`} className="no-underline">
											{x.title}
										</Link>
										<span className="progress-table__sub">
											{shortDate(x.date)}
											{x.wineType ? ` · ${typeWord(x)}` : ''}
										</span>
									</span>
									<span role="cell" className="progress-table__type">
										{typeWord(x)}
									</span>
									<span role="cell" className="progress-table__score">
										{x.score} / {x.outOf}
									</span>
									<span role="cell" className="progress-table__roll">
										{fmt(roll)}
									</span>
								</div>
							))}
					</div>
				)}

				{trend && (
					<button
						type="button"
						className="progress-toggle progress-toggle--bottom"
						aria-pressed={table}
						onClick={() => setTable((v) => !v)}
					>
						{table ? t.trend.showChart : t.trend.readTable}
					</button>
				)}
			</div>
		</Folio>
	);
}

/** Past this many pours the boxes stop reading as a count, so only the figure shows. */
const MAX_TALLY = 12;

function ConfusionList({
	title,
	pairs,
	t,
}: {
	title: string;
	pairs: { call: string; actual: string; n: number; of: number }[];
	t: T;
}) {
	return (
		<>
			<div className="progress-label progress-label--list">{title}</div>
			<div className="progress-ruled">
				{pairs.length === 0 && <p className="progress-ruled__none">{t.confuse.none}</p>}
				{pairs.map((pair) => (
					<div key={`${pair.call}-${pair.actual}`} className="progress-pair-row">
						<div className="progress-pair-row__text">
							<span className="progress-pair-row__line">
								{t.confuse.youCall}
								<strong>{pair.call}</strong>
							</span>
							<span className="progress-pair-row__line">
								<span className="progress__wide">{t.confuse.itWas}</span>
								<span className="progress__narrow">{t.confuse.itWasShort}</span>
								<strong>{pair.actual}</strong>
							</span>
						</div>
						<div className="progress-pair-row__count">
							{pair.of <= MAX_TALLY && (
								<span className="progress-tally" aria-hidden="true">
									{Array.from({ length: pair.of }, (_, i) => (
										<span key={i} className={i < pair.n ? 'is-on' : ''} />
									))}
								</span>
							)}
							<span className="progress-pair-row__figure" aria-label={t.confuse.count(pair.n, pair.of)}>
								<span>{pair.n}</span>
								<span className="progress-pair-row__of">{t.confuse.of(pair.of)}</span>
							</span>
						</div>
					</div>
				))}
			</div>
		</>
	);
}

/** Bars run ±1.5 steps from the group's median. */
const RANGE = 1.5;
const STEP_TICKS = [100 / 6, 100 / 3, 200 / 3, 500 / 6];

function PalateSection({
	samples,
	grid,
	type,
	t,
	lang,
}: {
	samples: PalateSample[];
	grid: Grid;
	type: TypeFilter;
	t: T;
	lang: Lang;
}) {
	const rows = palateBias(samples, grid, type);
	const wines = Math.max(0, ...rows.map((r) => r.wines));
	const words = { high: [] as string[], low: [] as string[], inline: [] as string[] };
	rows.forEach((r) => words[biasWord(r.bias)].push(t.palate.inSentence[r.attribute]));
	const signed = (b: number) => {
		// By size, so −1.25 rounds like +1.25.
		const rounded = (Math.sign(b) * Math.round(Math.abs(b) * 10)) / 10;
		return (rounded > 0 ? '+' : rounded < 0 ? '−' : '') + formatDecimal(Math.abs(rounded), lang);
	};

	return (
		<Folio n={3} className="progress-section--palate">
			<h2 className="progress-h2">
				{t.palate.title} <em>{t.palate.titleEm}</em>
			</h2>
			{rows.length === 0 ? (
				<p className="progress-lede">{t.palate.none}</p>
			) : (
				<>
					<p className="progress-lede">
						<span className="progress__wide">{t.palate.lede(wines)}</span>
						<span className="progress__narrow">{t.palate.ledeShort(wines)}</span>
					</p>
					<div className="progress-bias__scale" aria-hidden="true">
						<span />
						<span className="progress-bias__ends">
							<span>{t.palate.lower}</span>
							<span>{t.palate.group}</span>
							<span>{t.palate.higher}</span>
						</span>
						<span />
					</div>
					{rows.map((row) => {
						const pct = 50 + (Math.max(-RANGE, Math.min(RANGE, row.bias)) / RANGE) * 50;
						const word = biasWord(row.bias);
						return (
							<div key={row.attribute} className={`progress-bias progress-bias--${word}`}>
								<div className="progress-bias__name">
									<span>{t.palate.name[row.attribute]}</span>
									<span className="progress-bias__wines">
										{t.palate.wines(row.wines, row.attribute === 'Tannin' && type !== 'red')}
									</span>
								</div>
								<div className="progress-bias__track" aria-hidden="true">
									<span className="progress-bias__axis" />
									<span className="progress-bias__centre" />
									{STEP_TICKS.map((k) => (
										<span key={k} className="progress-bias__tick" style={{ left: `${k}%` }} />
									))}
									<span
										className="progress-bias__bar"
										style={{ left: `${Math.min(50, pct)}%`, width: `${Math.abs(pct - 50)}%` }}
									/>
									<span className="progress-bias__dot" style={{ left: `${pct}%` }} />
								</div>
								<div className="progress-bias__figure">
									<div>{signed(row.bias)}</div>
									<div className="progress-bias__word">{t.palate[word]}</div>
								</div>
							</div>
						);
					})}
					<p className="progress-summary">{t.palate.summary(words.high, words.low, words.inline)}</p>
				</>
			)}
		</Folio>
	);
}

function ProgressEmpty({
	list,
	name,
	since,
	t,
}: {
	list: ProgressTasting[];
	name: string;
	since: string | null;
	t: T;
}) {
	const ordered = [...list].sort((a, b) => a.number - b.number);
	const revealed = ordered.filter((x) => x.revealed);
	const waiting = ordered.filter((x) => !x.revealed);
	const needed = MIN_FOR_TREND - revealed.length;
	const slots = [
		...revealed.map((x) => ({ text: x.title, score: `${x.score} / ${x.outOf}`, kind: 'done' })),
		...waiting.slice(0, 1).map(() => ({ text: t.empty.waitingSlot, score: '—', kind: 'waiting' })),
	].slice(0, MIN_FOR_TREND);
	while (slots.length < MIN_FOR_TREND) {
		slots.push({ text: t.empty.nextSlot, score: '', kind: 'next' });
	}
	const firstWaiting = waiting[0];

	const actions = (
		<>
			{firstWaiting && (
				<Link href={`/archives/${firstWaiting.id}`} className="btn-primary progress-empty__reveal no-underline">
					{t.empty.reveal(firstWaiting.number)}
				</Link>
			)}
			<Link href="/tastings/start" className="progress-link progress-empty__start">
				{t.empty.start}
			</Link>
		</>
	);

	return (
		<div className="progress">
			<div className="progress__head progress__head--empty">
				<div>
					{since && <div className="progress__eyebrow progress__wide">{t.since(name, since)}</div>}
					<h1 className="progress__title">{t.title}</h1>
				</div>
			</div>
			<Totals
				className="progress-totals--empty"
				tiles={[
					{ label: t.totals.tastings, value: String(list.length) },
					{ label: t.totals.revealed, value: String(revealed.length) },
					{ label: t.totals.average, value: '—', sub: t.totals.afterThree, quiet: true },
					{ label: t.totals.bestRun, value: '—', sub: t.totals.afterThree, quiet: true },
				]}
			/>
			<div className="progress-card progress-empty">
				<div className="progress-empty__text">
					<h2 className="progress-h2">
						{revealed.length ? t.empty.title(needed) : t.empty.titleFresh} <em>{t.empty.titleEm}</em>
					</h2>
					<p className="progress-empty__body">
						<span className="progress__wide">{t.empty.body}</span>
						<span className="progress__narrow">{t.empty.bodyShort}</span>
					</p>
					<div className="progress-empty__actions progress__wide-flex">{actions}</div>
				</div>
				<div>
					<div className="progress-label progress__wide">{t.empty.soFar}</div>
					{slots.map((slot, i) => (
						<div key={i} className={`progress-slot progress-slot--${slot.kind}`}>
							<span className="progress-slot__n">{i + 1}</span>
							<span className="progress-slot__text">{slot.text}</span>
							<span className="progress-slot__score">{slot.score}</span>
						</div>
					))}
					<div className="progress-slot__foot">{t.empty.needed(revealed.length, MIN_FOR_TREND)}</div>
					<div className="progress-empty__actions progress__narrow-flex">{actions}</div>
				</div>
			</div>
		</div>
	);
}
