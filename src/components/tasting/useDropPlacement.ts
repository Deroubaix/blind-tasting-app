'use client';

import { type RefObject, useEffect, useState } from 'react';

// The tasting shell is viewport-locked: `.tasting-phase-main` scrolls with `overflow: auto`
// and the footer is pinned across its bottom edge. A menu that reaches past the footer is
// both painted under it and clipped by the scroll container — and no z-index escapes the
// clip — so an open menu has to fit in the space it is given.
//
// Down is the natural direction, so the menu shrinks to fit rather than flipping the moment
// it would not fit whole; it scrolls internally already. Flipping is reserved for when the
// space below is too small to show a useful number of options.
const PREFERRED_HEIGHT = 200; // matches .tasting-autocomplete__dropdown's max-height
const OPTION_HEIGHT = 36; // a measured .tasting-autocomplete__option row
const MIN_USABLE_HEIGHT = OPTION_HEIGHT * 2 + 8; // two rows plus the menu's padding
const GAP = 8; // the menu's 4px offset, plus breathing room

type Placement = { dropUp: boolean; maxHeight: number };

export default function useDropPlacement(anchorRef: RefObject<HTMLElement | null>, open: boolean): Placement {
	const [placement, setPlacement] = useState<Placement>({ dropUp: false, maxHeight: PREFERRED_HEIGHT });

	useEffect(() => {
		if (!open || !anchorRef.current) {
			return;
		}
		const field = anchorRef.current.getBoundingClientRect();
		const footer = document.querySelector('.tasting-footer');
		const floor = footer ? footer.getBoundingClientRect().top : window.innerHeight;

		const below = floor - field.bottom - GAP;
		const above = field.top - GAP;

		const dropUp = below < MIN_USABLE_HEIGHT && above > below;
		const room = dropUp ? above : below;

		setPlacement({ dropUp, maxHeight: Math.min(PREFERRED_HEIGHT, Math.max(room, 0)) });
	}, [anchorRef, open]);

	return placement;
}
