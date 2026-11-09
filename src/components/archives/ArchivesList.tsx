'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconSearch } from '@tabler/icons-react';
import { useAuthProvider } from '../auth/AuthProvider';
import ClientTastingService from '../../services/client/ClientTastingService';
import { type SavedTasting, tastingRow } from '../../utils/tastingRow';
import { fold } from '../../utils/autocompleteMatch';
import { formatMonthYear, formatShortDate } from '../../utils/DateUtils';
import { gridOf } from '../../data/grids';
import { useLang, useText } from '../../i18n/LanguageProvider';
import { archivesText } from '../../i18n/archives';
import { commonText } from '../../i18n/common';

const service = new ClientTastingService();

type Filter = 'all' | 'cms' | 'wset' | 'waiting' | 'flights';

type Row = {
	tasting: SavedTasting;
	title: string;
	meta: string;
	score: { score: number; outOf: number } | null;
	month: string;
	haystack: string;
};

export default function ArchivesList({ title }: { title: string }) {
	const { user, isInitialLoading } = useAuthProvider();
	const [tastings, setTastings] = useState<SavedTasting[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadFailed, setLoadFailed] = useState(false);
	const [query, setQuery] = useState('');
	const [filter, setFilter] = useState<Filter>('all');
	const router = useRouter();
	const { lang } = useLang();
	const { list: t } = useText(archivesText);
	const common = useText(commonText);

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
			.catch(() => setLoadFailed(true))
			.finally(() => setIsLoading(false));
	}, [user, isInitialLoading, router]);

	const rows: Row[] = useMemo(
		() =>
			tastings.map((tasting) => {
				const { title, call, detail, score } = tastingRow(tasting, lang);
				const date = tasting.created_at ? formatShortDate(tasting.created_at, lang) : '';
				return {
					tasting,
					title,
					meta: [t.tasting(tasting.number), date, detail].filter(Boolean).join(' · '),
					score,
					month: tasting.created_at ? formatMonthYear(tasting.created_at, lang) : '',
					haystack: fold([title, call, tasting.notes ?? '', tasting.wineName ?? ''].join(' ')),
				};
			}),
		[tastings, lang, t],
	);

	if (isInitialLoading || isLoading) {
		return <div className="empty-state">{t.loading}</div>;
	}

	if (loadFailed) {
		return <div className="empty-state">{t.loadFailed}</div>;
	}

	const revealedCount = rows.filter((r) => r.score).length;
	const waiting = rows.length - revealedCount;
	const flightCount = new Set(tastings.map((x) => x.flight?.code).filter(Boolean)).size;
	const needle = fold(query.trim());
	const shown = rows.filter(({ tasting, score, haystack }) => {
		const grid = gridOf(tasting.grid);
		const keep =
			filter === 'all' ||
			(filter === 'cms' && grid === 'cms') ||
			(filter === 'wset' && grid === 'wset') ||
			(filter === 'waiting' && !score) ||
			(filter === 'flights' && !!tasting.flight);
		return keep && (!needle || haystack.includes(needle));
	});
	const months: { month: string; rows: Row[] }[] = [];
	for (const row of shown) {
		const last = months.at(-1);
		if (last && last.month === row.month) {
			last.rows.push(row);
		} else {
			months.push({ month: row.month, rows: [row] });
		}
	}

	const chips: [Filter, string][] = [
		['all', t.all],
		['cms', t.cms],
		['wset', t.wset],
		...(waiting ? ([['waiting', t.notRevealed(waiting)]] as [Filter, string][]) : []),
		...(flightCount ? ([['flights', t.flights]] as [Filter, string][]) : []),
	];

	return (
		<div className="archive">
			<header className="archive__head">
				<div>
					<h1>{title}</h1>
				</div>
				{rows.length > 0 && (
					<Link href="/tastings/start" className="btn-primary">
						{t.startTasting}
					</Link>
				)}
			</header>

			{rows.length > 0 && (
				<dl className="archive__figures">
					{(
						[
							[t.figures.tastings, rows.length],
							[t.figures.revealed, revealedCount],
							...(flightCount ? [[t.figures.flights, flightCount]] : []),
						] as [string, number][]
					).map(([label, n]) => (
						<div key={label}>
							<dt>{label}</dt>
							<dd>{n}</dd>
						</div>
					))}
				</dl>
			)}

			{rows.length === 0 ? (
				<div className="empty-state archives-empty">
					<p>{t.empty}</p>
					<Link href="/tastings/start" className="btn-primary">
						{t.startFirst}
					</Link>
				</div>
			) : (
				<>
					<div className="archive__search">
						<IconSearch size={18} aria-hidden="true" />
						<label htmlFor="archive-search" className="visually-hidden">
							{t.search}
						</label>
						<input
							id="archive-search"
							type="search"
							placeholder={t.searchPlaceholder}
							value={query}
							onChange={(e) => setQuery(e.target.value)}
						/>
					</div>
					<div className="chip-row" role="group" aria-label={t.filterLabel}>
						{chips.map(([key, label]) => (
							<button
								key={key}
								type="button"
								className="chip"
								aria-pressed={filter === key}
								onClick={() => setFilter(key)}
							>
								{label}
							</button>
						))}
					</div>

					{shown.length === 0 ? (
						<div className="empty-state">
							<p>{t.noMatch}</p>
							<button
								type="button"
								className="btn-quiet"
								onClick={() => {
									setQuery('');
									setFilter('all');
								}}
							>
								{t.clear}
							</button>
						</div>
					) : (
						months.map(({ month, rows }) => (
							<section key={month} className="archive__month" aria-label={month}>
								<h2>{month}</h2>
								<ul>
									{rows.map(({ tasting, title, meta, score }) => (
										<li key={tasting.id}>
											<Link href={`/archives/${tasting.id}`} className="archive-row">
												<strong>
													<span
														className={`archive-row__dot archive-row__dot--${tasting.wineType === 'White' ? 'white' : 'red'}`}
														aria-hidden="true"
													/>
													<span className="visually-hidden">
														{tasting.wineType === 'White' ? common.white : common.red}:{' '}
													</span>
													{title}
												</strong>
												<span className="archive-row__end">
													{score ? (
														<span
															className="figure"
															aria-label={t.score(score.score, score.outOf)}
														>
															{score.score}
															<span className="figure__of"> / {score.outOf}</span>
														</span>
													) : tasting.flight ? (
														<span className="archive-row__waiting">{t.awaitingHost}</span>
													) : (
														<span className="archive-row__reveal">{t.reveal} →</span>
													)}
												</span>
												<span className="archive-row__meta">{meta}</span>
											</Link>
										</li>
									))}
								</ul>
							</section>
						))
					)}
				</>
			)}
		</div>
	);
}
