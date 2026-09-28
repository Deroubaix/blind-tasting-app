import React from 'react';
import Link from 'next/link';
import { IconArrowRight } from '@tabler/icons-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { wineColors } from '../components/sight/sightData';
import { formatTimerSeconds, phaseSeconds } from '../data/timerData';

// Times are the guided 4:00 split, read from the timer settings so the page cannot drift from them.
const PHASES = [
	{
		num: '01',
		prefix: 'The',
		name: 'Sight',
		desc: 'Clarity, intensity of color, primary and secondary color, rim variation, staining, tearing, gas.',
		input: 'Selectable',
		time: formatTimerSeconds(phaseSeconds(240, 'sight')),
	},
	{
		num: '02',
		prefix: 'The',
		name: 'Nose',
		desc: 'Faults, intensity, age, fruit and fruit condition, non-fruit, earth, mineral, oak. Custom notes too.',
		input: 'Mixed',
		time: formatTimerSeconds(phaseSeconds(240, 'nose')),
	},
	{
		num: '03',
		prefix: 'The',
		name: 'Palate',
		desc: 'Sweetness, acidity, alcohol, body, tannin or phenolic bitterness, texture, balance, finish, complexity.',
		input: 'Selectable',
		time: formatTimerSeconds(phaseSeconds(240, 'palate')),
	},
	{
		num: '04',
		prefix: 'Initial',
		name: 'call',
		desc: 'Possible grape varieties, climate, possible countries, age range.',
		input: 'Mixed',
		time: formatTimerSeconds(phaseSeconds(240, 'initialConclusion')),
	},
	{
		num: '05',
		prefix: 'Final',
		name: 'conclusion',
		desc: 'Grape or blend, country, region and appellation, vintage — plus quality level and style where appropriate.',
		input: 'Search & pick',
		time: formatTimerSeconds(phaseSeconds(240, 'finalConclusion')),
	},
];

const SWATCHES = wineColors.red.primary.map((s, i) => ({
	...s,
	selected: i === 2,
}));

export default function Homepage() {
	return (
		<>
			<Header />
			<main className="home-page">
				{/* ── Hero ── */}
				<section className="hp-hero">
					<div className="hp-hero__left">
						<span className="hp-eyebrow">Built on the CMS deductive tasting method</span>

						<h1>
							The deductive
							<br />
							tasting sheet,
							<br />
							<em className="hp-hero__italic">digitized</em>
						</h1>

						<p className="hp-hero__lede">
							A practice ledger for sommelier students. Walk the five phases of the deductive method, with
							optional timers, then reveal the wine and see your call scored against the label.
						</p>

						{/* Log in lives in the nav; repeating it here left sign-up with no route in
						    from the landing page at all. */}
						<div className="hp-hero__ctas">
							<Link href="/tastings/start" className="btn-primary no-underline">
								Start a Tasting <IconArrowRight size={16} />
							</Link>
							<Link href="/signup" className="hp-link-quiet no-underline">
								Sign up
							</Link>
						</div>
					</div>

					<div className="hp-hero__right">
						{/* Main preview card — tasting in progress */}
						<article className="hp-preview hp-preview--main">
							<header className="hp-preview__head">
								<div className="hp-preview__phase">
									<span className="hp-phase-pip">01</span>
									<div>
										<span className="item-label hp-phase-title">Sight</span>
										<span className="hp-phase-sub">analytical pass</span>
									</div>
								</div>
								<div className="hp-preview__timer">
									<span className="hp-timer__label">Time</span>
									<span className="hp-timer__value">0:24</span>
								</div>
							</header>

							<div className="hp-preview__field">
								<div className="hp-field-q">
									<span>Primary color</span>
									<span className="hp-field-q__hint">Single select</span>
								</div>
								<div className="hp-swatch-grid">
									{SWATCHES.map(({ hex, name, selected }) => (
										<div
											key={name}
											className={`hp-swatch${selected ? ' hp-swatch--selected' : ''}`}
											style={{ background: hex }}
										>
											<span className="hp-swatch__name">{name}</span>
										</div>
									))}
								</div>
							</div>

							<div className="hp-preview__field">
								<div className="hp-field-q">
									<span>Intensity of color</span>
									<span className="hp-field-q__hint">Single select</span>
								</div>
								<div className="hp-pill-row">
									{['Pale', 'Medium−', 'Medium', 'Medium+', 'Deep'].map((label) => (
										<span
											key={label}
											className={`hp-pill${label === 'Medium' ? ' hp-pill--on' : ''}`}
										>
											{label}
										</span>
									))}
								</div>
							</div>

							<div className="hp-preview__field">
								<div className="hp-field-q">
									<span>Rim variation</span>
									<span className="hp-field-q__hint">Red wines</span>
								</div>
								<div className="hp-pill-row">
									{['Yes', 'No'].map((label) => (
										<span key={label} className={`hp-pill${label === 'Yes' ? ' hp-pill--on' : ''}`}>
											{label}
										</span>
									))}
								</div>
							</div>

							<footer className="hp-preview__foot">
								<div className="hp-progress">
									<div className="hp-progress__bar" />
									<span className="hp-progress__pct">3 / 8</span>
								</div>
								<span className="hp-next-cue">Next · Nose</span>
							</footer>
						</article>

						{/* Secondary card — a saved tasting after its reveal, scored as the archive shows it */}
						<article className="hp-preview hp-preview--ledger">
							<header className="hp-ledger__head">
								<span className="hp-ledger__badge">White · Revealed</span>
								<span className="hp-ledger__when">2 days ago</span>
							</header>
							<p className="hp-ledger__title">Sauvignon Blanc, Marlborough 2022</p>
							<p className="hp-ledger__sub">
								Your call · Sauvignon Blanc, New Zealand, Marlborough, 2023
							</p>
							<div className="hp-ledger__result">
								<span className="hp-ledger__result-label">Reveal score</span>
								<span className="hp-ledger__result-value">3 / 4</span>
							</div>
						</article>
					</div>
				</section>

				{/* ── The Method ── */}
				<section className="hp-method">
					<header className="hp-method__head">
						<div className="hp-method__head-left">
							<span className="hp-eyebrow">The Method</span>
							<h2 className="hp-method__h2">
								Five phases.
								<br />
								One <em className="hp-method__italic">tasting</em>.
							</h2>
						</div>
						<p className="hp-method__desc">
							Each session walks the five phases of the deductive tasting method in order, under an
							optional clock at exam pace. Save it, then unwrap the bottle: enter the label and your call
							is scored against it, field by field.
						</p>
					</header>

					<div className="hp-phase-grid">
						{PHASES.map(({ num, prefix, name, desc, input, time }) => (
							<article key={num} className="hp-phase-cell">
								<span className="hp-phase-cell__num">{num}</span>
								<h3 className="hp-phase-cell__name">
									{prefix} <em>{name}</em>
								</h3>
								<p className="hp-phase-cell__desc">{desc}</p>
								<div className="hp-phase-cell__foot">
									<span>{input}</span>
									<span className="hp-phase-cell__time">{time}</span>
								</div>
							</article>
						))}
					</div>
				</section>
			</main>
			<Footer />
		</>
	);
}
