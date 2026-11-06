'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Fades its section up as it scrolls into view. A section already on screen, or a page without
 * JavaScript, never hides; reduced motion is handled in the stylesheet.
 */
export default function RevealOnScroll({
	as: Tag = 'section',
	className = '',
	id,
	children,
}: {
	as?: 'section' | 'div';
	className?: string;
	id?: string;
	children: React.ReactNode;
}) {
	const ref = useRef<HTMLElement>(null);
	const [state, setState] = useState<'shown' | 'waiting' | 'in'>('shown');

	useEffect(() => {
		const el = ref.current;
		if (!el || !('IntersectionObserver' in window) || el.getBoundingClientRect().top < window.innerHeight) {
			return;
		}
		setState('waiting');
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setState('in');
					io.disconnect();
				}
			},
			{ rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	return (
		<Tag ref={ref as React.RefObject<never>} id={id} className={`rv rv--${state} ${className}`.trim()}>
			{children}
		</Tag>
	);
}
