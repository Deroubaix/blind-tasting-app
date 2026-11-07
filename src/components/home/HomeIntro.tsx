import React from 'react';
import Link from 'next/link';
import { IconGlassFull, IconKeyboard, IconUsers } from '@tabler/icons-react';
import CodeForm from '../layout/CodeForm';
import RevealOnScroll from './RevealOnScroll';
import { compareReveal, type FieldStatus, type Reveal } from '../../utils/revealScore';
import { ALL_TIMER_PRESETS, formatTimerSeconds } from '../../data/timerData';
import { formatDecimal } from '../../utils/NumberUtils';
import { type homeText } from '../../i18n/home';
import { type Lang } from '../../i18n';

type HomeT = (typeof homeText)['en'];

/** Taste on your own, host a group, I have a code: the home page's three ways in. */
export function StartDoors({
	t,
	heading: H = 'h2',
	loggedIn = false,
}: {
	t: HomeT;
	heading?: 'h2' | 'h3';
	loggedIn?: boolean;
}) {
	const d = t.doors;
	return (
		<div className="home-doors" id="code">
			<div className="home-card home-door">
				<div className="home-door__top">
					<span className="home-door__icon" aria-hidden="true">
						<IconGlassFull size={20} stroke={1.8} />
					</span>
					<H className="home-door__title">{d.solo}</H>
				</div>
				<p>
					{d.soloBody}
					{!loggedIn && d.soloNoAccount}
				</p>
				<Link href="/tastings/start" className="btn-primary home-door__cta">
					{d.soloCta}
				</Link>
			</div>
			<div className="home-card home-door">
				<div className="home-door__top">
					<span className="home-door__icon" aria-hidden="true">
						<IconUsers size={20} stroke={1.8} />
					</span>
					<H className="home-door__title">{d.host}</H>
				</div>
				<p>{d.hostBody}</p>
				<Link href="/flights/new" className="btn-quiet home-door__cta">
					{d.hostCta}
				</Link>
			</div>
			<div className="home-card home-door">
				<div className="home-door__top">
					<span className="home-door__icon" aria-hidden="true">
						<IconKeyboard size={20} stroke={1.8} />
					</span>
					<H className="home-door__title">{d.code}</H>
				</div>
				<p>{d.codeBody}</p>
				<div className="home-door__cta">
					<CodeForm id="home-code" />
				</div>
			</div>
		</div>
	);
}

/** "3 / 5": the serif figure with a quieter denominator. */
export function Figure({ score, outOf, size = 'md' }: { score: React.ReactNode; outOf?: number; size?: 'md' | 'lg' }) {
	return (
		<span className={`home-fig home-fig--${size}`}>
			{score}
			{outOf !== undefined && <span className="home-fig__of"> / {outOf}</span>}
		</span>
	);
}

// The sample call: grape, country and vintage right, the region a near miss, the quality level wrong.
const SAMPLE_LABEL: Reveal = {
	grapeVariety: 'Pinot Noir',
	countryOfOrigin: 'France',
	regionAppellation: 'Chambolle-Musigny',
	qualityLevel: 'Village',
	vintage: '2018',
};
const SAMPLE_CALL = {
	grapeVariety: 'Pinot Noir',
	countryOfOrigin: 'France',
	regionAppellation: 'Gevrey-Chambertin',
	qualityLevel: 'Premier Cru',
	vintage: '2018',
};

export const sampleScorecard = (lang: Lang) => compareReveal(SAMPLE_CALL, SAMPLE_LABEL, null, 'cms', lang);

export function StatusTag({ status, word, delay }: { status: FieldStatus; word: string; delay?: number }) {
	return (
		<span
			className={`home-tag home-tag--${status}`}
			style={delay === undefined ? undefined : { transitionDelay: `${delay}s` }}
		>
			<i aria-hidden="true" />
			{word}
		</span>
	);
}

function Steps({ steps }: { steps: Record<string, readonly string[]> }) {
	return (
		<ol className="home-steps">
			{Object.values(steps).map(([title, body], i) => (
				<li key={title} className="home-steps__item">
					<span className="home-steps__n">{i + 1}</span>
					<span>
						<strong>{title}</strong>
						<span>{body}</span>
					</span>
				</li>
			))}
		</ol>
	);
}

