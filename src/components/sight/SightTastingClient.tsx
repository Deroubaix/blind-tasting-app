'use client';

import { useRouter } from 'next/navigation';
import { useTastingContext } from '../tasting/TastingContext';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import { SIGHT_MULTI, SIGHT_SCALES, SIGHT_YES_NO, sightFields } from './sightFields';
import { type WineColorEntry, wineColors } from './sightData';

export default function SightTastingClient({ wineType }: { wineType: 'red' | 'white' }) {
	const router = useRouter();
	const { tastingData, updateTastingData } = useTastingContext();

	const selected: Record<string, string | string[]> = tastingData.sight || {};
	const isRed = wineType === 'red';

	const isChosen = (field: string, option: string) => {
		const value = selected[field];
		return Array.isArray(value) ? value.includes(option) : value === option;
	};

	// Single answers replace, and tapping the chosen one again clears it; the multi-select field
	// toggles its option in or out of a list.
	const choose = (field: string, option: string) => {
		if (SIGHT_MULTI.has(field)) {
			const current = Array.isArray(selected[field]) ? (selected[field] as string[]) : [];
			const value = current.includes(option) ? current.filter((o) => o !== option) : [...current, option];
			updateTastingData({ sight: { ...selected, [field]: value } });
			return;
		}
		const { [field]: previous, ...rest } = selected;
		updateTastingData({ sight: previous === option ? rest : { ...rest, [field]: option } });
	};

	const handleNextPhase = () => router.push(`/tastings/nose?wineType=${wineType}`);

	const colors = wineColors[wineType];

	const fields = sightFields(wineType);
	const answered = fields.filter((field) => {
		const value = selected[field];
		return Array.isArray(value) ? value.length > 0 : value != null;
	});
	const pct = Math.round((answered.length / fields.length) * 100);

	// ─── Sub-renderers ───────────────────────────────────────────────────────────

	const renderOptions = (field: string, options: readonly string[]) => (
		<div className="tasting-options" role="group" aria-label={field}>
			{options.map((opt) => {
				const on = isChosen(field, opt);
				return (
					<button
						key={opt}
						className={`tasting-option${on ? ' tasting-option--selected' : ''}`}
						aria-pressed={on}
						onClick={() => choose(field, opt)}
					>
						{opt}
					</button>
				);
			})}
		</div>
	);

	const renderToggle = (field: string) => (
		<div className="sight-toggle-group" role="group" aria-label={field}>
			{SIGHT_YES_NO.map((opt) => {
				const on = isChosen(field, opt);
				return (
					<button
						key={opt}
						className={`tasting-toggle-btn${on ? ' tasting-toggle-btn--selected' : ''}`}
						aria-pressed={on}
						onClick={() => choose(field, opt)}
					>
						{opt}
					</button>
				);
			})}
		</div>
	);

	// Each swatch carries its own description on desktop. On phone only the chosen ones are
	// spelled out, below the row.
	const renderSwatches = (field: string, items: WineColorEntry[]) => {
		const chosen = items.filter((item) => isChosen(field, item.name));

		return (
			<>
				<div className="sight-swatches" role="group" aria-label={field}>
					{items.map((item) => {
						const on = isChosen(field, item.name);
						return (
							<button
								key={item.name}
								className="sight-swatch-item"
								aria-pressed={on}
								onClick={() => choose(field, item.name)}
							>
								{/* background is dynamic (wine hex value) — only this one inline style */}
								<span
									className={`sight-swatch-rect${on ? ' sight-swatch-rect--selected' : ''}`}
									style={{ backgroundColor: item.hex }}
								/>
								<span className={`sight-swatch-label${on ? ' sight-swatch-label--selected' : ''}`}>
									{item.name}
								</span>
								<span className="sight-swatch-desc">{item.desc}</span>
							</button>
						);
					})}
				</div>
				{chosen.map((item) => (
					<p key={item.name} className="sight-swatch-chosen">
						<strong>{item.name}</strong> &mdash; {item.desc}
					</p>
				))}
			</>
		);
	};

	// ─── Markup ───────────────────────────────────────────────────────────────────
	return (
		<TastingPhaseLayout
			wineType={wineType}
			progress={pct}
			timerPage="sight"
			timerDestination={`/tastings/nose?wineType=${wineType}`}
			phase="Phase 01"
			title="The Sight"
			description={
				isRed
					? 'Examine the wine against a neutral white background under consistent lighting conditions.'
					: 'Evaluate the physical appearance of the white wine against a neutral background. Observe clarity, intensity, and secondary colors.'
			}
			footer={{
				onBack: () =>
					router.push(
						tastingData.flight
							? `/flights/${tastingData.flight.code}`
							: `/tastings/start?wineType=${wineType}`,
					),
				backLabel: tastingData.flight ? 'Back to Flight' : 'Back to Setup',
				nextLabel: 'Next: The Nose',
				onNext: handleNextPhase,
			}}
		>
			{/*
              Three-column grid, in 2024 CMS grid order.
              ┌──────────────┬─────────────────────────────┐
              │ Clarity      │ Intensity of Color (span 2) │
              ├──────────────┴─────────────────────────────┤
              │ Primary Color (full width)                 │
              ├────────────────────────────────────────────┤
              │ Secondary Color(s) (full width)            │
              ├──────────────┬─────────────────────────────┤
              │ Rim Var.*    │ Staining* (span 2)          │   *red only
              ├──────────────┴──────────────┬──────────────┤
              │ Tearing (span 2)            │ Gas Evidence │
              └─────────────────────────────┴──────────────┘
            */}
			<div className="sight-grid">
				<div className="tasting-card">
					<div className="tasting-card__label">Clarity / Visible Sediment</div>
					{renderOptions('Clarity', SIGHT_SCALES.Clarity)}
				</div>

				<div className="tasting-card sight-card--span-2">
					<div className="tasting-card__label">Intensity of Color</div>
					{renderOptions('Intensity of Color', SIGHT_SCALES['Intensity of Color'])}
				</div>

				<div className="tasting-card sight-card--span-full sight-card--light">
					<div className="sight-card__header">
						<div className="tasting-card__label">Primary Color</div>
						<span className="sight-card__sublabel">Core</span>
					</div>
					{renderSwatches('Primary Color', colors.primary)}
				</div>

				<div className="tasting-card sight-card--span-full sight-card--light">
					<div className="sight-card__header">
						<div className="tasting-card__label">Secondary Color(s)</div>
						<span className="sight-card__sublabel">Select all that apply</span>
					</div>
					{renderSwatches('Secondary Color(s)', colors.secondary)}
				</div>

				{isRed && (
					<>
						<div className="tasting-card">
							<div className="tasting-card__label">Rim Variation</div>
							{renderToggle('Rim Variation')}
						</div>

						<div className="tasting-card sight-card--span-2">
							<div className="tasting-card__label">Staining</div>
							{renderOptions('Staining', SIGHT_SCALES.Staining)}
						</div>
					</>
				)}

				<div className="tasting-card sight-card--span-2">
					<div className="tasting-card__label">Tearing</div>
					{renderOptions('Tearing', SIGHT_SCALES.Tearing)}
				</div>

				<div className="tasting-card">
					<div className="tasting-card__label">Gas Evidence</div>
					{renderToggle('Gas Evidence')}
				</div>
			</div>
			{/* end .sight-grid */}
		</TastingPhaseLayout>
	);
}
