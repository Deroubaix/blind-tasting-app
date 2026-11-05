'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconArrowRight, IconMinus, IconPlus } from '@tabler/icons-react';
import { defaultTimerSeconds, formatTimerSeconds, timerPresets } from '../../data/timerData';
import { GRIDS, type Grid } from '../../data/grids';
import { useToastProvider } from '../../toast/ToastProvider';
import { JsonApiError } from '../../utils/ErrorUtils';
import { MAX_WINES } from './flightLogic';
import { flightService, useRequireLogin } from './FlightBits';
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
		return <div className="archives-loading">{common.loading}</div>;
	}

	return (
		<main className="start-main">
			<header className="start-head">
				<span className="page-eyebrow">{t.eyebrow}</span>
				<h1>
					{t.titleBefore}
					<em>{t.titleEm}</em>
					{t.titleAfter}
				</h1>
				<p className="start-sub">{t.sub}</p>
			</header>

			<form onSubmit={create}>
				<section className="start-step">
					<header className="start-step-label">
						<span className="start-step-num">01</span>
						<label className="item-label" htmlFor="flight-name">
							{t.name}
						</label>
						<span className="start-step-hint">{t.required}</span>
					</header>
					<div className="start-identity-wrap">
						<input
							id="flight-name"
							className="start-identity-input"
							placeholder={t.namePlaceholder}
							maxLength={40}
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
						<span className="start-identity-counter">{name.length} / 40</span>
					</div>
				</section>

				<section className="start-step">
					<header className="start-step-label">
						<span className="start-step-num">02</span>
						<span className="item-label">{t.grid}</span>
						<span className="start-step-hint">{t.gridHint}</span>
					</header>
					<div className="start-setting-row start-setting-row--duration">
						<div className="start-duration" role="radiogroup" aria-label={t.gridAria}>
							{(Object.keys(GRIDS) as Grid[]).map((option) => (
								<button
									key={option}
									type="button"
									role="radio"
									aria-checked={grid === option}
									className={`start-duration-pill${grid === option ? ' start-duration-pill--on' : ''}`}
									onClick={() => chooseGrid(option)}
								>
									<span className="start-duration-pill__time">{common.grid[option].short}</span>
									<span className="start-duration-pill__label">{common.grid[option].name}</span>
								</button>
							))}
						</div>
					</div>
				</section>

				<section className="start-step">
					<header className="start-step-label">
						<span className="start-step-num">03</span>
						<span className="item-label" id="flight-wines-label">
							{t.wines}
						</span>
						<span className="start-step-hint">{t.winesHint(MAX_WINES)}</span>
					</header>
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
				</section>

				<section className="start-step">
					<header className="start-step-label">
						<span className="start-step-num">04</span>
						<span className="item-label">{t.timer}</span>
						<span className="start-step-hint">{t.timerHint}</span>
					</header>
					<div className="start-setting-row start-setting-row--duration">
						<div className="start-duration" role="radiogroup" aria-label={t.timerAria}>
							{timers(grid, t, text.bits.untimed).map((option) => (
								<button
									key={option.time}
									type="button"
									role="radio"
									aria-checked={timerSeconds === option.seconds}
									className={`start-duration-pill${timerSeconds === option.seconds ? ' start-duration-pill--on' : ''}`}
									onClick={() => setTimerSeconds(option.seconds)}
								>
									<span className="start-duration-pill__time">{option.time}</span>
									<span className="start-duration-pill__label">{option.label}</span>
								</button>
							))}
						</div>
					</div>
					<p className="flight-note">{t.timerNote}</p>
				</section>

				<div className="start-cta">
					<button type="submit" className="btn-primary start-cta__btn" disabled={!name.trim() || saving}>
						{saving ? t.creating : t.submit}
						<IconArrowRight size={16} aria-hidden="true" />
					</button>
					<p className="start-hint">{t.hint}</p>
				</div>
			</form>
		</main>
	);
}
