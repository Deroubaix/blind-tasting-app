'use client';

import React from 'react';
import Link from 'next/link';
import { Figure } from './HomeIntro';
import ShortDate from './ShortDate';
import { useTastingContext } from '../tasting/TastingContext';
import { PHASE_ORDER } from '../tasting/phaseCompletion';
import { type TastingRow } from '../../utils/tastingRow';
import { gridOf } from '../../data/grids';
import { type TimerPhase } from '../../data/timerData';
import { useText } from '../../i18n/LanguageProvider';
import { homeText } from '../../i18n/home';
import { archivesText } from '../../i18n/archives';
import { tastingText } from '../../i18n/tasting';

export type RecentTasting = TastingRow & {
	id: string;
	date: string;
	wineType: string | null;
	inFlight: boolean;
};

const PHASE_KEYS: TimerPhase[] = ['sight', 'nose', 'palate', 'initialConclusion', 'finalConclusion'];

const Dot = ({ wineType }: { wineType: string | null }) => (
	<span
		className={`home-recent__dot${wineType ? ` home-recent__dot--${wineType.toLowerCase()}` : ''}`}
		aria-hidden="true"
	/>
);

/** The tasting still open in this browser, if any; it lives only in memory until it is saved. */
function DraftRow() {
	const { tastingData } = useTastingContext();
	const d = useText(homeText).dashboard;
	const a = useText(archivesText).list;
	const short = useText(tastingText).sidebar.short;
	if (!tastingData.wineType) {
		return null;
	}
	const grid = gridOf(tastingData.grid);
	const furthest = Math.min(tastingData.furthestPhase ?? 0, PHASE_ORDER.length - 1);
	const phase = PHASE_KEYS[furthest];
	const flight = tastingData.flight;
	return (
		<li className="home-recent">
			<Dot wineType={tastingData.wineType} />
			<strong className="home-recent__title">
				{flight ? a.flightWine(flight.name, flight.wineNumber) : d.inProgress}
			</strong>
			<Link
				href={`${PHASE_ORDER[furthest]}?wineType=${tastingData.wineType.toLowerCase()}`}
				className="home-recent__end home-link"
			>
				{d.continue}
			</Link>
			<span className="home-recent__meta">
				{[grid === 'wset' ? a.wset : a.cms, phase ? d.atPhase(short[grid][phase]) : d.readyToSave].join(' · ')}
			</span>
		</li>
	);
}

/** Recent tastings: the one still open in this browser first, then the latest saved. */
export default function HomeRecent({ rows }: { rows: RecentTasting[] }) {
	const d = useText(homeText).dashboard;
	const a = useText(archivesText).list;
	const { tastingData } = useTastingContext();

	if (!rows.length && !tastingData.wineType) {
		return <p className="home-muted">{d.noTastings}</p>;
	}
	return (
		<ul className="home-rows">
			<DraftRow />
			{rows.map((row) => (
				<li key={row.id} className="home-recent">
					<Dot wineType={row.wineType} />
					<Link href={`/archives/${row.id}`} className="home-recent__title">
						<strong>{row.title}</strong>
					</Link>
					<span className="home-recent__end">
						{row.score ? (
							<Figure score={row.score.score} outOf={row.score.outOf} />
						) : row.inFlight ? (
							<span className="home-muted">{a.awaitingHost}</span>
						) : (
							<Link href={`/archives/${row.id}?reveal=1`} className="home-link">
								{d.reveal}
							</Link>
						)}
					</span>
					<span className="home-recent__meta">
						<ShortDate iso={row.date} /> · {row.detail}
					</span>
				</li>
			))}
		</ul>
	);
}
