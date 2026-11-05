'use client';

import { useId } from 'react';
import { IconMapPin, IconSearch } from '@tabler/icons-react';
import { ChipSearchField, VintageInput } from '../tasting/ConclusionInputs';
import { GRAPE_VARIETALS, WINE_COUNTRIES, WINE_REGIONS } from '../tasting/autocompleteData';
import QualityLevelSelect from '../tasting/QualityLevelSelect';
import TastingCustomSelect from '../tasting/TastingCustomSelect';
import { WSET_QUALITY, WSET_READINESS } from '../wset/wsetFields';
import { type Grid } from '../../data/grids';
import { type Reveal } from '../../utils/revealScore';
import { useText } from '../../i18n/LanguageProvider';
import { archivesText } from '../../i18n/archives';

type Props = {
	value: Reveal;
	onChange: (patch: Partial<Reveal>) => void;
	/** Three columns, for the save page's full-width card. */
	layout?: 'form' | 'wide';
	/** The WSET grid asks for the answer key's quality and readiness first; the wine itself is optional. */
	grid?: Grid;
};

/** The reveal's fields: the final conclusion's controls, plus an optional wine name. */
export default function RevealFields({ value, onChange, layout = 'form', grid = 'cms' }: Props) {
	const t = useText(archivesText).fields;
	const ids = {
		grape: useId(),
		country: useId(),
		region: useId(),
		quality: useId(),
		vintage: useId(),
		name: useId(),
		assessment: useId(),
		readiness: useId(),
	};
	const wset = grid === 'wset';

	return (
		<div className={`reveal-fields reveal-fields--${layout}`}>
			{wset && (
				<>
					<div className="reveal-field">
						<span className="accent-label" id={ids.assessment}>
							{t.quality}
						</span>
						<TastingCustomSelect
							options={WSET_QUALITY}
							labelId={ids.assessment}
							value={value.qualityAssessment ?? ''}
							onChange={(qualityAssessment) => onChange({ qualityAssessment: qualityAssessment || null })}
							placeholder={t.tutorCall}
							clearLabel={t.notGiven}
						/>
					</div>
					<div className="reveal-field">
						<span className="accent-label" id={ids.readiness}>
							{t.readiness}
						</span>
						<TastingCustomSelect
							options={WSET_READINESS}
							labelId={ids.readiness}
							value={value.readiness ?? ''}
							onChange={(readiness) => onChange({ readiness: readiness || null })}
							placeholder={t.tutorCall}
							clearLabel={t.notGiven}
						/>
					</div>
					<p className="reveal-fields__wide reveal-fields__note">{t.wsetNote}</p>
				</>
			)}
			<ChipSearchField
				id={ids.grape}
				className="reveal-field"
				labelClassName="accent-label"
				label={t.grape}
				value={value.grapeVariety}
				onChange={(grapeVariety) => onChange({ grapeVariety })}
				suggestions={GRAPE_VARIETALS}
				placeholder={t.grapePlaceholder}
				icon={<IconSearch size={14} className="tasting-search-icon" aria-hidden="true" />}
			/>
			<ChipSearchField
				id={ids.country}
				className="reveal-field"
				labelClassName="accent-label"
				label={t.country}
				value={value.countryOfOrigin}
				onChange={(countryOfOrigin) => onChange({ countryOfOrigin })}
				suggestions={WINE_COUNTRIES}
				placeholder={t.countryPlaceholder}
				icon={<IconMapPin size={14} className="tasting-search-icon" aria-hidden="true" />}
			/>
			<div className="reveal-fields__wide">
				<ChipSearchField
					id={ids.region}
					className="reveal-field"
					labelClassName="accent-label"
					label={t.region}
					value={value.regionAppellation}
					onChange={(regionAppellation) => onChange({ regionAppellation })}
					suggestions={WINE_REGIONS}
					placeholder={t.regionPlaceholder}
					icon={<IconMapPin size={14} className="tasting-search-icon" aria-hidden="true" />}
				/>
			</div>
			{!wset && (
				<div className="reveal-field">
					<span className="accent-label" id={ids.quality}>
						{t.qualityLevel}
					</span>
					<QualityLevelSelect
						value={value.qualityLevel ?? ''}
						onChange={(qualityLevel) => onChange({ qualityLevel: qualityLevel || null })}
						labelId={ids.quality}
						textClassName="tasting-input reveal-field__text"
					/>
				</div>
			)}
			<div className="reveal-field">
				<label className="accent-label" htmlFor={ids.vintage}>
					{t.vintage}
				</label>
				<VintageInput
					id={ids.vintage}
					value={value.vintage ?? ''}
					onChange={(vintage) => onChange({ vintage })}
				/>
			</div>
			<div className="reveal-field reveal-fields__wide">
				<label className="accent-label" htmlFor={ids.name}>
					{t.wineName} <span className="reveal-field__hint">{t.wineNameHint}</span>
				</label>
				<input
					id={ids.name}
					className="tasting-input reveal-field__text"
					placeholder={t.wineNamePlaceholder}
					maxLength={100}
					value={value.wineName ?? ''}
					onChange={(e) => onChange({ wineName: e.target.value || null })}
				/>
			</div>
		</div>
	);
}
