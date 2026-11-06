'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconArrowRight, IconMinus, IconPlus } from '@tabler/icons-react';
import { defaultTimerSeconds, formatTimerSeconds, timerPresets } from '../../data/timerData';
import { GRIDS, type Grid } from '../../data/grids';
import { useToastProvider } from '../toast/ToastProvider';
import { JsonApiError } from '../../utils/ErrorUtils';
import { MAX_WINES } from '../../utils/flightLogic';
import { flightService, useRequireLogin } from './FlightBits';
import Choice from '../tasting/Choice';
import { flightsText } from '../../i18n/flights';
import { commonText } from '../../i18n/common';
import { useText } from '../../i18n/LanguageProvider';

type CreateText = (typeof flightsText)['en']['create'];

const timers = (
	grid: Grid,
	t: CreateText,
	untimed: string,
): { seconds: number | null; time: string; label: string }[] => [
	{ seconds: null, time: t.off, label: untimed },
	...timerPresets(grid).map((preset) => ({
		seconds: preset.seconds,
		time: formatTimerSeconds(preset.seconds),
		label: t.presets[String(preset.seconds) as keyof CreateText['presets']] ?? preset.label,
	})),
];

export default function FlightCreateClient() {
	const text = useText(flightsText);
	const t = text.create;
	const common = useText(commonText);
	const ready = useRequireLogin('/flights/new');
	const router = useRouter();
	const { showToast } = useToastProvider();
	const [name, setName] = useState('');
	const [wineCount, setWineCount] = useState(6);
	const [grid, setGrid] = useState<Grid>('cms');
	const [timerSeconds, setTimerSeconds] = useState<number | null>(defaultTimerSeconds('cms'));
	const [saving, setSaving] = useState(false);

	// Each grid has its own exam paces; switching keeps "untimed" and otherwise takes the new default.
	const chooseGrid = (next: Grid) => {
		setGrid(next);
		if (timerSeconds !== null) {
			setTimerSeconds(defaultTimerSeconds(next));
		}
	};

	const create = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			const code = await flightService.create({ name: name.trim(), wineCount, grid, timerSeconds });
			router.push(`/flights/${code}`);
		} catch (error) {
			showToast({
				title: t.notCreated,
				children: JsonApiError.create(error).message || t.tryAgain,
				color: 'error',
			});
			setSaving(false);
		}
	};

	if (!ready) {
		return <div className="empty-state">{common.loading}</div>;
	}

	return (
		<main className="start-main">
			<header className="start-head">
				<h1>{t.title}</h1>
				<p>{t.sub}</p>
			</header>

			<form id="flight-form" className="start-form" onSubmit={create}>
				<div className="start-q">
					<label htmlFor="flight-name" className="start-q__label">
						{t.name}
						<small>{t.required}</small>
					</label>
					<input
						id="flight-name"
						className="start-input"
						placeholder={t.namePlaceholder}
						maxLength={40}
						autoComplete="off"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</div>

				<Choice
					label={t.grid}
					hint={t.gridHint}
					value={grid}
					onChange={chooseGrid}
					options={(Object.keys(GRIDS) as Grid[]).map((option) => ({
						value: option,
						text: common.grid[option].name,
					}))}
				/>

				<div className="start-q">
					<h2 className="start-q__label" id="flight-wines-label">
						{t.wines}
						<small>{t.winesHint(MAX_WINES)}</small>
					</h2>
					<div className="flight-stepper" role="group" aria-labelledby="flight-wines-label">
						<button
							type="button"
							className="flight-stepper__btn"
							aria-label={t.fewer}
							disabled={wineCount <= 1}
							onClick={() => setWineCount((n) => n - 1)}
						>
							<IconMinus size={16} aria-hidden="true" />
						</button>
						<output className="flight-stepper__value" aria-live="polite">
							{wineCount} <span>{t.unit(wineCount)}</span>
						</output>
						<button
							type="button"
							className="flight-stepper__btn"
							aria-label={t.more}
							disabled={wineCount >= MAX_WINES}
							onClick={() => setWineCount((n) => n + 1)}
						>
							<IconPlus size={16} aria-hidden="true" />
						</button>
						<p className="flight-stepper__note">{t.numbered(wineCount)}</p>
					</div>
				</div>

				{/* Untimed is 0 here, as the pills need a value; it is saved as null. */}
				<Choice
					label={t.timer}
					hint={t.timerHint}
					value={timerSeconds ?? 0}
					onChange={(seconds) => setTimerSeconds(seconds || null)}
					options={timers(grid, t, text.bits.untimed).map((option) => ({
						value: option.seconds ?? 0,
						text: option.time,
						note: option.label,
					}))}
				/>
				<p className="start-note">{t.timerNote}</p>
			</form>

			<div className="start-foot">
				<div className="start-foot__inner">
					<button type="submit" form="flight-form" className="btn-primary" disabled={!name.trim() || saving}>
						{saving ? t.creating : t.submit}
						<IconArrowRight size={16} aria-hidden="true" />
					</button>
					<p className="start-foot__summary">{t.hint}</p>
				</div>
			</div>
		</main>
	);
}
