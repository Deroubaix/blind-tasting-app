'use client';

import { useRouter } from 'next/navigation';
import { useTastingContext } from '../tasting/TastingContext';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import { SIGHT_MAIN_FIELDS, SIGHT_EVIDENCE_LABELS } from './sightFields';
import { wineColors } from './sightData';

export default function SightTastingClient({ wineType }: { wineType: 'red' | 'white' }) {
	const router = useRouter();
	const { tastingData, updateTastingData } = useTastingContext();

	const selectedOptions: Record<string, string | null> = tastingData.sight || {};

	const handleOptionSelect = (category: string, option: string) => {
		updateTastingData({ sight: { ...selectedOptions, [category]: option } as Record<string, string> });
	};

	const handleNextPhase = () => router.push(`/tastings/nose?wineType=${wineType}`);

	const colors = wineColors[wineType];

	// Completion %
	const pct = Math.round(
		(SIGHT_MAIN_FIELDS.filter((f) => selectedOptions[f] != null).length / SIGHT_MAIN_FIELDS.length) * 100,
	);

	// ─── Sub-renderers ───────────────────────────────────────────────────────────

	const renderOptions = (category: string, options: string[]) => (
		<div className="tasting-options">
			{options.map((opt) => {
				const selected = selectedOptions[category] === opt;
				return (
					<button
						key={opt}
						className={`tasting-option${selected ? ' tasting-option--selected' : ''}`}
						onClick={() => handleOptionSelect(category, opt)}
					>
						{opt}
					</button>
				);
			})}
		</div>
	);

	const renderToggle = (category: string, options: [string, string]) => (
		<div className="sight-toggle-group">
			{options.map((opt) => {
				const selected = selectedOptions[category] === opt;
				return (
					<button
						key={opt}
						className={`tasting-toggle-btn${selected ? ' tasting-toggle-btn--selected' : ''}`}
						onClick={() => handleOptionSelect(category, opt)}
					>
						{opt}
					</button>
				);
			})}
		</div>
	);

	// Each swatch carries its own description on desktop, where there is room for three
	// side by side. On phone only the chosen one is spelled out, below the row.
	const renderSwatches = (category: string, items: typeof colors.spectrum) => {
		const chosen = items.find((item) => item.name === selectedOptions[category]);

		return (
			<>
				<div className="sight-swatches">
					{items.map((item) => {
						const selected = selectedOptions[category] === item.name;
						return (
							<div
								key={item.name}
								className="sight-swatch-item"
								onClick={() => handleOptionSelect(category, item.name)}
							>
								{/* background is dynamic (wine hex value) — only this one inline style */}
								<div
									className={`sight-swatch-rect${selected ? ' sight-swatch-rect--selected' : ''}`}
									style={{ backgroundColor: item.hex }}
								/>
								<div className={`sight-swatch-label${selected ? ' sight-swatch-label--selected' : ''}`}>
									{item.name}
								</div>
								<div className="sight-swatch-desc">{item.desc}</div>
							</div>
						);
					})}
				</div>
				{chosen && (
					<p className="sight-swatch-chosen">
						<strong>{chosen.name}</strong> &mdash; {chosen.desc}
					</p>
				)}
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
				wineType === 'red'
					? 'Examine the wine against a neutral white background under consistent lighting conditions.'
					: 'Evaluate the physical appearance of the white wine against a neutral background. Observe clarity, intensity, and secondary hues.'
			}
			footer={{
				onBack: () => router.push(`/tastings/start?wineType=${wineType}`),
				backLabel: 'Back to Setup',
				nextLabel: 'Next: The Nose',
				onNext: handleNextPhase,
			}}
		>
			{/*
              Three-column assessment grid
              ┌──────────────┬──────────────┬───────────────────────────┐
              │ Clarity      │ Brightness   │ Physical Evidence (×2 rows│
              ├──────────────┼──────────────┤                           │
              │ Conc/Visc    │ Visc/Tears   │                           │
              ├──────────────┴──────────────┼───────────────────────────┤
              │ Color Spectrum (span 2 cols)│ Master Tip                │
              ├──────────────────────────────┼───────────────────────────┤
              │ Hue Rim       (span 2 cols) │ Exam Progress             │
              └──────────────────────────────┴───────────────────────────┘
            */}
			<div className="sight-grid">
				{/* Row 1, Col 1 — Clarity */}
				<div className="tasting-card">
					<div className="tasting-card__label">Clarity</div>
					{renderOptions('Clarity', ['Clear', 'Slight Cloudy'])}
				</div>

				{/* Row 1, Col 2 — Brightness */}
				<div className="tasting-card">
					<div className="tasting-card__label">Brightness</div>
					{renderOptions('Brightness', ['Hazy', 'Day Bright', 'Star Bright'])}
				</div>

				{/* Col 3, Rows 1–2 — Physical Evidence */}
				<div className="tasting-card sight-card--evidence">
					<div className="tasting-card__label">Physical Evidence</div>
					<div className="sight-evidence-fields">
						<div className="sight-evidence-field">
							<span className="sight-evidence-field__label">{SIGHT_EVIDENCE_LABELS.StainedTears}</span>
							{renderToggle('StainedTears', ['No', 'Yes'])}
						</div>
						<div className="sight-evidence-field">
							<span className="sight-evidence-field__label">{SIGHT_EVIDENCE_LABELS.GasEvidence}</span>
							{renderToggle('GasEvidence', ['No', 'Yes'])}
						</div>
						<div className="sight-evidence-field">
							<span className="sight-evidence-field__label">
								{SIGHT_EVIDENCE_LABELS.SedimentParticles}
							</span>
							{renderToggle('SedimentParticles', ['No', 'Yes'])}
						</div>
					</div>
				</div>

				{/* Row 2, Col 1 — Concentration. Both wine types: it is one of the six
				    SIGHT_MAIN_FIELDS, so leaving it off a type caps that type below 100%. */}
				<div className="tasting-card">
					<div className="tasting-card__label">Concentration</div>
					{renderOptions('Concentration', ['Pale', 'Moderate', 'Deep'])}
				</div>

				{/* Row 2, Col 2 — Viscosity */}
				<div className="tasting-card">
					<div className="tasting-card__label">Viscosity</div>
					{renderOptions('Viscosity', ['Low', 'Medium', 'High'])}
				</div>

				{/* Row 3, Cols 1–2 — Color Spectrum */}
				<div className="tasting-card sight-card--span-cols sight-card--light">
					<div className="sight-card__header">
						<div className="tasting-card__label">Color Spectrum</div>
						<span className="sight-card__sublabel">Core Color</span>
					</div>
					{renderSwatches('Color', colors.spectrum)}
				</div>

				{/* Row 4, Cols 1–2 — Hue Rim / Secondary Hue */}
				<div className="tasting-card sight-card--span-cols sight-card--light">
					<div className="sight-card__header">
						<div className="tasting-card__label">{wineType === 'red' ? 'Hue Rim' : 'Secondary Hue'}</div>
						<span className="sight-card__sublabel">Rim Quality</span>
					</div>
					{renderSwatches('Hue', colors.hue)}
				</div>
			</div>
			{/* end .sight-grid */}
		</TastingPhaseLayout>
	);
}
