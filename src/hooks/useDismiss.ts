import { type RefObject, useEffect } from 'react';

/** Closes an open menu on Escape, or on a press outside `ref`; Escape hands focus back to `trigger`. */
export default function useDismiss(
	open: boolean,
	close: () => void,
	ref: RefObject<HTMLElement | null>,
	trigger?: RefObject<HTMLElement | null>,
) {
	useEffect(() => {
		if (!open) {
			return;
		}
		const onPointer = (e: PointerEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				close();
			}
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				// Claimed, so the tasting page's Escape-to-go-back leaves it alone.
				e.preventDefault();
				close();
				trigger?.current?.focus();
			}
		};
		document.addEventListener('pointerdown', onPointer);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('pointerdown', onPointer);
			document.removeEventListener('keydown', onKey);
		};
	}, [open, close, ref, trigger]);
}
