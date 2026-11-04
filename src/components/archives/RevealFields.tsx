'use client';

import { useId } from 'react';
import { IconMapPin, IconSearch } from '@tabler/icons-react';
import { ChipSearchField, VintageInput } from '../tasting/ConclusionInputs';
import { GRAPE_VARIETALS, WINE_COUNTRIES, WINE_REGIONS } from '../tasting/autocompleteData';
import QualityLevelSelect from '../tasting/QualityLevelSelect';
import TastingCustomSelect from '../tasting/TastingCustomSelect';
import { WSET_QUALITY, WSET_READINESS } from '../wset/wsetFields';
import { type Grid } from '../../data/grids';
import { type Reveal } from './revealScore';

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
						<span className="reveal-field__label" id={ids.assessment}>
							Quality level
						</span>
						<TastingCustomSelect
							options={WSET_QUALITY}
							labelId={ids.assessment}
							value={value.qualityAssessment ?? ''}
							onChange={(qualityAssessment) => onChange({ qualityAssessment: qualityAssessment || null })}
							placeholder="The tutor's call…"
							clearLabel="Not given"
						/>
					</div>
					<div className="reveal-field">
						<span className="reveal-field__label" id={ids.readiness}>
							Readiness for drinking
						</span>
						<TastingCustomSelect
							options={WSET_READINESS}
							labelId={ids.readiness}
							value={value.readiness ?? ''}
							onChange={(readiness) => onChange({ readiness: readiness || null })}
							placeholder="The tutor's call…"
							clearLabel="Not given"
						/>
					</div>
					<p className="reveal-fields__wide reveal-fields__note">
						The wine itself is optional: fill in what the label gives and the call is scored on it too.
					</p>
				</>
			)}
			<ChipSearchField
				id={ids.grape}
				className="reveal-field"
				labelClassName="reveal-field__label"
				label="Grape variety or blend"
				value={value.grapeVariety}
				onChange={(grapeVariety) => onChange({ grapeVariety })}
				suggestions={GRAPE_VARIETALS}
				placeholder="e.g. Pinot Noir"
				icon={<IconSearch size={14} className="tasting-search-icon" aria-hidden="true" />}
			/>
			<ChipSearchField
				id={ids.country}
				className="reveal-field"
				labelClassName="reveal-field__label"
				label="Country of origin"
				value={value.countryOfOrigin}
				onChange={(countryOfOrigin) => onChange({ countryOfOrigin })}
				suggestions={WINE_COUNTRIES}
				placeholder="e.g. France"
				icon={<IconMapPin size={14} className="tasting-search-icon" aria-hidden="true" />}
			/>
			<div className="reveal-fields__wide">
				<ChipSearchField
					id={ids.region}
					className="reveal-field"
					labelClassName="reveal-field__label"
					label="Region and appellation"
					value={value.regionAppellation}
					onChange={(regionAppellation) => onChange({ regionAppellation })}
					suggestions={WINE_REGIONS}
					placeholder="e.g. Chambolle-Musigny"
					icon={<IconMapPin size={14} className="tasting-search-icon" aria-hidden="true" />}
				/>
			</div>
			{!wset && (
				<div className="reveal-field">
					<span className="reveal-field__label" id={ids.quality}>
						Official quality level
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
				<label className="reveal-field__label" htmlFor={ids.vintage}>
					Vintage
				</label>
				<VintageInput
					id={ids.vintage}
					value={value.vintage ?? ''}
					onChange={(vintage) => onChange({ vintage })}
				/>
			</div>
			<div className="reveal-field reveal-fields__wide">
				<label className="reveal-field__label" htmlFor={ids.name}>
					Wine name <span className="reveal-field__hint">optional — producer or cuvée</span>
				</label>
				<input
					id={ids.name}
					className="tasting-input reveal-field__text"
					placeholder="e.g. Domaine Georges Roumier"
					maxLength={100}
					value={value.wineName ?? ''}
					onChange={(e) => onChange({ wineName: e.target.value || null })}
				/>
			</div>
		</div>
	);
}
