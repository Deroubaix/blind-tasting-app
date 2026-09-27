'use client';

import { type ReactNode, useState } from 'react';
import { IconCalendar } from '@tabler/icons-react';
import TastingAutocomplete from './TastingAutocomplete';

/** One search-and-pick answer: a suggestion box and Add while empty, a removable chip once chosen. */
export function ChipSearchField({
	id,
	label,
	labelClassName,
	className,
	value,
	onChange,
	suggestions,
	placeholder,
	icon,
}: {
	id: string;
	label: string;
	labelClassName: string;
	className: string;
	value: string | null | undefined;
	onChange: (value: string | null) => void;
	suggestions: string[];
	placeholder: string;
	icon: ReactNode;
}) {
	const [input, setInput] = useState('');
	const confirm = (typed: string) => {
		if (typed.trim()) {
			onChange(typed.trim());
		}
		setInput('');
	};

	return (
		<div className={className}>
			<label className={labelClassName} htmlFor={id}>
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
					<button
						type="button"
						className="tasting-confirm-btn"
						aria-label={`Add ${label.toLowerCase()}`}
						onClick={() => confirm(input)}
					>
						Add
					</button>
				</div>
			)}
		</div>
	);
}

/** The vintage: digits only, kept between 1900 and this year. */
export function VintageInput({
	id,
	value,
	onChange,
}: {
	id: string;
	value: string;
	onChange: (value: string | null) => void;
}) {
	const clamp = () => {
		if (!value) {
			return;
		}
		const year = parseInt(value, 10);
		const max = new Date().getFullYear();
		if (year < 1900) {
			onChange('1900');
		} else if (year > max) {
			onChange(String(max));
		}
	};

	return (
		<div className="tasting-search-input-wrap">
			<IconCalendar size={14} className="tasting-search-icon" aria-hidden="true" />
			<input
				id={id}
				className="tasting-search-input"
				placeholder="Harvest year"
				inputMode="numeric"
				maxLength={4}
				value={value}
				onChange={(e) => onChange(e.target.value.replace(/\D/g, '') || null)}
				onBlur={clamp}
			/>
		</div>
	);
}
