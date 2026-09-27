'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import useDropPlacement from './useDropPlacement';

interface Props {
	options: string[];
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	/** When set, the list starts with this entry, which clears the answer (for optional fields). */
	clearLabel?: string;
	/** Id of the visible label, so the control is announced by name. */
	labelId?: string;
}

/**
 * A styled single-choice dropdown following the ARIA "select-only combobox" pattern, so it works
 * from the keyboard and is announced properly: arrows move, Enter or Space picks, Home/End jump,
 * Escape closes, and Tab moves on. It used to open from the keyboard but offer no way to choose.
 */
export default function TastingCustomSelect({
	options,
	value,
	onChange,
	placeholder = 'Select...',
	clearLabel,
	labelId,
}: Props) {
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const wrapRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLUListElement>(null);
	const { dropUp, maxHeight } = useDropPlacement(wrapRef, open);
	const listId = useId();

	// The clear entry is just the first option, with an empty value.
	const entries = [
		...(clearLabel ? [{ value: '', label: clearLabel }] : []),
		...options.map((o) => ({ value: o, label: o })),
	];
	const optionId = (index: number) => `${listId}-option-${index}`;

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	// Keep the highlighted option in view while arrowing through a list taller than the menu.
	useEffect(() => {
		if (open && activeIndex >= 0) {
			listRef.current
				?.querySelector(`#${CSS.escape(optionId(activeIndex))}`)
				?.scrollIntoView({ block: 'nearest' });
		}
		// optionId is derived from listId, which is stable.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, activeIndex]);

	const openList = () => {
		const current = entries.findIndex((entry) => entry.value === value && (value !== '' || !clearLabel));
		setActiveIndex(current >= 0 ? current : 0);
		setOpen(true);
	};

	const select = (option: string) => {
		onChange(option);
		setOpen(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		const last = entries.length - 1;
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				if (!open) {
					openList();
				} else {
					setActiveIndex((i) => Math.min(i + 1, last));
				}
				break;
			case 'ArrowUp':
				e.preventDefault();
				if (!open) {
					openList();
				} else {
					setActiveIndex((i) => Math.max(i - 1, 0));
				}
				break;
			case 'Home':
				if (open) {
					e.preventDefault();
					setActiveIndex(0);
				}
				break;
			case 'End':
				if (open) {
					e.preventDefault();
					setActiveIndex(last);
				}
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				if (open && activeIndex >= 0) {
					select(entries[activeIndex].value);
				} else {
					openList();
				}
				break;
			case 'Escape':
				if (open) {
					e.preventDefault();
					setOpen(false);
				}
				break;
			case 'Tab':
				setOpen(false);
				break;
		}
	};

	return (
		<div className="tasting-autocomplete" ref={wrapRef}>
			<div
				className={`tasting-search-input-wrap tasting-search-input-wrap--select${open ? ' tasting-search-input-wrap--open' : ''}`}
				role="combobox"
				tabIndex={0}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listId}
				aria-labelledby={labelId}
				aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
				onClick={() => (open ? setOpen(false) : openList())}
				onKeyDown={handleKeyDown}
			>
				<span className={`tasting-select-value${!value ? ' tasting-select-value--placeholder' : ''}`}>
					{value || placeholder}
				</span>
				<IconChevronDown
					size={14}
					aria-hidden="true"
					className={`tasting-search-icon tasting-select-chevron${open ? ' tasting-select-chevron--open' : ''}`}
				/>
			</div>
			{open && (
				<ul
					ref={listRef}
					id={listId}
					role="listbox"
					aria-labelledby={labelId}
					className={`tasting-autocomplete__dropdown${dropUp ? ' tasting-autocomplete__dropdown--up' : ''}`}
					style={{ maxHeight }}
				>
					{entries.map((entry, index) => {
						const isClear = clearLabel !== undefined && index === 0;
						const classes = [
							'tasting-autocomplete__option',
							isClear ? 'tasting-autocomplete__option--clear' : '',
							index === activeIndex || (!isClear && entry.value === value)
								? 'tasting-autocomplete__option--active'
								: '',
						]
							.filter(Boolean)
							.join(' ');
						return (
							<li
								key={isClear ? '__clear' : entry.value}
								id={optionId(index)}
								role="option"
								aria-selected={!isClear && entry.value === value}
								className={classes}
								onMouseDown={(e) => {
									e.preventDefault();
									select(entry.value);
								}}
							>
								{entry.label}
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
