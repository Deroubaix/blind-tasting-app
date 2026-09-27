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
import { useToastProvider } from '../../toast/ToastProvider';
import { useTastingContext } from '../../components/tasting/TastingContext';
import { unlockAudio } from '../../utils/beep';
import {
	DEFAULT_TIMER_MODE,
	DEFAULT_TIMER_SECONDS,
	TIMER_PRESETS,
	type TimerMode,
	type TimerPhase,
	formatTimerSeconds,
	phaseSeconds,
} from '../../data/timerData';

const TIMER_MODES: { mode: TimerMode; name: string; label: string }[] = [
	{ mode: 'guided', name: 'Guided', label: 'A clock per phase' },
	{ mode: 'exam', name: 'Exam', label: 'One clock per wine' },
];

const PHASE_KEYS: { num: string; name: string; key: TimerPhase }[] = [
	{ num: '01', name: 'Sight', key: 'sight' },
	{ num: '02', name: 'Nose', key: 'nose' },
	{ num: '03', name: 'Palate', key: 'palate' },
	{ num: '04', name: 'Initial', key: 'initialConclusion' },
	{ num: '05', name: 'Final', key: 'finalConclusion' },
];

/**
 * The last settings a taster started with, so a flight of six wines is set up once, not six
 * times. Only in this browser: a convenience, not something the account needs to keep. Its
 * absence is also how a first visit is recognised.
 */
const SETTINGS_KEY = 'ledger:start-settings';

