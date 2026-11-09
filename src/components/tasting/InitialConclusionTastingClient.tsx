'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { useTastingContext } from '../tasting/TastingContext';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import { AGE_RANGES, CLIMATES } from './conclusionFields';
import TastingAutocomplete from './TastingAutocomplete';
import { GRAPE_VARIETALS, WINE_COUNTRIES } from './autocompleteData';
import { useText } from '../../i18n/LanguageProvider';
import { commonText } from '../../i18n/common';
import { tastingText } from '../../i18n/tasting';

export default function InitialConclusionTastingClient({ wineType }: { wineType: 'red' | 'white' }) {
	const router = useRouter();
	const { tastingData, updateTastingData } = useTastingContext();
	const text = useText(tastingText);
	const t = text.initial;
	const phaseName = useText(commonText).phase.cms;

	const ic = tastingData.conclusion?.initial ?? {};
	const [varietalInput, setVarietalInput] = useState('');
	const [countryInput, setCountryInput] = useState('');

	const updateIC = (patch: Partial<NonNullable<typeof ic>>) =>
		updateTastingData({ conclusion: { ...tastingData.conclusion, initial: { ...ic, ...patch } } });

	const handleNextPhase = () => router.push(`/tastings/final-conclusion?wineType=${wineType}`);
	const handlePreviousPhase = () => router.push(`/tastings/palate?wineType=${wineType}`);

	const addVarietal = (input?: string) => {
		const v = (input ?? varietalInput).trim();
		if (v && !(ic.grapeVarieties ?? []).includes(v)) {
			updateIC({ grapeVarieties: [...(ic.grapeVarieties ?? []), v] });
		}
		setVarietalInput('');
	};

	const addCountry = (input?: string) => {
		const c = (input ?? countryInput).trim();
		if (c && !(ic.possibleCountries ?? []).includes(c)) {
			updateIC({ possibleCountries: [...(ic.possibleCountries ?? []), c] });
		}
		setCountryInput('');
	};

	return (
		<TastingPhaseLayout
			wineType={wineType}
			timerPage="initialConclusion"
			timerDestination={`/tastings/final-conclusion?wineType=${wineType}`}
			title={phaseName.initialConclusion}
			description={t.description}
			footer={{
				onBack: handlePreviousPhase,
				backLabel: t.back,
				nextLabel: t.next,
				onNext: handleNextPhase,
			}}
		>
			<div className="tasting-grid tasting-grid--2">
				{/* ── Left column ── */}
				<div className="ic-col">
					<div className="section-label">{t.environment}</div>

					<div className="tasting-card">
						<div className="tasting-card__label" id="ic-climate-label">
							{t.climate}
						</div>
						<div
							className="tasting-options tasting-options--equal"
							role="group"
							aria-labelledby="ic-climate-label"
						>
							{CLIMATES.map((opt) => (
								<button
									key={opt}
									aria-pressed={ic.climate === opt}
									className={`tasting-option${ic.climate === opt ? ' tasting-option--selected' : ''}`}
									onClick={() => updateIC({ climate: ic.climate === opt ? null : opt })}
								>
									{opt}
								</button>
							))}
						</div>
					</div>

					<div className="section-label section-label--mt">{t.maturity}</div>

					<div className="tasting-card">
						<div className="tasting-card__label" id="ic-age-label">
							{t.ageRange}
						</div>
						<div className="tasting-options" role="group" aria-labelledby="ic-age-label">
							{AGE_RANGES.map((opt) => (
								<button
									key={opt}
									aria-pressed={ic.ageRange === opt}
									className={`tasting-option${ic.ageRange === opt ? ' tasting-option--selected' : ''}`}
									onClick={() => updateIC({ ageRange: ic.ageRange === opt ? null : opt })}
								>
									{opt}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* ── Right column ── */}
				<div className="ic-col">
					<div className="section-label">{t.varietal}</div>

					<div className="tasting-card">
						<div className="tasting-card__label">{t.grapes}</div>
						<div className="tasting-search-row">
							<TastingAutocomplete
								suggestions={GRAPE_VARIETALS}
								ariaLabel={t.grapesAria}
								value={varietalInput}
								onChange={setVarietalInput}
								onConfirm={addVarietal}
								placeholder={t.searchGrapes}
								icon={<IconSearch size={14} className="tasting-search-icon" />}
							/>
							<button
								className="btn-primary btn-primary--sm"
								aria-label={t.addGrape}
								onClick={() => addVarietal()}
							>
								{text.add}
							</button>
						</div>
						{(ic.grapeVarieties?.length ?? 0) > 0 && (
							<div className="tasting-chips">
								{ic.grapeVarieties!.map((v) => (
									<span key={v} className="tasting-chip">
										{v}
										<button
											className="tasting-chip__remove"
											aria-label={text.remove(v)}
											onClick={() =>
												updateIC({ grapeVarieties: ic.grapeVarieties!.filter((x) => x !== v) })
											}
										>
											×
										</button>
									</span>
								))}
							</div>
						)}
					</div>

					<div className="section-label section-label--mt">{t.geographic}</div>

					<div className="tasting-card">
						<div className="tasting-card__label">{t.countries}</div>
						<div className="tasting-search-row">
							<TastingAutocomplete
								suggestions={WINE_COUNTRIES}
								ariaLabel={t.countriesAria}
								value={countryInput}
								onChange={setCountryInput}
								onConfirm={addCountry}
								placeholder={t.searchCountries}
								icon={<IconSearch size={14} className="tasting-search-icon" />}
							/>
							<button
								className="btn-primary btn-primary--sm"
								aria-label={t.addCountry}
								onClick={() => addCountry()}
							>
								{text.add}
							</button>
						</div>
						{(ic.possibleCountries?.length ?? 0) > 0 && (
							<div className="tasting-chips">
								{ic.possibleCountries!.map((c) => (
									<span key={c} className="tasting-chip">
										{c}
										<button
											className="tasting-chip__remove"
											aria-label={text.remove(c)}
											onClick={() =>
												updateIC({
													possibleCountries: ic.possibleCountries!.filter((x) => x !== c),
												})
											}
										>
											×
										</button>
									</span>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</TastingPhaseLayout>
	);
}
