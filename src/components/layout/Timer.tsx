'use client';

import React, { useEffect, useRef, useState } from 'react';

interface TimerProps {
	initialTime: number;
	onTimeUp?: () => void;
}

export default function Timer({ initialTime, onTimeUp }: TimerProps) {
	const [timeLeft, setTimeLeft] = useState(initialTime);
	const onTimeUpRef = useRef(onTimeUp);
	useEffect(() => {
		onTimeUpRef.current = onTimeUp;
	}, [onTimeUp]);

	// Anchored to a wall-clock deadline, not decremented per tick: mobile browsers throttle
	// background intervals and iOS suspends them on screen lock, which stalls a per-tick clock.
	const endsAtRef = useRef<number | null>(null);
	const hasFiredRef = useRef(false);

	// Reading the clock is impure, so the deadline is stamped on mount rather than
	// during render. The ticker below no-ops until this has run.
	useEffect(() => {
		endsAtRef.current = Date.now() + initialTime * 1000;
		hasFiredRef.current = false;
	}, [initialTime]);

	useEffect(() => {
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
