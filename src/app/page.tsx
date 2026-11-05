import React from 'react';
import Link from 'next/link';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HomeHero from '../components/home/HomeHero';
import {
	ArchivePreview,
	CtaLinks,
	ExamPace,
	FlightPreview,
	Folio,
	GridPhases,
	RevealTable,
	Who,
} from '../components/home/HomeSections';
import { homeText } from '../i18n/home';
import { getText } from '../i18n/server';

export default async function Homepage() {
	const t = (await getText(homeText)).page;
	const steps = t.steps.filter((_, i) => i % 2 === 0).map((title, i) => [title, t.steps[i * 2 + 1]]);
	return (
		<>
			<Header />
			<main className="home">
				<HomeHero />

				<Folio n={1}>
					<div className="home-split">
						<div>
							<h2 className="home-h2">
								{t.scoredTitle} <em>{t.scoredEm}</em>.
							</h2>
							<p className="home-lede">{t.scoredLede}</p>
							<p className="home-p">{t.scoredP1}</p>
							<p className="home-p">{t.scoredP2}</p>
						</div>
						<RevealTable />
					</div>
				</Folio>

				<Folio n={2} id="flights" tint>
					<div className="home-flights__head">
						<div>
							<span className="home-eyebrow">{t.studyGroups}</span>
							<h2 className="home-h2 home-h2--lg">
								{t.flightsTitle} <em>{t.flightsEm}</em>.
							</h2>
						</div>
						<div className="home-ctas home-ctas--tight">
							<Link href="/flights/new" className="btn-primary home-btn no-underline">
								{t.host}
							</Link>
							<Link href="/flights/join" className="home-btn home-btn--outline no-underline">
								{t.join}
							</Link>
						</div>
					</div>
					<ol className="home-steps">
						{steps.map(([title, body], i) => (
							<li key={title} className="home-steps__item">
								<span className="home-figure home-figure--xl">{String(i + 1).padStart(2, '0')}</span>
								<span>
									<strong>{title}</strong>
									<span className="home-muted">{body}</span>
								</span>
							</li>
						))}
					</ol>
					<FlightPreview />
					<p className="home-p home-p--wide">{t.structureNote}</p>
				</Folio>

				<Folio n={3}>
					<div className="home-split home-split--even">
						<div>
							<h2 className="home-h2">
								{t.paceTitle} <em>{t.paceEm}</em>
								{t.paceTail}
							</h2>
							<p className="home-lede">{t.paceLede}</p>
						</div>
						<ExamPace />
					</div>
				</Folio>

				<Folio n={4} id="grid">
					<h2 className="home-h2">
						{t.gridTitle} <em>{t.gridEm}</em>.
					</h2>
					<GridPhases />
				</Folio>

				<Folio n={5}>
					<div className="home-split home-split--even home-split--end">
						<h2 className="home-h2">
							{t.archiveTitle} <em>{t.archiveEm}</em>.
						</h2>
						<p className="home-lede">{t.archiveLede}</p>
					</div>
					<ArchivePreview />
				</Folio>

				<Folio n={6}>
					<span className="home-eyebrow home-eyebrow--plain">{t.whoFor}</span>
					<Who />
				</Folio>

				<section className="home-closing-wrap">
					<div className="home-closing">
						<h2 className="home-h2 home-h2--xl">
							{t.closingTitle} <em>{t.closingEm}</em>
						</h2>
						<p className="home-lede">{t.closingLede}</p>
						<CtaLinks />
					</div>
				</section>
			</main>
			<Footer />
		</>
	);
}
