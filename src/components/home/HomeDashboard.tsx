import React from 'react';
import Link from 'next/link';
import { Figure, StartDoors } from './HomeIntro';
import { type ProgressTasting, revealedFor, rollingAverage, share } from '../../utils/progressStats';
import { formatDecimal } from '../../utils/NumberUtils';
import ShortDate from './ShortDate';
import { type FlightListItem } from '../../types/Flight';
import { type homeText } from '../../i18n/home';
import { type Lang } from '../../i18n';

type HomeT = (typeof homeText)['en'];

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

/** The logged-in home page: recent tastings, flights and progress, then the ways to start. */
export default function HomeDashboard({
	t,
	firstName,
	tastings,
	flights,
	lang,
}: {
	t: HomeT;
	firstName: string;
	tastings: ProgressTasting[];
	flights: FlightListItem[];
	lang: Lang;
}) {
	const d = t.dashboard;
	const average = latestAverage(tastings, lang);
	return (
		<>
			<section className="page-container home-dash">
				<p className="home-eyebrow">{d.eyebrow}</p>
				<h1 className="home-dash__title">{d.hello(firstName)}</h1>
				<div className="home-dash__cards">
					<section className="home-card home-dash__card">
						<div className="home-dash__head">
							<h2>{d.recent}</h2>
							{tastings.length > 0 && (
								<Link href="/archives" className="home-link">
									{d.archive}
								</Link>
							)}
						</div>
						{tastings.length ? (
							<ul className="home-rows">
								{tastings.slice(0, 3).map((x) => (
									<li key={x.id} className="home-row">
										<Link href={`/archives/${x.id}`} className="home-row__main">
											<strong>{x.title || d.untitled}</strong>
											<span className="home-row__field">
												<ShortDate iso={x.date} />
											</span>
										</Link>
										{x.revealed ? (
											<Figure score={x.score} outOf={x.outOf} />
										) : (
											<Link href={`/archives/${x.id}?reveal=1`} className="home-link">
												{d.reveal}
											</Link>
										)}
									</li>
								))}
							</ul>
						) : (
							<p className="home-muted">{d.noTastings}</p>
						)}
					</section>

					<section className="home-card home-dash__card">
						<div className="home-dash__head">
							<h2>{d.flights}</h2>
							{flights.length > 0 && (
								<Link href="/flights" className="home-link">
									{d.all}
								</Link>
							)}
						</div>
						{flights.length ? (
							<ul className="home-rows">
								{flights.slice(0, 3).map((f) => (
									<li key={f.code} className="home-row">
										<Link href={`/flights/${f.code}`} className="home-row__main">
											<strong>{f.name}</strong>
										</Link>
										<span className="home-muted">
											{f.ended ? d.ended : d.revealed(f.revealed, f.wineCount)}
										</span>
									</li>
								))}
							</ul>
						) : (
							<p className="home-muted">{d.noFlights}</p>
						)}
					</section>

					<section className="home-card home-dash__card">
						<div className="home-dash__head">
							<h2>{d.progress}</h2>
							{average && (
								<Link href="/progress" className="home-link">
									{d.seeProgress}
								</Link>
							)}
						</div>
						{average ? (
							<div className="home-row home-row--first">
								<span>{d.rolling}</span>
								<Figure score={average.score} outOf={average.outOf} />
							</div>
						) : (
							<p className="home-muted">{d.noProgress}</p>
						)}
					</section>
				</div>
			</section>

			<section className="page-container home-section">
				<div className="home-section__head">
					<h2>{d.startTitle}</h2>
				</div>
				<StartDoors t={t} heading="h3" />
			</section>
		</>
	);
}
