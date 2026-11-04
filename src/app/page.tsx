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
	WHO,
} from '../components/home/HomeSections';

const STEPS = [
	['Pour and bag the wines', 'Number them, then share a join code or QR with the group.'],
	['Everyone tastes on their own phone', 'In any order, each on their own clock.'],
	['Reveal each label once', 'Everyone who submitted is scored together, side by side.'],
];

export default function Homepage() {
	return (
		<>
			<Header />
			<main className="home">
				<HomeHero />

				<Folio n={1}>
					<div className="home-split">
						<div>
							<h2 className="home-h2">
								Scored against <em>the label</em>.
							</h2>
							<p className="home-lede">
								Unwrap the bottle and enter what&apos;s on the label. Each field of your final
								conclusion comes back Correct, Close or Wrong, with one point for every exact match.
							</p>
							<p className="home-p">
								Close covers the near misses: a vintage within two years, or the right region with a
								different appellation. Blank fields show as Not called. A field the label doesn&apos;t
								carry drops out of the total.
							</p>
							<p className="home-p">
								Where the CMS core list treats regions as interchangeable for a grape, such as Napa
								Valley, Sonoma County or Central Coast for Cabernet, they score as correct.
							</p>
						</div>
						<RevealTable />
					</div>
				</Folio>

				<Folio n={2} id="flights" tint>
					<div className="home-flights__head">
						<div>
							<span className="home-eyebrow">Study groups</span>
							<h2 className="home-h2 home-h2--lg">
								Flights: taste as <em>a group</em>.
							</h2>
						</div>
						<div className="home-ctas home-ctas--tight">
							<Link href="/flights/new" className="btn-primary home-btn no-underline">
								Host a flight
							</Link>
							<Link href="/flights/join" className="home-btn home-btn--outline no-underline">
								Join a flight
							</Link>
						</div>
					</div>
					<ol className="home-steps">
						{STEPS.map(([title, body], i) => (
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
					<p className="home-p home-p--wide">
						Structure isn&apos;t scored, because the label can&apos;t tell you what the acidity is. But
						you&apos;ll see where the group split, and whose tannin call led them to Nebbiolo.
					</p>
				</Folio>

				<Folio n={3}>
					<div className="home-split home-split--even">
						<div>
							<h2 className="home-h2">
								At <em>exam</em> pace.
							</h2>
							<p className="home-lede">
								Guided gives each phase its own clock while you learn to pace. Exam runs one clock for
								the whole wine, as the exam does. Pause when you step away.
							</p>
						</div>
						<ExamPace />
					</div>
				</Folio>

				<Folio n={4} id="grid">
					<h2 className="home-h2">
						The grid, <em>phase by phase</em>.
					</h2>
					<GridPhases />
				</Folio>

				<Folio n={5}>
					<div className="home-split home-split--even home-split--end">
						<h2 className="home-h2">
							Your <em>archive</em>.
						</h2>
						<p className="home-lede">
							Every sheet is saved, so you can look back and see how your calls held up.
						</p>
					</div>
					<ArchivePreview />
				</Folio>

				<Folio n={6}>
					<span className="home-eyebrow home-eyebrow--plain">Who it&apos;s for</span>
					<ul className="home-who">
						{WHO.map(([title, body]) => (
							<li key={title}>
								<strong>{title}</strong>
								<span className="home-muted">{body}</span>
							</li>
						))}
					</ul>
				</Folio>

				<section className="home-closing-wrap">
					<div className="home-closing">
						<h2 className="home-h2 home-h2--xl">
							Pour a glass. <em>Open the grid.</em>
						</h2>
						<p className="home-lede">Free. Delete your account and everything in it any time.</p>
						<CtaLinks />
					</div>
				</section>
			</main>
			<Footer />
		</>
	);
}
