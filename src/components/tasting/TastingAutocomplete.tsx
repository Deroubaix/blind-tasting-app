'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
	suggestions: string[];
	value: string;
	onChange: (v: string) => void;
	onConfirm: (v: string) => void;
	placeholder?: string;
	icon?: React.ReactNode;
}

export default function TastingAutocomplete({ suggestions, value, onChange, onConfirm, placeholder, icon }: Props) {
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const wrapRef = useRef<HTMLDivElement>(null);

	const filtered =
		value.trim().length > 0 ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase().trim())) : [];

	const showDropdown = open && filtered.length > 0;

	const select = (suggestion: string) => {
		onConfirm(suggestion);
		setOpen(false);
		setActiveIndex(-1);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setOpen(true);
			setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setActiveIndex((i) => Math.max(i - 1, 0));
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (activeIndex >= 0 && filtered[activeIndex]) {
				select(filtered[activeIndex]);
			} else {
				onConfirm(value);
				setOpen(false);
			}
		} else if (e.key === 'Escape') {
			setOpen(false);
			setActiveIndex(-1);
		}
	};

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
				setOpen(false);
				setActiveIndex(-1);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	return (
		<div className="tasting-autocomplete" ref={wrapRef}>
			<div className="tasting-search-input-wrap">
				{icon}
				<input
					className="tasting-search-input"
					placeholder={placeholder}
					value={value}
					onChange={(e) => {
						onChange(e.target.value);
						setOpen(true);
						setActiveIndex(-1);
					}}
					onKeyDown={handleKeyDown}
					onFocus={() => {
						if (value.trim()) {
							setOpen(true);
						}
					}}
				/>
			</div>
			{showDropdown && (
				<ul className="tasting-autocomplete__dropdown">
					{filtered.map((s, i) => (
						<li
							key={s}
							className={`tasting-autocomplete__option${i === activeIndex ? ' tasting-autocomplete__option--active' : ''}`}
							onMouseDown={(e) => {
								e.preventDefault();
								select(s);
							}}
						>
							{s}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
