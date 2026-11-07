'use client';

import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { IconArrowRight } from '@tabler/icons-react';
import Choice from './Choice';
import { useToastProvider } from '../toast/ToastProvider';
import { useTastingContext } from '../../components/tasting/TastingContext';
import { unlockAudio } from '../../utils/beep';
import {
	DEFAULT_TIMER_MODE,
	type TimerMode,
	defaultTimerSeconds,
	formatTimerSeconds,
	timerPresets,
} from '../../data/timerData';
import { DEFAULT_GRID, GRIDS, type Grid, gridOf } from '../../data/grids';
import { useText } from '../../i18n/LanguageProvider';
import { commonText } from '../../i18n/common';
import { tastingText } from '../../i18n/tasting';

const TIMER_MODES: TimerMode[] = ['guided', 'exam'];

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

	const summary = wineType
		? [
				wineType === 'Red' ? common.red : common.white,
				common.grid[grid].short,
				timerEnabled ? `${t.modes[timerMode].name}, ${formatTimerSeconds(timerSeconds)}` : t.untimed,
				timerEnabled ? (soundEnabled ? t.soundOn : t.soundOff) : '',
			]
				.filter(Boolean)
				.join(' · ')
		: t.chooseWine;

	return (
		<main className="start-main">
			<header className="start-head">
				<h1>{t.title}</h1>
				<p>{t.sub}</p>
			</header>

			<form id="start-form" className="start-form" onSubmit={handleStart}>
				{/* Remembered like the other settings, so a WSET student picks it once. */}
				<Choice
					label={t.grid}
					value={grid}
					onChange={setGrid}
					options={(Object.keys(GRIDS) as Grid[]).map((option) => ({
						value: option,
						text: common.grid[option].name,
					}))}
				/>
				<Choice
					label={t.wineType}
					hint={t.required}
					value={wineType}
					onChange={setWineType}
					options={[
						{ value: 'Red', text: common.red },
						{ value: 'White', text: common.white },
					]}
				/>

				<div className="start-timer">
					<Choice
						label={t.timer}
						value={timerEnabled}
						onChange={setTimerEnabled}
						options={[
							{ value: false, text: t.off },
							{ value: true, text: t.on },
						]}
					/>
					{timerEnabled && (
						<div className="start-timer__settings">
							<Choice
								sub
								label={t.clock}
								value={timerMode}
								onChange={setTimerMode}
								options={TIMER_MODES.map((mode) => ({
									value: mode,
									text: t.modes[mode].name,
									note: t.modes[mode].label,
								}))}
							/>
							{/* WSET has one pace, so a note instead of a lone pill. */}
							{presets.length > 1 ? (
								<Choice
									sub
									label={t.timePerWine}
									value={timerSeconds}
									onChange={setTimerSeconds}
									options={presets.map((preset) => ({
										value: preset.seconds,
										text: formatTimerSeconds(preset.seconds),
										note: `${presetCopy(preset).label} · ${presetCopy(preset).note}`,
									}))}
								/>
							) : (
								<p className="start-note">
									{t.onePreset(
										formatTimerSeconds(presets[0].seconds),
										presetCopy(presets[0]).label,
										presetCopy(presets[0]).note,
									)}
								</p>
							)}
							<Choice
								sub
								label={t.sound}
								hint={t.soundHint}
								value={soundEnabled}
								onChange={setSoundEnabled}
								options={[
									{ value: false, text: t.off },
									{ value: true, text: t.on },
								]}
							/>
						</div>
					)}
					{firstVisit && !timerEnabled && <p className="start-note">{t.firstUntimed}</p>}
				</div>

				{/* A name for the taster's records, not the wine: typing the wine here gave the answer
					    away before tasting. Still saved as `wineName`, so older tastings keep working. */}
				<div className="start-q">
					<label htmlFor="start-label" className="start-q__label">
						{t.label}
						<small>{text.optional}</small>
					</label>
					<input
						id="start-label"
						className="start-input"
						type="text"
						placeholder={t.labelPlaceholder}
						maxLength={50}
						autoComplete="off"
						value={wineName}
						onChange={(e) => setWineName(e.target.value)}
						aria-describedby="start-label-hint"
					/>
					<p className="start-note" id="start-label-hint">
						{t.labelNote}
					</p>
				</div>

				<section className="start-how" aria-labelledby="start-how-heading">
					<h2 id="start-how-heading">{t.howTitle}</h2>
					<ol>
						{t.how.map((step) => (
							<li key={step}>{step}</li>
						))}
					</ol>
				</section>
			</form>

			{/* The tasting pages have no footer, and every tasting starts here, so the credit and
				    disclaimer the footer carries elsewhere live on this page too. */}
			<p className="start-legal">
				{common.grid.cms.credit} {common.grid.wset.credit} {t.ledgerNotAffiliated}
			</p>

			<div className="start-foot">
				<div className="start-foot__inner">
					<button type="submit" form="start-form" className="btn-primary" disabled={!wineType}>
						{t.startTasting}
						<IconArrowRight size={16} aria-hidden="true" />
					</button>
					<p className="start-foot__summary" aria-live="polite">
						{summary}
					</p>
				</div>
			</div>
		</main>
	);
}
