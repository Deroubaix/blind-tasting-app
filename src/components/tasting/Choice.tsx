'use client';

type Option<V> = { value: V; text: string; note?: string };

/** One question on the page: its options as pills, one of them chosen. */
export default function Choice<V extends string | number | boolean>({
	label,
	hint,
	sub = false,
	value,
	options,
	onChange,
}: {
	label: string;
	hint?: string;
	sub?: boolean;
	value: V | null;
	options: Option<V>[];
	onChange: (value: V) => void;
}) {
	const Heading = sub ? 'h3' : 'h2';
	return (
		<div className="start-q">
			<Heading className="start-q__label">
				{label}
				{hint && <small>{hint}</small>}
			</Heading>
			<div className="start-q__options" role="radiogroup" aria-label={label}>
				{options.map((option) => (
					<button
						key={String(option.value)}
						type="button"
						role="radio"
						aria-checked={value === option.value}
						className="start-option"
						onClick={() => onChange(option.value)}
					>
						{option.text}
						{option.note && <small>{option.note}</small>}
					</button>
				))}
			</div>
		</div>
	);
}
