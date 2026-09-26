'use client';

import { useRouter } from 'next/navigation';
import { useTastingContext } from '../tasting/TastingContext';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import { PALATE_REQUIRED } from './palateFields';

const REQUIRED_CATEGORIES = new Set(PALATE_REQUIRED);

const palateTastingOptions = {
	red: {
		Sweetness: ['Bone Dry', 'Dry', 'Off-Dry', 'Sweet'],
		Tannin: ['Low', 'Medium (-)', 'Medium', 'Medium (+)', 'High'],
		Acid: ['Low', 'Medium (-)', 'Medium', 'Medium (+)', 'High'],
		Alcohol: ['Low', 'Medium (-)', 'Medium', 'Medium (+)', 'High'],
		Body: ['Light', 'Medium', 'Full Bodied'],
		Texture: ['Lean', 'Round', 'Creamy'],
		Finish: ['Short', 'Medium (-)', 'Medium', 'Medium (+)', 'Long'],
		Complexity: ['Low', 'Medium (-)', 'Medium', 'Medium (+)', 'High'],
	},
	white: {
		Sweetness: ['Bone Dry', 'Dry', 'Off-Dry', 'Sweet'],
		Tannin: ['Low', 'Medium (-)', 'Medium', 'Medium (+)', 'High'],
		Acid: ['Low', 'Medium (-)', 'Medium', 'Medium (+)', 'High'],
		Alcohol: ['Low', 'Medium (-)', 'Medium', 'Medium (+)', 'High'],
		Body: ['Light', 'Medium', 'Full Bodied'],
		Texture: ['Lean', 'Round', 'Creamy'],
		Finish: ['Short', 'Medium (-)', 'Medium', 'Medium (+)', 'Long'],
		Complexity: ['Low', 'Medium (-)', 'Medium', 'Medium (+)', 'High'],
	},
};

export default function PalateTastingClient({ wineType }: { wineType: 'red' | 'white' }) {
	const router = useRouter();
	const { tastingData, updateTastingData } = useTastingContext();

	const selectedOptions: Record<string, string | null> = tastingData.palate || {};
	// Written straight through to the context, not held locally and flushed on Next/Back: the phase
	// timer navigates with a bare `router.push`, so a local copy was lost whenever time ran out.
	const confirmNose = tastingData.confirmNose ?? '';

	const currentOptions = palateTastingOptions[wineType];

	const handleOptionSelect = (category: string, option: string) => {
		updateTastingData({ palate: { ...selectedOptions, [category]: option } });
	};

	const handleNextPhase = () => {
		router.push(`/tastings/initial-conclusion?wineType=${wineType}`);
	};

	const handlePreviousPhase = () => {
		router.push(`/tastings/nose?wineType=${wineType}`);
	};

	const allKeys = Object.keys(currentOptions);
	const palatePct = Math.round((allKeys.filter((k) => selectedOptions[k] != null).length / allKeys.length) * 100);
	const requiredFilled = [...REQUIRED_CATEGORIES].every((k) => selectedOptions[k] != null);

	return (
		<TastingPhaseLayout
			wineType={wineType}
			progress={palatePct}
			timerPage="palate"
			timerDestination={`/tastings/initial-conclusion?wineType=${wineType}`}
			phase="Phase 03"
			title="The Palate"
			description="Analyze the structural components and flavor profile on the palate to confirm your nasal assessments."
			footer={{
				onBack: handlePreviousPhase,
				backLabel: 'Back to Nose',
				nextLabel: 'Next: Initial Conclusion',
				onNext: handleNextPhase,
				nextDisabled: !requiredFilled,
			}}
		>
			{/* 2-column category grid */}
			<div className="palate-grid">
				{Object.entries(currentOptions).map(([category, options]) => (
					<div key={category} className="tasting-card">
						<div className="tasting-card__label">
							{category}
							{REQUIRED_CATEGORIES.has(category) && (
								<span className="palate-card__required" aria-label="required">
									*
								</span>
							)}
						</div>
						<div className="tasting-options">
							{options.map((option) => {
								const selected = selectedOptions[category] === option;
								return (
									<button
										key={option}
										className={`tasting-option${selected ? ' tasting-option--selected' : ''}`}
										onClick={() => handleOptionSelect(category, option)}
									>
										{option}
									</button>
								);
							})}
						</div>
					</div>
				))}
			</div>

			{/* Confirm the Nose */}
			<div className="palate-notes tasting-card">
				<div className="palate-notes__header">
					<span className="tasting-card__label">Confirm the Nose</span>
					<span className="palate-notes__sublabel">Supplemental Notes</span>
				</div>
				<textarea
					className="tasting-textarea"
					rows={4}
					placeholder="Describe any secondary or tertiary notes that emerged on the palate..."
					value={confirmNose}
					onChange={(e) => updateTastingData({ confirmNose: e.target.value })}
				/>
			</div>
		</TastingPhaseLayout>
	);
}
