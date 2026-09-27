'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface TimerProps {
	/** The full length of this clock, in seconds. Also what the amber warning is a share of. */
	initialTime: number;
	/**
	 * A deadline that outlives this component (exam mode: one clock for the whole wine, carried
	 * across phase pages). Without it the clock starts fresh at `initialTime` on mount.
	 */
	endsAt?: number;
	onTimeUp?: () => void;
}

export default function Timer({ initialTime, endsAt, onTimeUp }: TimerProps) {
	const [timeLeft, setTimeLeft] = useState(initialTime);
	const onTimeUpRef = useRef(onTimeUp);
	useEffect(() => {
		onTimeUpRef.current = onTimeUp;
	}, [onTimeUp]);

	// Anchored to a wall-clock deadline, not decremented per tick: mobile browsers throttle
	// background intervals and iOS suspends them on screen lock, which stalls a per-tick clock.
	const endsAtRef = useRef<number | null>(null);
	const hasFiredRef = useRef(false);
	// The ticker's sync, so the deadline effect can re-read the clock when the deadline changes.
	const syncRef = useRef<(() => void) | null>(null);

	// Reading the clock is impure, so the deadline is stamped on mount rather than during render.
	// A layout effect, so a clock joining a deadline already under way shows the time actually
	// left before the first paint rather than flashing its full length.
	useLayoutEffect(() => {
		endsAtRef.current = endsAt ?? Date.now() + initialTime * 1000;
		hasFiredRef.current = false;
		syncRef.current?.();
	}, [initialTime, endsAt]);

	useLayoutEffect(() => {
		const sync = () => {
			if (endsAtRef.current === null) {
				return;
			}
			const remaining = Math.max(0, Math.round((endsAtRef.current - Date.now()) / 1000));
			setTimeLeft(remaining);

			if (remaining === 0 && !hasFiredRef.current) {
				hasFiredRef.current = true;
				onTimeUpRef.current?.();
			}
		};

		syncRef.current = sync;
		sync();
		const intervalId = setInterval(sync, 500);
		// Catches up the instant the tab is foregrounded again.
		document.addEventListener('visibilitychange', sync);

		return () => {
			clearInterval(intervalId);
			document.removeEventListener('visibilitychange', sync);
		};
	}, []);

	const minutes = Math.floor(timeLeft / 60);
	const seconds = timeLeft % 60;
	const formattedTime = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

	// Proportional, not a flat 60s — four of the five phases only run for 30s, so a fixed
	// threshold would be on from the first tick. Marks "wrap up" in every phase.
	const warnAt = Math.max(5, Math.round(initialTime * 0.25));
	const stateClass = timeLeft === 0 ? 'timer-display--expired' : timeLeft <= warnAt ? 'timer-display--warning' : '';

	return <span className={`timer-display${stateClass ? ` ${stateClass}` : ''}`}>{formattedTime}</span>;
}
