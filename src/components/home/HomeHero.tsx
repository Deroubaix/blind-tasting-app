'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthProvider } from '../auth/AuthProvider';
import ClientTastingService from '../../services/client/ClientTastingService';
import { compareReveal, isRevealed, revealTitle } from '../../utils/revealScore';
import { type TastingData } from '../../types/TastingData';
import { formatDate } from '../../utils/DateUtils';
import { gridOf } from '../../data/grids';
import { Figure, RevealCard } from './HomeSections';
import { useLang, useText } from '../../i18n/LanguageProvider';
import { homeText } from '../../i18n/home';

const service = new ClientTastingService();
type Saved = TastingData & { id: string; created_at: string };

/** A phone mid-tasting: the timer runs while you taste; the reveal comes after. */
function TastingPhone() {
	const t = useText(homeText).hero;
	const scales: [string, number][] = [
		['Acidity', 3],
		['Alcohol', 2],
		['Tannin', 1],
	];
	return (
		<div className="home-phone" aria-hidden="true">
			<div className="home-phone__bar">
				<span>
					<span className="muted-label">{t.phase03}</span>
					<strong>{t.palate}</strong>
				</span>
				<span className="home-phone__clock">3:12</span>
			</div>
			<div className="home-phone__steps">
				{[0, 1, 2, 3, 4].map((i) => (
					<span key={i} className={i < 2 ? 'is-done' : i === 2 ? 'is-on' : ''} />
				))}
			</div>
			{scales.map(([name, on]) => (
				<div key={name} className="home-phone__card">
					<span className="muted-label">{name}</span>
					<span className="home-phone__opts">
						{['Low', 'Med−', 'Med', 'Med+', 'High'].map((opt, i) => (
							<span key={opt} className={i === on ? 'is-on' : ''}>
								{opt}
							</span>
						))}
					</span>
				</div>
			))}
		</div>
	);
}

function RecentTastings({ tastings }: { tastings: Saved[] }) {
	const { lang } = useLang();
	const h = useText(homeText).hero;
	return (
		<div className="home-card home-recent">
			<div className="home-card__top">
				<span className="page-eyebrow">{h.recent}</span>
				<Link href="/archives" className="home-link">
					{h.archive}
				</Link>
			</div>
			<ol className="home-rows">
				{tastings.map((t) => {
					const revealed = isRevealed(t.reveal);
					const result = revealed
						? compareReveal(t.conclusion?.final, t.reveal!, null, gridOf(t.grid), lang)
						: null;
					return (
						<li key={t.id} className="home-row home-row--link">
							<span className="home-row__n">{t.number}</span>
							<Link href={`/archives/${t.id}`} className="home-row__text">
								<strong>
									{revealed
										? revealTitle(t.reveal!, lang)
										: t.wineName || t.conclusion?.final?.grapeVariety || h.untitled}
								</strong>
								<span className="home-muted">{formatDate(t.created_at, lang)}</span>
							</Link>
							{result ? (
								<Figure score={result.score} outOf={result.outOf} />
							) : (
								<span className="home-figure home-figure--md home-figure--pending">
									{h.notRevealed}
								</span>
							)}
						</li>
					);
				})}
			</ol>
		</div>
	);
}

export default function HomeHero() {
	const t = useText(homeText).hero;
	const { user, isInitialLoading } = useAuthProvider();
	const [recent, setRecent] = useState<Saved[] | null>(null);

	useEffect(() => {
		if (user) {
			service
				.getTastings()
				.then((tastings) => setRecent((tastings as Saved[]).slice(0, 3)))
				.catch(() => setRecent([]));
		}
	}, [user]);

	const loggedIn = !isInitialLoading && !!user;
	const showRecent = loggedIn && !!recent && recent.length > 0;

	return (
		<section className={`home-hero page-container${showRecent ? ' home-hero--recent' : ''}`}>
			<div className="home-hero__text">
				<span className="page-head__eyebrow">{t.eyebrow}</span>
				<h1 className="home-hero__title">
					{t.title} <em>{t.titleEm}</em>
				</h1>
				<p className="body-copy body-copy--lg home-hero__lede">{t.lede}</p>
				<div className="home-ctas">
					<Link href="/tastings/start" className="btn-primary">
						{t.start}
					</Link>
					{loggedIn ? (
						<>
							<Link href="/flights/new" className="btn-quiet">
								{t.host}
							</Link>
							<Link href="/flights/join" className="home-link">
								{t.joinCode}
							</Link>
						</>
					) : (
						<Link href="/flights/join" className="home-link">
							{t.haveCode}
						</Link>
					)}
				</div>
				{!loggedIn && <p className="home-note">{t.noAccount}</p>}
				<p className="home-note home-note--quiet">{t.notAffiliated}</p>
			</div>

			{showRecent ? (
				<div className="home-hero__visual home-hero__visual--recent">
					<RecentTastings tastings={recent} />
				</div>
			) : (
				<div className="home-hero__visual">
					<figure className="home-hero__moment home-hero__moment--taste">
						<figcaption className="muted-label">{t.whileYouTaste}</figcaption>
						<TastingPhone />
					</figure>
					<figure className="home-hero__moment">
						<figcaption className="muted-label">{t.afterReveal}</figcaption>
						<RevealCard />
					</figure>
				</div>
			)}
		</section>
	);
}
