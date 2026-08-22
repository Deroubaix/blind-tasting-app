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

	useEffect(() => {
		if (timeLeft <= 0) {
			onTimeUpRef.current?.();
			return;
		}
		const intervalId = setInterval(() => {
			setTimeLeft((prev) => prev - 1);
		}, 1000);
		return () => clearInterval(intervalId);
	}, [timeLeft]); // onTimeUp intentionally excluded — reads via ref

	const minutes = Math.floor(timeLeft / 60);
	const seconds = timeLeft % 60;
	const formattedTime = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

	// Warn over the last quarter of the phase, floored at 5s.
	//
	// This used to be a flat `timeLeft <= 60`. Four of the five phases run for 30 seconds, so the
	// warning colour was on from the first tick and therefore told you nothing; only the nose (120s)
	// ever changed, and it did so at the halfway mark. A proportional threshold means the amber
	// actually marks "wrap up" in every phase: 7s into a 30s phase, 30s into the nose.
	const warnAt = Math.max(5, Math.round(initialTime * 0.25));
	const stateClass = timeLeft === 0 ? 'timer-display--expired' : timeLeft <= warnAt ? 'timer-display--warning' : '';

	return <span className={`timer-display${stateClass ? ` ${stateClass}` : ''}`}>{formattedTime}</span>;
}
