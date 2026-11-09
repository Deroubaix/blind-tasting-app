import React from 'react';
import Link from 'next/link';
import CodeForm from '../layout/CodeForm';
import RevealOnScroll from './RevealOnScroll';
import Mark from '../misc/Mark';
import { compareReveal, type FieldStatus, type Reveal } from '../../utils/revealScore';
import { formatDecimal } from '../../utils/NumberUtils';
import { type homeText } from '../../i18n/home';
import { type Lang } from '../../i18n';

type HomeT = (typeof homeText)['en'];

/** Taste on your own, host a group, I have a code: the home page's three ways in, as ruled rows. */
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
			<div className="home-door">
				<H className="home-door__title">{d.solo}</H>
				<p className="home-door__body">
					{d.soloBody}
					{!loggedIn && d.soloNoAccount}
				</p>
				<div className="home-door__cta">
					<Link href="/tastings/start" className="btn-primary">
						{d.soloCta}
					</Link>
				</div>
			</div>
			<div className="home-door">
				<H className="home-door__title">{d.host}</H>
				<p className="home-door__body">{d.hostBody}</p>
				<div className="home-door__cta">
					<Link href="/flights/new" className="btn-quiet">
						{d.hostCta}
					</Link>
				</div>
			</div>
			<div className="home-door">
				<H className="home-door__title">{d.code}</H>
				<p className="home-door__body">{d.codeBody}</p>
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

function Steps({ steps }: { steps: Record<string, readonly string[]> }) {
	return (
		<ol className="home-steps">
			{Object.values(steps).map(([title, body], i) => (
				<li key={title} className="home-steps__item">
					<span className="home-steps__n" aria-hidden="true">
						{i + 1}.
					</span>
					<span>
						<strong>{title}</strong>
						<span>{body}</span>
					</span>
				</li>
			))}
		</ol>
	);
}

function SectionHead({ eyebrow, title, lede }: { eyebrow: string; title: string; lede: string }) {
	return (
		<div className="home-section__head">
			<p className="home-eyebrow">{eyebrow}</p>
			<h2>{title}</h2>
			<p className="home-section__lede">{lede}</p>
		</div>
	);
}

/** The logged-out home page. */
export default function HomeIntro({ t, status, lang }: { t: HomeT; status: Record<FieldStatus, string>; lang: Lang }) {
	const card = sampleScorecard(lang);
	const a = t.after;
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
				<SectionHead eyebrow={t.modes.soloEyebrow} title={t.modes.soloTitle} lede={t.modes.soloLede} />
				<Steps steps={t.modes.soloSteps} />
			</RevealOnScroll>

			<RevealOnScroll className="page-container home-section" id="group">
				<SectionHead eyebrow={t.modes.groupEyebrow} title={t.modes.groupTitle} lede={t.modes.groupLede} />
				<Steps steps={t.modes.groupSteps} />
			</RevealOnScroll>

			<RevealOnScroll className="page-container home-section" id="after">
				<SectionHead eyebrow={a.eyebrow} title={a.title} lede={a.lede} />
				<div className="home-after">
					<div className="home-sheet">
						<div className="home-sheet__head">
							<strong>{a.tasting(24)}</strong>
							<span className="home-muted">{a.marked}</span>
						</div>
						{card.fields.map((field, i) => (
							<div key={field.key} className="home-sheet__row">
								<span className="home-sheet__key">
									{t.columns[field.key as keyof HomeT['columns']]}
								</span>
								<span className="home-sheet__call">
									{field.call}
									{field.status !== 'correct' && (
										<>
											{' '}
											<span className="visually-hidden">{a.label}: </span>
											<span className="home-sheet__fix">{field.actual}</span>
										</>
									)}
								</span>
								<Mark
									status={field.status}
									word={status[field.status]}
									delay={0.2 + i * 0.35}
									className="home-mark"
								/>
							</div>
						))}
						<div className="home-sheet__total">
							<span className="home-muted">{a.score}</span>
							<span className="home-reveal-late" style={{ transitionDelay: '2s' }}>
								<Figure score={card.score} outOf={card.outOf} size="lg" />
							</span>
						</div>
					</div>

					<div className="home-lists">
						<div>
							<p className="home-lists__caption">{a.archiveCaption}</p>
							<ul className="home-rows home-rows--ruled">
								{Object.values(a.archiveRows).map(([title, meta], i) => (
									<li key={title} className="home-row">
										<span>
											<strong>{title}</strong>
											<span className="home-row__field">{meta}</span>
										</span>
										{i < 2 ? (
											<Figure score={i === 0 ? 4 : 2} outOf={5} />
										) : (
											<span className="home-link">{a.reveal}</span>
										)}
									</li>
								))}
							</ul>
						</div>
						<div>
							<p className="home-lists__caption">{a.habitsCaption}</p>
							<ul className="home-rows home-rows--ruled">
								<li className="home-row">
									<span>{a.rolling}</span>
									<span>
										<Figure score={formatDecimal(3.1, lang)} />{' '}
										<span className="home-muted home-row__aside">
											{a.upFrom} {formatDecimal(1.8, lang)}
										</span>
									</span>
								</li>
								{Object.values(a.confusions).map(([call, actual, count]) => (
									<li key={call} className="home-row">
										<span>
											{a.youCall} <strong>{call}</strong>, {a.itWas}{' '}
											<span className="home-sheet__fix">{actual}</span>
										</span>
										<span className="home-row__count">{count}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
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
