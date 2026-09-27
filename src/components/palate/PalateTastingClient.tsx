'use client';

import { useRouter } from 'next/navigation';
import { useTastingContext } from '../tasting/TastingContext';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import { BALANCE_NOTE, CONFIRM_ROWS, PALATE_OPTIONS, confirmKey, confirmOptions, palateRequired } from './palateFields';

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

	// Tapping the chosen answer again clears it — a Texture tapped by mistake can be taken back.
	const toggleAnswer = (category: string, option: string) => {
		const { [category]: previous, ...rest } = selectedOptions;
		updateTastingData({ palate: previous === option ? rest : { ...rest, [category]: option } });
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
										onClick={() => toggleAnswer(category, option)}
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

			{/* Confirm from the nose: six rows, one tap each, plus an optional note. */}
			<div className="palate-notes tasting-card">
				<div className="palate-notes__header">
					<span className="tasting-card__label" id="palate-confirm-label">
						Confirm from the Nose
					</span>
					<span className="palate-notes__sublabel">Has anything changed?</span>
				</div>
				<div className="palate-confirm" role="group" aria-labelledby="palate-confirm-label">
					{CONFIRM_ROWS.map((row) => {
						const key = confirmKey(row);
						return (
							<div key={row} className="palate-confirm__row">
								<span className="palate-confirm__label" id={`palate-confirm-${row}`}>
									{row}
								</span>
								<div
									className="tasting-options palate-confirm__options"
									role="group"
									aria-labelledby={`palate-confirm-${row}`}
								>
									{confirmOptions(row).map((option) => {
										const selected = selectedOptions[key] === option;
										return (
											<button
												key={option}
												className={`tasting-option${selected ? ' tasting-option--selected' : ''}`}
												aria-pressed={selected}
												onClick={() => toggleAnswer(key, option)}
											>
												{option}
											</button>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
				<label className="palate-confirm__note-label" htmlFor="palate-confirm-nose">
					What changed? <span className="palate-confirm__optional">optional</span>
				</label>
				<textarea
					id="palate-confirm-nose"
					className="tasting-textarea"
					rows={2}
					placeholder="e.g. more earth than on the nose; oak shows as vanilla…"
					value={confirmNose}
					onChange={(e) => updateTastingData({ confirmNose: e.target.value })}
				/>
			</div>
		</TastingPhaseLayout>
	);
}
