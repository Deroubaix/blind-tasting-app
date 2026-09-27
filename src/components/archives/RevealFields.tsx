'use client';

import { useId, useState } from 'react';
import { IconCalendar, IconMapPin, IconSearch } from '@tabler/icons-react';
import TastingAutocomplete from '../tasting/TastingAutocomplete';
import { GRAPE_VARIETALS, WINE_COUNTRIES, WINE_REGIONS } from '../tasting/autocompleteData';
import QualityLevelSelect from '../tasting/QualityLevelSelect';
import { type Reveal } from './revealScore';

type Props = {
	value: Reveal;
	onChange: (patch: Partial<Reveal>) => void;
	/** Three columns, for the save page's full-width card. */
	layout?: 'form' | 'wide';
};

/**
 * One search-and-pick answer, as on Final Conclusion: a suggestion box and Add while empty, then
 * a removable chip once chosen.
 */
function ChipSearchField({
	label,
	value,
	onChange,
	suggestions,
	placeholder,
	icon,
}: {
	label: string;
	value: string | null | undefined;
	onChange: (value: string | null) => void;
	suggestions: string[];
	placeholder: string;
	icon: React.ReactNode;
}) {
	const [input, setInput] = useState('');
	const id = useId();
	const confirm = (typed: string) => {
		if (typed.trim()) {
			onChange(typed.trim());
		}
		setInput('');
	};

	return (
		<div className="reveal-field">
			<label className="reveal-field__label" htmlFor={id}>
				{label}
			</label>
			{value ? (
				<div className="tasting-chips">
					<span className="tasting-chip">
						{value}
						<button
							type="button"
							className="tasting-chip__remove"
							aria-label={`Remove ${value}`}
							onClick={() => onChange(null)}
						>
							×
						</button>
					</span>
				</div>
			) : (
				<div className="tasting-search-row">
					<TastingAutocomplete
						id={id}
						suggestions={suggestions}
						value={input}
						onChange={setInput}
						onConfirm={confirm}
						placeholder={placeholder}
						icon={icon}
					/>
					<button type="button" className="tasting-confirm-btn" onClick={() => confirm(input)}>
						Add
					</button>
				</div>
			)}
		</div>
	);
}

/** The reveal's fields: the same controls as the final conclusion, plus an optional wine name. */
export default function RevealFields({ value, onChange, layout = 'form' }: Props) {
	const ids = { quality: useId(), vintage: useId(), name: useId() };

	return (
		<div className={`reveal-fields reveal-fields--${layout}`}>
			<ChipSearchField
				label="Grape variety or blend"
				value={value.grapeVariety}
				onChange={(grapeVariety) => onChange({ grapeVariety })}
				suggestions={GRAPE_VARIETALS}
				placeholder="e.g., Pinot Noir"
				icon={<IconSearch size={14} className="tasting-search-icon" aria-hidden="true" />}
			/>
			<ChipSearchField
				label="Country of origin"
				value={value.countryOfOrigin}
				onChange={(countryOfOrigin) => onChange({ countryOfOrigin })}
				suggestions={WINE_COUNTRIES}
				placeholder="e.g., France"
				icon={<IconMapPin size={14} className="tasting-search-icon" aria-hidden="true" />}
			/>
			<div className="reveal-fields__wide">
				<ChipSearchField
					label="Region and appellation"
					value={value.regionAppellation}
					onChange={(regionAppellation) => onChange({ regionAppellation })}
					suggestions={WINE_REGIONS}
					placeholder="e.g., Chambolle-Musigny"
					icon={<IconMapPin size={14} className="tasting-search-icon" aria-hidden="true" />}
				/>
			</div>
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
			<div className="reveal-field">
				<label className="reveal-field__label" htmlFor={ids.vintage}>
					Vintage
				</label>
				<div className="tasting-search-input-wrap">
					<IconCalendar size={14} className="tasting-search-icon" aria-hidden="true" />
					<input
						id={ids.vintage}
						className="tasting-search-input"
						placeholder="Harvest year"
						inputMode="numeric"
						maxLength={4}
						value={value.vintage ?? ''}
						onChange={(e) => onChange({ vintage: e.target.value.replace(/\D/g, '') || null })}
					/>
				</div>
			</div>
			<div className="reveal-field reveal-fields__wide">
				<label className="reveal-field__label" htmlFor={ids.name}>
					Wine name <span className="reveal-field__hint">optional — producer or cuvée</span>
				</label>
				<input
					id={ids.name}
					className="tasting-input reveal-field__text"
					placeholder="e.g., Domaine Georges Roumier"
					maxLength={100}
					value={value.wineName ?? ''}
					onChange={(e) => onChange({ wineName: e.target.value || null })}
				/>
			</div>
		</div>
	);
}
