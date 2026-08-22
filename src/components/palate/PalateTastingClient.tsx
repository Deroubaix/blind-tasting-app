'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTastingContext } from '../tasting/TastingContext';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import PhaseHeading from '../layout/PhaseHeading';

const REQUIRED_CATEGORIES = new Set(['Sweetness', 'Acid', 'Tannin', 'Alcohol', 'Body', 'Finish']);

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
	const [confirmNose, setConfirmNose] = useState(tastingData.confirmNose || '');

	const currentOptions = palateTastingOptions[wineType];

	const handleOptionSelect = (category: string, option: string) => {
		updateTastingData({ palate: { ...selectedOptions, [category]: option } });
	};

	const handleNextPhase = () => {
		updateTastingData({ confirmNose });
		router.push(`/tastings/initial-conclusion?wineType=${wineType}`);
	};

	const handlePreviousPhase = () => {
		updateTastingData({ confirmNose });
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
			footer={{
				onBack: handlePreviousPhase,
				backLabel: '← Back to Nose',
				nextLabel: 'Next: Initial Conclusion →',
				onNext: handleNextPhase,
				nextDisabled: !requiredFilled,
			}}
		>
			<PhaseHeading
				phase="Phase 03"
				title="The Palate"
				description="Analyze the structural components and flavor profile on the palate to confirm your nasal assessments."
			/>

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
					onChange={(e) => setConfirmNose(e.target.value)}
				/>
			</div>
		</TastingPhaseLayout>
	);
}
