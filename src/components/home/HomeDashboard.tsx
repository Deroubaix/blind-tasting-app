import React from 'react';
import Link from 'next/link';
import { Figure, StartDoors } from './HomeIntro';
import {
	type PalateSample,
	type ProgressTasting,
	biasWord,
	homeHabits,
	revealedFor,
	rollingAverage,
	share,
	signedSteps,
} from '../../utils/progressStats';
import { formatDecimal } from '../../utils/NumberUtils';
import HomeRecent, { type RecentTasting } from './HomeRecent';
import { type FlightListItem } from '../../types/Flight';
import { type homeText } from '../../i18n/home';
import { flightsText } from '../../i18n/flights';
import { progressText } from '../../i18n/progress';
import { termIn } from '../../i18n/terms';
import { type Lang } from '../../i18n';

type HomeT = (typeof homeText)['en'];

export const RECENT_COUNT = 5;

/** The latest rolling average on the grid with the most revealed tastings, as Progress shows it. */
function latestAverage(list: ProgressTasting[], lang: Lang) {
	const wset = list.filter((x) => x.revealed && x.grid === 'wset').length;
	const cms = list.filter((x) => x.revealed && x.grid === 'cms').length;
	const grid = wset > cms ? 'wset' : 'cms';
	const revealed = revealedFor(list, grid, 'all');
	if (!revealed.length) {
		return null;
	}
	const value = rollingAverage(revealed.map(share)).at(-1)!;
	return grid === 'wset'
		? { score: `${Math.round(value * 100)}%`, outOf: undefined }
		: { score: formatDecimal(value * 5, lang), outOf: 5 };
}

/** The greeting's second line: the most pressing two facts, or nothing when there is nothing to say. */
function summary(d: HomeT['dashboard'], counts: { week: number; waiting: number }, liveHosted: number, empty: boolean) {
	if (empty) {
		return d.sub.newAccount;
	}
	const facts = [
		liveHosted && d.sub.hosting(liveHosted),
		counts.waiting && d.sub.waiting(counts.waiting),
		counts.week && d.sub.week(counts.week),
	].filter((fact): fact is string => !!fact);
	const line = facts.slice(0, 2).join(' · ');
	return line && line[0].toUpperCase() + line.slice(1);
}

/** The logged-in home page: recent tastings beside flights and progress, then the ways to start. */
export default function HomeDashboard({
	t,
	firstName,
	tastings,
	recent,
	counts,
	flights,
	palate,
	lang,
}: {
	t: HomeT;
	firstName: string;
	tastings: ProgressTasting[];
	recent: RecentTasting[];
	counts: { week: number; waiting: number };
	flights: FlightListItem[];
	palate: PalateSample[];
	lang: Lang;
}) {
	const d = t.dashboard;
	const f = flightsText[lang];
	const average = latestAverage(tastings, lang);
	const habits = homeHabits(tastings, palate);
	const { confusion, bias } = habits ?? { confusion: null, bias: null };
	const liveHosted = flights.filter((x) => x.role === 'host' && !x.ended).length;
	const sub = summary(d, counts, liveHosted, !tastings.length && !flights.length);
	return (
		<>
			<section className="page-container home-dash">
				<div className="home-dash__greeting">
					<h1 className="home-dash__title">{d.hello(firstName)}</h1>
					{sub && <p className="home-muted">{sub}</p>}
				</div>
				<div className="home-dash__cols">
					<section className="home-dash__col">
						<div className="home-dash__head">
							<h2>{d.recent}</h2>
							{tastings.length > 0 && (
								<Link href="/archives" className="home-link">
									{d.archive(tastings.length)}
								</Link>
							)}
						</div>
						<HomeRecent rows={recent} />
					</section>

					<div className="home-dash__stack">
						<section className="home-dash__col">
							<div className="home-dash__head">
								<h2>{d.flights}</h2>
								{flights.length > 0 && (
									<Link href="/flights" className="home-link">
										{d.allFlights(flights.length)}
									</Link>
								)}
							</div>
							{flights.length ? (
								<ul className="home-rows">
									{flights.slice(0, 3).map((x) => (
										<li key={x.code}>
											<Link href={`/flights/${x.code}`} className="home-recent home-recent--link">
												<strong className="home-recent__title">{x.name}</strong>
												{!x.ended && (
													<span className="home-recent__end home-link">{f.list.open}</span>
												)}
												<span className="home-recent__meta">
													{[
														x.role === 'host' ? f.list.hostedByYou : f.list.joined,
														x.ended ? d.ended : d.live,
														x.ended
															? d.wines(x.wineCount)
															: f.bits.revealedOf(x.revealed, x.wineCount),
														x.role === 'host' && f.bits.tasters(x.memberCount),
													]
														.filter(Boolean)
														.join(' · ')}
												</span>
											</Link>
										</li>
									))}
								</ul>
							) : (
								<p className="home-muted">{d.noFlights}</p>
							)}
						</section>

						<section className="home-dash__col">
							<div className="home-dash__head">
								<h2>{d.progress}</h2>
								{average && (
									<Link href="/progress" className="home-link">
										{d.seeProgress}
									</Link>
								)}
							</div>
							{average ? (
								<ul className="home-rows">
									<li className="home-row">
										<span>{d.rolling}</span>
										<Figure score={average.score} outOf={average.outOf} />
									</li>
									{confusion && (
										<li className="home-row">
											<span>
												{d.youCall}
												<strong>{termIn(lang, confusion.call)}</strong>
												{d.itWas}
												<em className="home-habit__actual">{termIn(lang, confusion.actual)}</em>
											</span>
											<span className="home-fig">
												{confusion.n}
												<span className="home-fig__of"> {d.of(confusion.of)}</span>
											</span>
										</li>
									)}
									{bias && (
										<li className="home-row">
											<span>
												{d.againstGroup(progressText[lang].palate.name[bias.attribute])}
											</span>
											<span className="home-fig">
												{signedSteps(bias.bias, lang)}
												<span className="home-fig__of">
													{' '}
													{d.runs[biasWord(bias.bias) === 'high' ? 'high' : 'low']}
												</span>
											</span>
										</li>
									)}
								</ul>
							) : (
								<p className="home-muted">{d.noProgress}</p>
							)}
							{average && !habits && <p className="home-note">{d.habitsAfter}</p>}
							{average && habits && !confusion && !bias && <p className="home-note">{d.noHabits}</p>}
						</section>
					</div>
				</div>
			</section>

			<section className="page-container home-section home-section--stack">
				<div className="home-section__head">
					<h2>{d.startTitle}</h2>
				</div>
				<StartDoors t={t} heading="h3" loggedIn />
			</section>
		</>
	);
}