type StartSettings = {
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

	const [wineType, setWineType] = useState<'White' | 'Red' | null>(null);
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

	const savedSeconds = TIMER_PRESETS.find((preset) => preset.seconds === saved?.timerSeconds)?.seconds;
	const savedMode = saved?.timerMode === 'guided' || saved?.timerMode === 'exam' ? saved.timerMode : undefined;
	const soundEnabled = soundChoice ?? saved?.soundEnabled ?? true;
	const timerEnabled = timerChoice ?? saved?.timerEnabled ?? !firstVisit;
	const timerSeconds = secondsChoice ?? savedSeconds ?? DEFAULT_TIMER_SECONDS;
	const timerMode = modeChoice ?? savedMode ?? DEFAULT_TIMER_MODE;

	const handleStart = (e: React.FormEvent) => {
		e.preventDefault();

		if (!wineType) {
			showToast({
				title: 'Select a wine type',
				children: 'Please choose Red or White Wine to continue.',
				color: 'error',
			});
			return;
		}

		writeSettings({ soundEnabled, timerEnabled, timerSeconds, timerMode });
		if (soundEnabled && timerEnabled) {
			// This tap is what lets the time-up beep sound on iOS later. See beep.ts.
			unlockAudio();
		}

		updateTastingData({
			wineType,
			timerEnabled,
			timerSeconds: timerEnabled ? timerSeconds : null,
			timerMode: timerEnabled ? timerMode : undefined,
			// Sight starts the moment this is pressed, so the whole-wine clock starts here too.
			timerEndsAt: timerEnabled && timerMode === 'exam' ? Date.now() + timerSeconds * 1000 : undefined,
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
				<span className="page-eyebrow">New session</span>
				<h1>
					Begin your <em>tasting</em>.
				</h1>
				<p className="start-sub">
					Configure the session below. You can practice without an account — sign up later to save it.
				</p>
			</header>

			{firstVisit && !introHidden && (
				<section className="start-intro" aria-labelledby="start-intro-heading">
					<button
						type="button"
						className="start-intro__close"
						onClick={() => setIntroHidden(true)}
						aria-label="Hide how it works"
					>
						<IconX size={16} aria-hidden="true" />
					</button>
					<h2 className="start-intro__heading" id="start-intro-heading">
						First time here? How it works
					</h2>
					<ol className="start-intro__steps">
						<li>
							<strong>Five phases, in the order of the grid:</strong> Sight, Nose, Palate, then an initial
							and a final conclusion. Tap the terms that describe the wine; tap a chosen term again to
							clear it.
						</li>
						<li>
							<strong>The clock is optional.</strong> Your first tasting is untimed so you can learn the
							grid. Later, Guided gives each phase its own clock and moves you on when it runs out; Exam
							gives one clock for the whole wine. Either can be paused.
						</li>
						<li>
							<strong>Then the reveal.</strong> Save the tasting, unwrap the bottle and enter what&apos;s
							on the label. Your call is scored against it, field by field.
						</li>
					</ol>
				</section>
			)}

			<form onSubmit={handleStart}>
				{/* ── Step 1: Wine type ── */}
				<section className="start-step">
					<header className="start-step-label">
						<span className="start-step-num">01</span>
						<span className="item-label">Wine type</span>
						<span className="start-step-hint">required</span>
					</header>

					<div className="start-wine-grid" role="radiogroup" aria-label="Wine type">
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
									Red <em>Wine</em>
								</h3>
								<p className="start-wine-tags">Tannin · Structure · Earth</p>
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
									White <em>Wine</em>
								</h3>
								<p className="start-wine-tags">Acidity · Fruit · Terroir</p>
							</div>
						</button>
					</div>
				</section>

				{/* ── Step 2: Session settings ── */}
				<section className="start-step">
					<header className="start-step-label">
						<span className="start-step-num">02</span>
						<span className="item-label">Session settings</span>
						<span className="start-step-hint">optional</span>
					</header>

					<div className="start-settings">
						<div className="start-setting-row">
							<div className="start-setting-icon">
								{soundEnabled ? <IconVolume size={18} /> : <IconVolumeOff size={18} />}
							</div>
							<div className="start-setting-text">
								<div className="start-setting-name">Sound</div>
								<p className="start-setting-desc">
									A beep when the timer reaches zero. On iPhone it follows the silent switch.
								</p>
							</div>
							<button
								type="button"
								className="start-switch"
								aria-pressed={soundEnabled}
								aria-label="Toggle sound"
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
								<div className="start-setting-name">Timer</div>
								<p className="start-setting-desc">
									Practice under the clock. Guided moves you on phase by phase; Exam gives you one
									clock for the whole wine, as the exam does.
								</p>
							</div>
							<button
								type="button"
								className="start-switch"
								aria-pressed={timerEnabled}
								aria-label="Toggle timer"
								onClick={() => setTimerEnabled(!timerEnabled)}
							>
								<span className="start-switch__knob" />
							</button>
						</div>

						<div
							className={`start-setting-row start-setting-row--duration${!timerEnabled ? ' start-setting-row--disabled' : ''}`}
						>
							<div className="start-duration" role="radiogroup" aria-label="Time per wine">
								{TIMER_PRESETS.map((preset) => (
									<button
										key={preset.seconds}
										type="button"
										role="radio"
										aria-checked={timerSeconds === preset.seconds}
										title={preset.note}
										disabled={!timerEnabled}
										className={`start-duration-pill${timerSeconds === preset.seconds ? ' start-duration-pill--on' : ''}`}
										onClick={() => setTimerSeconds(preset.seconds)}
									>
										<span className="start-duration-pill__time">
											{formatTimerSeconds(preset.seconds)}
										</span>
										<span className="start-duration-pill__label">{preset.label}</span>
									</button>
								))}
							</div>
						</div>

						<div
							className={`start-setting-row start-setting-row--duration${!timerEnabled ? ' start-setting-row--disabled' : ''}`}
						>
							<div className="start-duration" role="radiogroup" aria-label="Clock">
								{TIMER_MODES.map((option) => (
									<button
										key={option.mode}
										type="button"
										role="radio"
										aria-checked={timerMode === option.mode}
										disabled={!timerEnabled}
										className={`start-duration-pill${timerMode === option.mode ? ' start-duration-pill--on' : ''}`}
										onClick={() => setTimerMode(option.mode)}
									>
										<span className="start-duration-pill__time">{option.name}</span>
										<span className="start-duration-pill__label">{option.label}</span>
									</button>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* ── Step 3: Label ── A name for the taster's records, not the wine: typing the wine here
				    gave the answer away before tasting. The wine itself is entered at the reveal. Still
				    saved as `wineName`, so older tastings keep working. */}
				<section className="start-step">
					<header className="start-step-label">
						<span className="start-step-num">03</span>
						<span className="item-label">Label</span>
						<span className="start-step-hint">optional — for your records</span>
					</header>

					<div className="start-identity-wrap">
						<input
							className="start-identity-input"
							type="text"
							placeholder="Flight 3, wine 2"
							maxLength={50}
							value={wineName}
							onChange={(e) => setWineName(e.target.value)}
							aria-label="Label (optional)"
							aria-describedby="start-label-hint"
						/>
						<span className="start-identity-counter">{wineName.length} / 50</span>
					</div>
					<p className="start-identity-hint" id="start-label-hint">
						<IconInfoCircle size={15} aria-hidden="true" />
						Don&apos;t enter the wine; you&apos;ll reveal it after tasting.
					</p>
				</section>

				{/* ── CTA ── */}
				<div className="start-cta">
					<button type="submit" className="btn-primary start-cta__btn" disabled={!wineType}>
						Start tasting
						<IconArrowRight size={16} />
					</button>
					<p className="start-hint">
						<span className="start-hint__accent">Sight</span> begins immediately
					</p>
				</div>
			</form>

			{/* ── Phase preview rail ── */}
			<div className="start-phase-rail" aria-hidden="true">
				{PHASE_KEYS.map((p) => {
					const seconds = phaseSeconds(timerSeconds, p.key);
					// In exam mode the split is only a pacing guide, so it is shown muted.
					const muted = !timerEnabled || timerMode === 'exam';
					return (
						<div key={p.num} className="start-phase-chip">
							<span className="start-phase-chip__num">{p.num}</span>
							<span className="start-phase-chip__name">{p.name}</span>
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
				Grid based on the 2024 Deductive Tasting Format, © Court of Master Sommeliers, Americas. The
				Sommelier&apos;s Ledger is not affiliated with or endorsed by the Court of Master Sommeliers.
			</p>
		</main>
	);
}
