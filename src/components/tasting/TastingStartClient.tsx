'use client';

import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import {
	IconGlassFull,
	IconBottle,
	IconVolume,
	IconVolumeOff,
	IconStopwatch,
	IconX,
	IconArrowRight,
	IconInfoCircle,
} from '@tabler/icons-react';
import { useToastProvider } from '../toast/ToastProvider';
import { useTastingContext } from '../../components/tasting/TastingContext';
import { unlockAudio } from '../../utils/beep';
import {
	DEFAULT_TIMER_MODE,
	type TimerMode,
	type TimerPhase,
	defaultTimerSeconds,
	formatTimerSeconds,
	phaseSeconds,
	timerPresets,
} from '../../data/timerData';
import { DEFAULT_GRID, GRIDS, type Grid, gridOf } from '../../data/grids';
import { useText } from '../../i18n/LanguageProvider';
import { commonText } from '../../i18n/common';
import { tastingText } from '../../i18n/tasting';

const TIMER_MODES: TimerMode[] = ['guided', 'exam'];

const PHASE_KEYS: Record<Grid, { num: string; key: TimerPhase }[]> = {
	cms: [
		{ num: '01', key: 'sight' },
		{ num: '02', key: 'nose' },
		{ num: '03', key: 'palate' },
		{ num: '04', key: 'initialConclusion' },
		{ num: '05', key: 'finalConclusion' },
	],
	wset: [
		{ num: '01', key: 'sight' },
		{ num: '02', key: 'nose' },
		{ num: '03', key: 'palate' },
		{ num: '04', key: 'finalConclusion' },
	],
};

/**
 * The last settings a taster started with, so a flight of six wines is set up once, not six
 * times. Only in this browser: a convenience, not something the account needs to keep. Its
 * absence is also how a first visit is recognised.
 */
const SETTINGS_KEY = 'ledger:start-settings';

type StartSettings = {
	grid: Grid;
	soundEnabled: boolean;
	timerEnabled: boolean;
	timerSeconds: number;
	timerMode: TimerMode;
};

/** The stored settings as a raw string: a stable snapshot for useSyncExternalStore. */
function readRawSettings(): string | null {
	try {
		return window.localStorage.getItem(SETTINGS_KEY);
	} catch {
		return null;
	}
}

function parseSettings(raw: string | null | undefined): Partial<StartSettings> | null {
	if (!raw) {
		return null;
	}
	try {
		return JSON.parse(raw) as Partial<StartSettings>;
	} catch {
		return null;
	}
}

// Nothing else writes the settings while this page is open, so there is nothing to subscribe to.
const noSubscription = () => () => {};

/** When a whole-wine clock started now runs out. */
const examDeadline = (seconds: number) => Date.now() + seconds * 1000;

function writeSettings(settings: StartSettings) {
	try {
		window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
	} catch {
		// Private mode or storage blocked: the defaults will do next time.
	}
}

