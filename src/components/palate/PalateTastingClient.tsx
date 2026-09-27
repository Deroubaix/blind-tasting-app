'use client';

import { useRouter } from 'next/navigation';
import { useTastingContext } from '../tasting/TastingContext';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import { BALANCE_NOTE, PALATE_OPTIONS, palateRequired } from './palateFields';

export default function PalateTastingClient({ wineType }: { wineType: 'red' | 'white' }) {
	const router = useRouter();
	const { tastingData, updateTastingData } = useTastingContext();

	const selectedOptions: Record<string, string> = tastingData.palate || {};
	// Written straight through to the context, not held locally and flushed on Next/Back: the phase
	// timer navigates with a bare `router.push`, so a local copy was lost whenever time ran out.
	const confirmNose = tastingData.confirmNose ?? '';

	const currentOptions = PALATE_OPTIONS[wineType];
	const required = new Set(palateRequired(wineType));

	const setAnswer = (category: string, value: string) => {
		updateTastingData({ palate: { ...selectedOptions, [category]: value } });
	};

	const handleNextPhase = () => {
		router.push(`/tastings/initial-conclusion?wineType=${wineType}`);
	};

	const handlePreviousPhase = () => {
		router.push(`/tastings/nose?wineType=${wineType}`);
	};

	const allKeys = Object.keys(currentOptions);
	const palatePct = Math.round((allKeys.filter((k) => selectedOptions[k]).length / allKeys.length) * 100);
	const requiredFilled = [...required].every((k) => selectedOptions[k]);

	return (
		<TastingPhaseLayout
			wineType={wineType}
			progress={palatePct}
			timerPage="palate"
			timerDestination={`/tastings/initial-conclusion?wineType=${wineType}`}
			phase="Phase 03"
			title="The Palate"
			description="Assess the structure of the wine on the palate, then confirm what you found on the nose."
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
							{required.has(category) && (
								<span className="palate-card__required" aria-label="required">
									*
								</span>
							)}
						</div>
						<div className="tasting-options" role="group" aria-label={category}>
							{options.map((option) => {
								const selected = selectedOptions[category] === option;
								return (
									<button
										key={option}
										className={`tasting-option${selected ? ' tasting-option--selected' : ''}`}
										aria-pressed={selected}
										onClick={() => setAnswer(category, option)}
									>
										{option}
									</button>
								);
							})}
						</div>
						{/* The grid asks what dominates the wine alongside the yes/no. */}
						{category === 'Balance' && (
							<input
								type="text"
								className="tasting-input palate-balance-note"
								aria-label="What dominates the wine?"
								placeholder="What dominates? e.g. acid, alcohol, oak"
								maxLength={120}
								value={selectedOptions[BALANCE_NOTE] ?? ''}
								onChange={(e) => setAnswer(BALANCE_NOTE, e.target.value)}
							/>
						)}
					</div>
				))}
			</div>

			{/* Confirm from the nose: the grid's palate rows for fruit, condition, non-fruit, earth,
			    mineral and oak all ask the same question — has anything changed? */}
			<div className="palate-notes tasting-card">
				<div className="palate-notes__header">
					<label className="tasting-card__label" htmlFor="palate-confirm-nose">
						Confirm from the Nose
					</label>
					<span className="palate-notes__sublabel">Has anything changed?</span>
				</div>
				<textarea
					id="palate-confirm-nose"
					className="tasting-textarea"
					rows={4}
					placeholder="Fruit, fruit condition (turned tart?), non-fruit, earth, mineral, oak — note anything that differs from the nose…"
					value={confirmNose}
					onChange={(e) => updateTastingData({ confirmNose: e.target.value })}
				/>
			</div>
		</TastingPhaseLayout>
	);
}