/** The logged-out home page. */
export default function HomeIntro({ t, status, lang }: { t: HomeT; status: Record<FieldStatus, string>; lang: Lang }) {
	const card = sampleScorecard(lang);
	const bars = [30, 20, 45, 40, 60, 55, 70, 65, 80, 75];
	return (
		<>
			<section className="page-container home-hero">
				<p className="home-eyebrow">{t.hero.eyebrow}</p>
				<h1 className="home-hero__title">{t.hero.title}</h1>
				<p className="home-hero__lede">{t.hero.lede}</p>
				<StartDoors t={t} />
				<p className="home-note">{t.hero.note}</p>
			</section>

			<RevealOnScroll className="page-container home-section" id="solo">
				<div className="home-section__head">
					<h2>{t.modes.title}</h2>
					<p>{t.modes.lede}</p>
				</div>
				<div className="home-modes">
					<article className="home-card home-mode">
						<div className="home-mode__kicker">
							<span className="home-pill">{t.modes.soloTag}</span>
							<span>{t.modes.soloKicker}</span>
						</div>
						<h3>{t.modes.soloTitle}</h3>
						<Steps steps={t.modes.soloSteps} />
						<Link href="/tastings/start" className="btn-primary home-mode__cta">
							{t.modes.soloCta}
						</Link>
					</article>
					<article className="home-card home-mode" id="group">
						<div className="home-mode__kicker">
							<span className="home-pill">{t.modes.groupTag}</span>
							<span>{t.modes.groupKicker}</span>
						</div>
						<h3>{t.modes.groupTitle}</h3>
						<Steps steps={t.modes.groupSteps} />
						<div className="home-ctas">
							<Link href="/flights/new" className="btn-quiet">
								{t.modes.groupCta}
							</Link>
							<Link href="/flights/join" className="home-link">
								{t.modes.haveCode}
							</Link>
						</div>
					</article>
				</div>
			</RevealOnScroll>

			<RevealOnScroll className="page-container home-section" id="after">
				<div className="home-section__head">
					<h2>{t.after.title}</h2>
					<p>{t.after.lede}</p>
				</div>
				<div className="home-after">
					<article className="home-card home-after__card">
						<h3>{t.after.scorecard}</h3>
						<p>{t.after.scorecardBody}</p>
						<div className="home-rows">
							{card.fields.map((field, i) => (
								<div key={field.key} className="home-row">
									<span>
										<span className="home-row__field">
											{t.columns[field.key as keyof HomeT['columns']]}
										</span>
										{field.call}
										{field.status !== 'correct' && (
											<span className="home-muted">
												{' '}
												· {t.after.label}: {field.actual}
											</span>
										)}
									</span>
									<StatusTag
										status={field.status}
										word={status[field.status]}
										delay={0.2 + i * 0.4}
									/>
								</div>
							))}
							<div className="home-row home-row--total">
								<strong>{t.after.tasting(24)}</strong>
								<span className="home-reveal-late" style={{ transitionDelay: '2.3s' }}>
									<Figure score={card.score} outOf={card.outOf} size="lg" />
								</span>
							</div>
						</div>
					</article>
					<article className="home-card home-after__card">
						<h3>{t.after.archive}</h3>
						<p>{t.after.archiveBody}</p>
						<div className="home-rows">
							{Object.values(t.after.archiveRows).map(([title, meta], i) => (
								<div key={title} className="home-row">
									<span>
										<strong>{title}</strong>
										<span className="home-row__field">{meta}</span>
									</span>
									{i < 2 ? (
										<Figure score={i === 0 ? 4 : 2} outOf={5} />
									) : (
										<span className="home-link">{t.after.reveal}</span>
									)}
								</div>
							))}
						</div>
					</article>
					<article className="home-card home-after__card">
						<h3>{t.after.progress}</h3>
						<p>{t.after.progressBody}</p>
						<div className="home-trend">
							<span>
								{t.after.rolling} <Figure score={formatDecimal(3.1, lang)} />{' '}
								<span className="home-muted">
									{t.after.upFrom} {formatDecimal(1.8, lang)}
								</span>
							</span>
							<div className="home-bars" aria-hidden="true">
								{bars.map((h, i) => (
									<i
										key={i}
										className={i === bars.length - 1 ? 'is-on' : ''}
										style={{ height: `${h}%` }}
									/>
								))}
							</div>
						</div>
						<div className="home-rows">
							{Object.values(t.after.confusions).map(([call, actual, count]) => (
								<div key={call} className="home-row">
									<span>
										<span className="home-row__field">{t.after.youCall}</span>
										{call}, <span className="home-muted">{t.after.itWas}</span> {actual}
									</span>
									<span className="home-fig home-fig--sm">{count}</span>
								</div>
							))}
						</div>
					</article>
				</div>
			</RevealOnScroll>

			<RevealOnScroll className="page-container home-section">
				<div className="home-section__head">
					<h2>{t.pace.title}</h2>
					<p>{t.pace.lede}</p>
				</div>
				<div className="home-pace">
					{ALL_TIMER_PRESETS.map(({ seconds }) => (
						<div key={seconds} className="home-card home-pace__card">
							<span className="home-fig home-fig--xl">{formatTimerSeconds(seconds)}</span>
							<strong>{t.pace.presets[seconds][0]}</strong>
							<span className="home-muted">{t.pace.presets[seconds][1]}</span>
						</div>
					))}
				</div>
			</RevealOnScroll>

			<RevealOnScroll className="page-container home-closing">
				<h2>{t.closing.title}</h2>
				<p>{t.closing.lede}</p>
				<div className="home-ctas">
					<Link href="/tastings/start" className="btn-primary">
						{t.closing.start}
					</Link>
					<Link href="/flights/new" className="btn-quiet">
						{t.closing.host}
					</Link>
					<Link href="/flights/join" className="home-link">
						{t.closing.haveCode}
					</Link>
				</div>
			</RevealOnScroll>
		</>
	);
}