export default function TastingStartClient() {
	const router = useRouter();
	const { showToast } = useToastProvider();
	const { updateTastingData } = useTastingContext();
	const text = useText(tastingText);
	const t = text.start;
	const common = useText(commonText);

	const [wineType, setWineType] = useState<'White' | 'Red' | null>(null);
	const [gridChoice, setGrid] = useState<Grid | null>(null);
	// `undefined` while server-rendering, where there is no storage; `null` on a first visit.
	const rawSettings = useSyncExternalStore(noSubscription, readRawSettings, () => undefined);
	const saved = useMemo(() => parseSettings(rawSettings), [rawSettings]);
	const firstVisit = rawSettings === null;

	// Each setting is the taster's choice on this page if they made one, else what they last
	// started with, else the default. A first tasting starts untimed, so the grid can be learned
	// before it is raced.
	const [soundChoice, setSoundEnabled] = useState<boolean | null>(null);
	const [timerChoice, setTimerEnabled] = useState<boolean | null>(null);
	const [secondsChoice, setTimerSeconds] = useState<number | null>(null);
	const [modeChoice, setTimerMode] = useState<TimerMode | null>(null);
	const [wineName, setWineName] = useState('');
	const [introHidden, setIntroHidden] = useState(false);

	const grid = gridChoice ?? (saved ? gridOf(saved.grid) : DEFAULT_GRID);
	const presets = timerPresets(grid);
	// A pace belongs to one grid, so a remembered 4:00 means nothing once the taster switches to WSET.
	const savedSeconds = presets.find((preset) => preset.seconds === saved?.timerSeconds)?.seconds;
	const chosenSeconds = presets.find((preset) => preset.seconds === secondsChoice)?.seconds;
	const savedMode = saved?.timerMode === 'guided' || saved?.timerMode === 'exam' ? saved.timerMode : undefined;
	const soundEnabled = soundChoice ?? saved?.soundEnabled ?? true;
	const timerEnabled = timerChoice ?? saved?.timerEnabled ?? !firstVisit;
	const timerSeconds = chosenSeconds ?? savedSeconds ?? defaultTimerSeconds(grid);
	const timerMode = modeChoice ?? savedMode ?? DEFAULT_TIMER_MODE;
	const firstPhase = common.phase[grid].sight;
	// Preset labels and notes by seconds, falling back to the data's English.
	const presetCopy = (preset: (typeof presets)[number]) =>
		(t.presets as Record<number, { label: string; note: string } | undefined>)[preset.seconds] ?? preset;

	const handleStart = (e: React.FormEvent) => {
		e.preventDefault();

		if (!wineType) {
			showToast({
				title: t.selectWineType,
				children: t.selectWineTypeBody,
				color: 'error',
			});
			return;
		}

		writeSettings({ grid, soundEnabled, timerEnabled, timerSeconds, timerMode });
		if (soundEnabled && timerEnabled) {
			// This tap is what lets the time-up beep sound on iOS later. See beep.ts.
			unlockAudio();
		}
		updateTastingData({
			wineType,
			grid,
			timerEnabled,
			timerSeconds: timerEnabled ? timerSeconds : null,
			timerMode: timerEnabled ? timerMode : undefined,
			// Sight starts the moment this is pressed, so the whole-wine clock starts here too.
			timerEndsAt: timerEnabled && timerMode === 'exam' ? examDeadline(timerSeconds) : undefined,
			soundEnabled,
			wineName: wineName.trim() || '',
			conclusion: { initial: {}, final: {} },
		});

		router.push(`/tastings/sight?wineType=${wineType.toLowerCase()}`);
	};

	return (
		<main className="start-main">
			{/* ── Page head ── */}
			<header className="start-head">
				<span className="page-eyebrow">{t.eyebrow}</span>
				<h1>
					{t.headingBefore}
					<em>{t.headingEm}</em>
					{t.headingAfter}
				</h1>
				<p className="start-sub">{t.sub}</p>
			</header>

			{firstVisit && !introHidden && (
				<section className="start-intro" aria-labelledby="start-intro-heading">
					<button
						type="button"
						className="start-intro__close"
						onClick={() => setIntroHidden(true)}
						aria-label={t.hideIntro}
					>
						<IconX size={16} aria-hidden="true" />
					</button>
					<h2 className="start-intro__heading" id="start-intro-heading">
						{t.introHeading}
					</h2>
					<ol className="start-intro__steps">
						{t.introTitles.map((title, index) => (
							<li key={title}>
								<strong>{title}</strong> {t.introBodies[index]}
							</li>
						))}
					</ol>
				</section>
			)}

			<form onSubmit={handleStart}>
				{/* ── Step 1: Grid ── Remembered like the other settings, so a WSET student picks it once. */}
				<section className="start-step">
					<header className="start-step-label">
						<span className="start-step-num">01</span>
						<span className="item-label">{t.grid}</span>
						<span className="start-step-hint">{common.grid[grid].title}</span>
					</header>

					<div className="start-wine-grid" role="radiogroup" aria-label={t.gridAria}>
						{(Object.keys(GRIDS) as Grid[]).map((option) => (
							<button
								key={option}
								type="button"
								role="radio"
								aria-checked={grid === option}
								className={`start-wine-card start-grid-card${grid === option ? ' start-wine-card--selected' : ''}`}
								onClick={() => setGrid(option)}
							>
								<div>
									<h3 className="start-wine-name">{common.grid[option].name}</h3>
									<p className="start-wine-tags">{t.gridTags[option]}</p>
								</div>
							</button>
						))}
					</div>
				</section>

				{/* ── Step 2: Wine type ── */}
				<section className="start-step">
					<header className="start-step-label">
						<span className="start-step-num">02</span>
						<span className="item-label">{t.wineType}</span>
						<span className="start-step-hint">{t.required}</span>
					</header>

					<div className="start-wine-grid" role="radiogroup" aria-label={t.wineType}>
						<button
							type="button"
							role="radio"
							aria-checked={wineType === 'Red'}
							className={`start-wine-card start-wine-card--red${wineType === 'Red' ? ' start-wine-card--selected' : ''}`}
							onClick={() => setWineType('Red')}
						>
							<div className="start-wine-icon start-wine-icon--red">
								<IconGlassFull size={22} />
							</div>
							<div>
								<h3 className="start-wine-name">
									{t.redBefore}
									<em>{t.redEm}</em>
								</h3>
								<p className="start-wine-tags">{t.redTags}</p>
							</div>
						</button>

						<button
							type="button"
							role="radio"
							aria-checked={wineType === 'White'}
							className={`start-wine-card start-wine-card--white${wineType === 'White' ? ' start-wine-card--selected' : ''}`}
							onClick={() => setWineType('White')}
						>
							<div className="start-wine-icon start-wine-icon--white">
								<IconBottle size={22} />
							</div>
							<div>
								<h3 className="start-wine-name">
									{t.whiteBefore}
									<em>{t.whiteEm}</em>
								</h3>
								<p className="start-wine-tags">{t.whiteTags}</p>
							</div>
						</button>
					</div>
				</section>

				{/* ── Step 3: Session settings ── */}
				<section className="start-step">
					<header className="start-step-label">
						<span className="start-step-num">03</span>
						<span className="item-label">{t.settings}</span>
						<span className="start-step-hint">{text.optional}</span>
					</header>

					<div className="start-settings">
						<div className="start-setting-row">
							<div className="start-setting-icon">
								{soundEnabled ? <IconVolume size={18} /> : <IconVolumeOff size={18} />}
							</div>
							<div className="start-setting-text">
								<div className="start-setting-name">{t.sound}</div>
								<p className="start-setting-desc">{t.soundDesc}</p>
							</div>
							<button
								type="button"
								className="start-switch"
								aria-pressed={soundEnabled}
								aria-label={t.toggleSound}
								onClick={() => setSoundEnabled(!soundEnabled)}
							>
								<span className="start-switch__knob" />
							</button>
						</div>

						<div className="start-setting-row">
							<div className="start-setting-icon">
								<IconStopwatch size={18} />
							</div>
							<div className="start-setting-text">
								<div className="start-setting-name">{t.timer}</div>
								<p className="start-setting-desc">{t.timerDesc}</p>
							</div>
							<button
								type="button"
								className="start-switch"
								aria-pressed={timerEnabled}
								aria-label={t.toggleTimer}
								onClick={() => setTimerEnabled(!timerEnabled)}
							>
								<span className="start-switch__knob" />
							</button>
						</div>

						<div
							className={`start-setting-row start-setting-row--duration${!timerEnabled ? ' start-setting-row--disabled' : ''}`}
						>
							<div className="start-duration" role="radiogroup" aria-label={t.timePerWine}>
								{presets.map((preset) => (
									<button
										key={preset.seconds}
										type="button"
										role="radio"
										aria-checked={timerSeconds === preset.seconds}
										title={presetCopy(preset).note}
										disabled={!timerEnabled}
										className={`start-duration-pill${timerSeconds === preset.seconds ? ' start-duration-pill--on' : ''}`}
										onClick={() => setTimerSeconds(preset.seconds)}
									>
										<span className="start-duration-pill__time">
											{formatTimerSeconds(preset.seconds)}
										</span>
										<span className="start-duration-pill__label">{presetCopy(preset).label}</span>
									</button>
								))}
							</div>
						</div>

						<div
							className={`start-setting-row start-setting-row--duration${!timerEnabled ? ' start-setting-row--disabled' : ''}`}
						>
							<div className="start-duration" role="radiogroup" aria-label={t.clock}>
								{TIMER_MODES.map((mode) => (
									<button
										key={mode}
										type="button"
										role="radio"
										aria-checked={timerMode === mode}
										disabled={!timerEnabled}
										className={`start-duration-pill${timerMode === mode ? ' start-duration-pill--on' : ''}`}
										onClick={() => setTimerMode(mode)}
									>
										<span className="start-duration-pill__time">{t.modes[mode].name}</span>
										<span className="start-duration-pill__label">{t.modes[mode].label}</span>
									</button>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* ── Step 4: Label ── A name for the taster's records, not the wine: typing the wine here
				    gave the answer away before tasting. The wine itself is entered at the reveal. Still
				    saved as `wineName`, so older tastings keep working. */}
				<section className="start-step">
					<header className="start-step-label">
						<span className="start-step-num">04</span>
						<span className="item-label">{t.label}</span>
						<span className="start-step-hint">{t.labelHint}</span>
					</header>

					<div className="start-identity-wrap">
						<input
							className="start-identity-input"
							type="text"
							placeholder={t.labelPlaceholder}
							maxLength={50}
							value={wineName}
							onChange={(e) => setWineName(e.target.value)}
							aria-label={t.labelAria}
							aria-describedby="start-label-hint"
						/>
						<span className="start-identity-counter">{wineName.length} / 50</span>
					</div>
					<p className="start-identity-hint" id="start-label-hint">
						<IconInfoCircle size={15} aria-hidden="true" />
						{t.labelNote}
					</p>
				</section>

				{/* ── CTA ── */}
				<div className="start-cta">
					<button type="submit" className="btn-primary start-cta__btn" disabled={!wineType}>
						{t.startTasting}
						<IconArrowRight size={16} />
					</button>
					<p className="start-hint">
						<span className="start-hint__accent">{firstPhase}</span>
						{t.beginsImmediately}
					</p>
				</div>
			</form>

			{/* ── Phase preview rail ── */}
			<div className="start-phase-rail" aria-hidden="true">
				{PHASE_KEYS[grid].map((p) => {
					const seconds = phaseSeconds(timerSeconds, p.key, grid);
					// In exam mode the split is only a pacing guide, so it is shown muted.
					const muted = !timerEnabled || timerMode === 'exam';
					return (
						<div key={p.num} className="start-phase-chip">
							<span className="start-phase-chip__num">{p.num}</span>
							<span className="start-phase-chip__name">{t.railNames[grid][p.key]}</span>
							<span className={`start-phase-chip__time${muted ? ' start-phase-chip__time--muted' : ''}`}>
								{timerEnabled ? formatTimerSeconds(seconds) : '—'}
							</span>
						</div>
					);
				})}
			</div>

			{/* The tasting pages have no footer, and every tasting starts here, so the credit and
			    disclaimer the footer carries elsewhere live on this page too. */}
			<p className="start-legal">
				{common.grid.cms.credit} {common.grid.wset.credit} {t.ledgerNotAffiliated}
			</p>
		</main>
	);
}
