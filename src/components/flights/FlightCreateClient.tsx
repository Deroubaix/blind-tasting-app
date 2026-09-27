'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconArrowRight, IconMinus, IconPlus } from '@tabler/icons-react';
import { TIMER_PRESETS, formatTimerSeconds } from '../../data/timerData';
import { useToastProvider } from '../../toast/ToastProvider';
import { JsonApiError } from '../../utils/ErrorUtils';
import { MAX_WINES } from './flightLogic';
import { flightService, useRequireLogin } from './FlightBits';

const TIMERS: { seconds: number | null; time: string; label: string }[] = [
	{ seconds: null, time: 'Off', label: 'Untimed' },
	...TIMER_PRESETS.map((preset) => ({
		seconds: preset.seconds,
		time: formatTimerSeconds(preset.seconds),
		label: preset.label,
	})),
];

export default function FlightCreateClient() {
	const ready = useRequireLogin('/flights/new');
	const router = useRouter();
	const { showToast } = useToastProvider();
	const [name, setName] = useState('');
	const [wineCount, setWineCount] = useState(6);
	const [timerSeconds, setTimerSeconds] = useState<number | null>(TIMER_PRESETS[0].seconds);
	const [saving, setSaving] = useState(false);

	const create = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			const code = await flightService.create({ name: name.trim(), wineCount, timerSeconds });
			router.push(`/flights/${code}`);
		} catch (error) {
			showToast({
				title: 'Flight not created',
				children: JsonApiError.create(error).message || 'Please try again.',
				color: 'error',
			});
			setSaving(false);
		}
	};

	if (!ready) {
		return <div className="archives-loading">Loading…</div>;
	}

	return (
		<main className="start-main">
			<header className="start-head">
				<span className="page-eyebrow">New flight</span>
				<h1>
					Host a <em>flight</em>.
				</h1>
				<p className="start-sub">
					Pour the wines bagged and numbered. Everyone tastes on their own phone. You reveal each label once,
					and everyone who submitted is scored together.
				</p>
			</header>

			<form onSubmit={create}>
				<section className="start-step">
					<header className="start-step-label">
						<span className="start-step-num">01</span>
						<label className="item-label" htmlFor="flight-name">
							Flight name
						</label>
						<span className="start-step-hint">required</span>
					</header>
					<div className="start-identity-wrap">
						<input
							id="flight-name"
							className="start-identity-input"
							placeholder="Tuesday study group"
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
						<span className="item-label" id="flight-wines-label">
							Number of wines
						</span>
						<span className="start-step-hint">1 to {MAX_WINES}</span>
					</header>
					<div className="flight-stepper" role="group" aria-labelledby="flight-wines-label">
						<button
							type="button"
							className="flight-stepper__btn"
							aria-label="One fewer wine"
							disabled={wineCount <= 1}
							onClick={() => setWineCount((n) => n - 1)}
						>
							<IconMinus size={16} aria-hidden="true" />
						</button>
						<output className="flight-stepper__value" aria-live="polite">
							{wineCount} <span>{wineCount === 1 ? 'wine' : 'wines'}</span>
						</output>
						<button
							type="button"
							className="flight-stepper__btn"
							aria-label="One more wine"
							disabled={wineCount >= MAX_WINES}
							onClick={() => setWineCount((n) => n + 1)}
						>
							<IconPlus size={16} aria-hidden="true" />
						</button>
						<p className="flight-stepper__note">Numbered 1–{wineCount}.</p>
					</div>
				</section>

				<section className="start-step">
					<header className="start-step-label">
						<span className="start-step-num">03</span>
						<span className="item-label">Timer</span>
						<span className="start-step-hint">one clock per wine</span>
					</header>
					<div className="start-setting-row start-setting-row--duration">
						<div className="start-duration" role="radiogroup" aria-label="Time per wine">
							{TIMERS.map((option) => (
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
					<p className="flight-note">
						Each taster&apos;s clock starts when they open a wine, so nobody has to start at the same
						moment.
					</p>
				</section>

				<div className="start-cta">
					<button type="submit" className="btn-primary start-cta__btn" disabled={!name.trim() || saving}>
						{saving ? 'Creating…' : 'Create flight'}
						<IconArrowRight size={16} aria-hidden="true" />
					</button>
					<p className="start-hint">
						You&apos;ll get a join code next. As host, you pour and reveal; you don&apos;t taste.
					</p>
				</div>
			</form>
		</main>
	);
}
