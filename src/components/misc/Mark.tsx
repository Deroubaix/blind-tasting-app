import React from 'react';
import { type FieldStatus } from '../../utils/revealScore';

// Pen strokes on a 24px grid: a tick, a tilde, a cross; a dash for a blank, a slash for a field the label lacks.
const MARK_PATHS: Record<FieldStatus, string> = {
	correct: 'M4.5 12.5l4.5 5L19.5 5.5',
	close: 'M4 13.5c2.5-3.5 5-3.5 8 0s5.5 3.5 8 0',
	wrong: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
	notcalled: 'M6 12h12',
	na: 'M8 18L16 6',
};

/** A marker's tick, tilde or cross in the margin. `word` is read out when no visible word sits beside it. */
export default function Mark({
	status,
	word,
	size = 20,
	delay,
	className = '',
}: {
	status: FieldStatus;
	word?: string;
	size?: number;
	delay?: number;
	className?: string;
}) {
	return (
		<span
			className={`mark mark--${status} ${className}`.trim()}
			style={delay === undefined ? undefined : { transitionDelay: `${delay}s` }}
		>
			<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
				<path d={MARK_PATHS[status]} />
			</svg>
			{word && <span className="visually-hidden">{word}</span>}
		</span>
	);
}
