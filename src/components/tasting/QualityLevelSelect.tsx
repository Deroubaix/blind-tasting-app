'use client';

import { useId, useState } from 'react';
import TastingCustomSelect from './TastingCustomSelect';
import { QUALITY_LEVELS } from './conclusionFields';

type Props = {
	value: string;
	onChange: (value: string) => void;
	/** Id of the visible label, so the dropdown is announced by name. */
	labelId: string;
	textClassName?: string;
};

/** Quality level: a listed one, or "Other" with the level typed out and saved. */
export default function QualityLevelSelect({ value, onChange, labelId, textClassName = 'tasting-input' }: Props) {
	const inputId = useId();
	// A mode, not derived: "Reserva Especial" passes through "Reserva" while typed.
	const [other, setOther] = useState(() => value !== '' && (value === 'Other' || !QUALITY_LEVELS.includes(value)));

	return (
		<>
			<TastingCustomSelect
				options={QUALITY_LEVELS}
				value={other ? 'Other' : value}
				// Picking Other again keeps what was typed.
				onChange={(picked) => {
					setOther(picked === 'Other');
					onChange(picked === 'Other' ? (other ? value : 'Other') : picked);
				}}
				placeholder="Where appropriate…"
				clearLabel="Not applicable"
				labelId={labelId}
			/>
			{other && (
				<input
					id={inputId}
					className={`${textClassName} quality-level-other`}
					aria-label="Which quality level?"
					placeholder="Which level? e.g. Crianza, Cru Classé"
					maxLength={60}
					value={value === 'Other' ? '' : value}
					// Emptied, it stays Other.
					onChange={(e) => onChange(e.target.value.trim() ? e.target.value : 'Other')}
				/>
			)}
		</>
	);
}
