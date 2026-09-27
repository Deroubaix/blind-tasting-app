'use client';

import { useState, useRef, useEffect } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import useDropPlacement from './useDropPlacement';

interface Props {
	options: string[];
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	/** When set, the list starts with this entry, which clears the answer (for optional fields). */
	clearLabel?: string;
}

export default function TastingCustomSelect({
	options,
	value,
	onChange,
	placeholder = 'Select...',
	clearLabel,
}: Props) {
	const [open, setOpen] = useState(false);
	const wrapRef = useRef<HTMLDivElement>(null);
	const { dropUp, maxHeight } = useDropPlacement(wrapRef, open);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	const select = (option: string) => {
		onChange(option);
		setOpen(false);
	};

	return (
		<div className="tasting-autocomplete" ref={wrapRef}>
			<div
				className={`tasting-search-input-wrap tasting-search-input-wrap--select${open ? ' tasting-search-input-wrap--open' : ''}`}
				role="button"
				tabIndex={0}
				onClick={() => setOpen((o) => !o)}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						setOpen((o) => !o);
					}
				}}
			>
				<span className={`tasting-select-value${!value ? ' tasting-select-value--placeholder' : ''}`}>
					{value || placeholder}
				</span>
				<IconChevronDown
					size={14}
					className={`tasting-search-icon tasting-select-chevron${open ? ' tasting-select-chevron--open' : ''}`}
				/>
			</div>
			{open && (
				<ul
					className={`tasting-autocomplete__dropdown${dropUp ? ' tasting-autocomplete__dropdown--up' : ''}`}
					style={{ maxHeight }}
				>
					{clearLabel && (
						<li
							className="tasting-autocomplete__option tasting-autocomplete__option--clear"
							onMouseDown={(e) => {
								e.preventDefault();
								select('');
							}}
						>
							{clearLabel}
						</li>
					)}
					{options.map((opt) => (
						<li
							key={opt}
							className={`tasting-autocomplete__option${opt === value ? ' tasting-autocomplete__option--active' : ''}`}
							onMouseDown={(e) => {
								e.preventDefault();
								select(opt);
							}}
						>
							{opt}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
