'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthProvider } from '../auth/AuthProvider';
import ClientTastingService from '../../services/client/ClientTastingService';
import { compareReveal, isRevealed, revealTitle } from '../archives/revealScore';
import { type TastingData } from '../../types/TastingData';
import { formatDate } from '../../utils/DateUtils';
import { Figure, RevealCard } from './HomeSections';

const service = new ClientTastingService();
type Saved = TastingData & { id: string; created_at: string };

/** A phone mid-tasting: the timer runs while you taste; the reveal comes after. */
function TastingPhone() {
	const scales: [string, number][] = [
		['Acidity', 3],
		['Alcohol', 2],
		['Tannin', 1],
	];
	return (
		<div className="home-phone" aria-hidden="true">
			<div className="home-phone__bar">
				<span>
					<span className="home-label">Phase 03</span>
					<strong>Palate</strong>
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
					<span className="home-label">{name}</span>
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
	return (
		<div className="home-card home-recent">
			<div className="home-card__top">
				<span className="home-kicker">Recent tastings</span>
				<Link href="/archives" className="home-link no-underline">
					Archive →
				</Link>
			</div>
			<ol className="home-rows">
				{tastings.map((t) => {
					const revealed = isRevealed(t.reveal);
					const result = revealed ? compareReveal(t.conclusion?.final, t.reveal!) : null;
					return (
						<li key={t.id} className="home-row home-row--link">
							<span className="home-row__n">{t.number}</span>
							<Link href={`/archives/${t.id}`} className="home-row__text no-underline">
								<strong>
									{revealed
										? revealTitle(t.reveal!)
										: t.wineName || t.conclusion?.final?.grapeVariety || 'Untitled tasting'}
								</strong>
								<span className="home-muted">{formatDate(t.created_at)}</span>
							</Link>
							{result ? (
								<Figure score={result.score} outOf={result.outOf} />
							) : (
								<span className="home-figure home-figure--md home-figure--pending">Not revealed</span>
							)}
						</li>
					);
				})}
			</ol>
		</div>
	);
}

export default function HomeHero() {
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
		<section className={`home-hero${showRecent ? ' home-hero--recent' : ''}`}>
			<div className="home-hero__text">
				<span className="home-eyebrow">For the CMS deductive grid and the WSET Level 3 SAT</span>
				<h1 className="home-hero__title">
					Taste blind. Call it. <em>See how close you got.</em>
				</h1>
				<p className="home-hero__lede">
					Work each wine through its grid at exam pace: the CMS deduction to a final call, or the WSET
					Systematic Approach to a quality and readiness assessment. Then reveal the answer and see your call
					scored field by field, alone or with a study group on their own phones. Free.
				</p>
				<div className="home-ctas">
					<Link href="/tastings/start" className="btn-primary home-btn no-underline">
						Start a tasting →
					</Link>
					{loggedIn ? (
						<>
							<Link href="/flights/new" className="home-btn home-btn--outline no-underline">
								Host a flight
							</Link>
							<Link href="/flights/join" className="home-link no-underline">
								Join with a code
							</Link>
						</>
					) : (
						<Link href="/flights/join" className="home-link no-underline">
							Have a flight code? Join →
						</Link>
					)}
				</div>
				{!loggedIn && (
					<p className="home-note">
						No account needed to taste solo. Saving and flights need a free account.
					</p>
				)}
				<p className="home-note home-note--quiet">
					Not affiliated with the Court of Master Sommeliers or WSET.
				</p>
			</div>

			{showRecent ? (
				<div className="home-hero__visual home-hero__visual--recent">
					<RecentTastings tastings={recent} />
				</div>
			) : (
				<div className="home-hero__visual">
					<figure className="home-hero__moment home-hero__moment--taste">
						<figcaption className="home-label">While you taste</figcaption>
						<TastingPhone />
					</figure>
					<figure className="home-hero__moment">
						<figcaption className="home-label">After the reveal</figcaption>
						<RevealCard />
					</figure>
				</div>
			)}
		</section>
	);
}
