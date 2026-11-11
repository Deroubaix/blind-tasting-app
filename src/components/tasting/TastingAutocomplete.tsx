'use client';

import { useState, useRef, useEffect, useId, useLayoutEffect } from 'react';
import useDropPlacement from './useDropPlacement';
import { matchSuggestions, resolveEnter } from '../../utils/autocompleteMatch';
import { useText } from '../../i18n/LanguageProvider';
import { tastingText } from '../../i18n/tasting';

interface Props {
	suggestions: string[];
	value: string;
	onChange: (v: string) => void;
	onConfirm: (v: string) => void;
	placeholder?: string;
	icon?: React.ReactNode;
	/** Id for the text box, so a visible <label htmlFor> names it. */
	id?: string;
	/** Name for screen readers when there is no <label> pointing at `id`. */
	ariaLabel?: string;
	/** Shown and searched in place of each suggestion; what's confirmed is still the suggestion. */
	labelOf?: (suggestion: string) => string;
}

/**
 * A search box with suggestions, following the ARIA combobox pattern so screen readers announce
 * the list and the highlighted suggestion as the arrows move through it.
 */
export default function TastingAutocomplete({
	suggestions,
	value,
	onChange,
	onConfirm,
	placeholder,
	icon,
	id,
	ariaLabel,
	labelOf,
}: Props) {
	const t = useText(tastingText).inputs;
	const listId = useId();
	const optionId = (index: number) => `${listId}-option-${index}`;
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const wrapRef = useRef<HTMLDivElement>(null);

	const shown = labelOf ? suggestions.map((suggestion) => labelOf(suggestion)) : suggestions;
	const stored = (label: string) => suggestions[shown.indexOf(label)] ?? label;
	const filtered = matchSuggestions(value, shown);

	const showDropdown = open && filtered.length > 0;
	const { dropUp, maxHeight } = useDropPlacement(wrapRef, showDropdown);

	// Typed but never added: kept when the taster leaves the box, or the page (Cmd+Enter, the clock).
	const pending = useRef(() => {});
	useLayoutEffect(() => {
		pending.current = () => {
			if (value.trim()) {
				onConfirm(stored(resolveEnter(value, shown)));
			}
		};
	});
	useEffect(() => () => pending.current(), []);

	const select = (suggestion: string) => {
		onConfirm(stored(suggestion));
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
				onConfirm(stored(resolveEnter(value, shown)));
				setOpen(false);
			}
		} else if (e.key === 'Escape') {
			if (open) {
				e.preventDefault();
			}
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
					id={id}
					className="tasting-search-input"
					role="combobox"
					aria-label={ariaLabel}
					aria-autocomplete="list"
					aria-expanded={showDropdown}
					aria-controls={listId}
					aria-activedescendant={showDropdown && activeIndex >= 0 ? optionId(activeIndex) : undefined}
					placeholder={placeholder}
					value={value}
					onChange={(e) => {
						onChange(e.target.value);
						setOpen(true);
						setActiveIndex(-1);
					}}
					onKeyDown={handleKeyDown}
					onBlur={() => pending.current()}
					onFocus={() => {
						if (value.trim()) {
							setOpen(true);
						}
					}}
				/>
			</div>
			{showDropdown && (
				<ul
					id={listId}
					role="listbox"
					aria-label={ariaLabel ?? t.suggestions}
					className={`tasting-autocomplete__dropdown${dropUp ? ' tasting-autocomplete__dropdown--up' : ''}`}
					style={{ maxHeight }}
				>
					{filtered.map((s, i) => (
						<li
							key={s}
							id={optionId(i)}
							role="option"
							aria-selected={i === activeIndex}
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
