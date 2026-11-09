'use client';

import { useRouter } from 'next/navigation';
import { useTastingContext } from '../tasting/TastingContext';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import { useText } from '../../i18n/LanguageProvider';
import { tastingText } from '../../i18n/tasting';
import { useTerm } from '../../i18n/useTerm';
import {
	BALANCE_NOTE,
	CONFIRM_ROWS,
	PALATE_GROUPS,
	PALATE_OPTIONS,
	confirmKey,
	confirmOptions,
	palateRequired,
} from './palateFields';

export default function PalateTastingClient({ wineType }: { wineType: 'red' | 'white' }) {
	const router = useRouter();
	const { tastingData, updateTastingData } = useTastingContext();
	const text = useText(tastingText);
	const term = useTerm();
	const t = text.palate;

	// The CMS palate stores one answer per attribute; only the WSET grid keeps a list there.
	const selectedOptions = (tastingData.palate as Record<string, string> | undefined) || {};
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

	const requiredFilled = [...required].every((k) => selectedOptions[k]);

	return (
		<TastingPhaseLayout
			wineType={wineType}
			timerPage="palate"
			timerDestination={`/tastings/initial-conclusion?wineType=${wineType}`}
			title={t.title}
			description={t.description}
			footer={{
				onBack: handlePreviousPhase,
				backLabel: t.back,
				nextLabel: t.next,
				onNext: handleNextPhase,
				nextDisabled: !requiredFilled,
			}}
		>
			{PALATE_GROUPS.map(([group, keys]) => (
				<section key={group} className="sheet-group" aria-labelledby={`palate-${group}`}>
					<h2 className="section-label" id={`palate-${group}`}>
						{t.groups[group]}
					</h2>
					<div className="tasting-grid tasting-grid--2">
						{keys
							.filter((category) => category in currentOptions)
							.map((category) => {
								const options = currentOptions[category];
								return (
									<div key={category} className="tasting-card">
										<div className="tasting-card__label">
											{term(category)}
											{required.has(category) && (
												<span className="tasting-card__required" aria-label={t.required}>
													*
												</span>
											)}
										</div>
										<div className="tasting-options" role="group" aria-label={term(category)}>
											{options.map((option) => {
												const selected = selectedOptions[category] === option;
												return (
													<button
														key={option}
														className={`tasting-option${selected ? ' tasting-option--selected' : ''}`}
														aria-pressed={selected}
														onClick={() => toggleAnswer(category, option)}
													>
														{term(option, category)}
													</button>
												);
											})}
										</div>
										{/* The grid asks what dominates the wine alongside the yes/no. */}
										{category === 'Balance' && (
											<input
												type="text"
												className="tasting-input tasting-input--block"
												aria-label={t.balanceAria}
												placeholder={t.balancePlaceholder}
												maxLength={120}
												value={selectedOptions[BALANCE_NOTE] ?? ''}
												onChange={(e) => setAnswer(BALANCE_NOTE, e.target.value)}
											/>
										)}
									</div>
								);
							})}
					</div>
				</section>
			))}

			{/* Confirm from the nose: six rows, one tap each, plus an optional note. */}
			<section className="sheet-group" aria-labelledby="palate-confirm-label">
				<div className="sheet-group__head">
					<h2 className="section-label" id="palate-confirm-label">
						{t.confirm}
					</h2>
					<span className="tasting-aside">{t.anythingChanged}</span>
				</div>
				<div className="palate-confirm" role="group" aria-labelledby="palate-confirm-label">
					{CONFIRM_ROWS.map((row) => {
						const key = confirmKey(row);
						return (
							<div key={row} className="palate-confirm__row">
								<span className="palate-confirm__label" id={`palate-confirm-${row}`}>
									{term(row)}
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
												{term(option, row)}
											</button>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
				<label className="palate-confirm__label palate-confirm__label--field" htmlFor="palate-confirm-nose">
					{t.whatChanged} <span className="tasting-aside">{text.optional}</span>
				</label>
				<textarea
					id="palate-confirm-nose"
					className="tasting-textarea"
					rows={2}
					placeholder={t.notePlaceholder}
					value={confirmNose}
					onChange={(e) => updateTastingData({ confirmNose: e.target.value })}
				/>
			</section>
		</TastingPhaseLayout>
	);
}
