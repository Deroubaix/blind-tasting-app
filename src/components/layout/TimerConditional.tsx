'use client';

import { useLayoutEffect } from 'react';
import TimerWrapper from '../layout/TimerWrapper';
import { useTastingContext } from '../../components/tasting/TastingContext';
import { DEFAULT_TIMER_SECONDS, type TimerPhase, nextPhaseLabel, phaseSeconds } from '../../data/timerData';
import { stampPhase } from '../../data/timerClock';
import { gridOf } from '../../data/grids';

interface TimerConditionalProps {
	page: TimerPhase;
	destination: string;
}

export default function TimerConditional({ page, destination }: TimerConditionalProps) {
	const { tastingData, updateTastingData } = useTastingContext();

	const totalSeconds = tastingData.timerSeconds ?? DEFAULT_TIMER_SECONDS;
	const isExam = tastingData.timerMode === 'exam' && !!tastingData.timerEndsAt;
	const guided = tastingData.timerEnabled && !isExam;
	const grid = gridOf(tastingData.grid);
	const seconds = phaseSeconds(totalSeconds, page, grid);
	const phaseEndsAt = tastingData.phaseEndsAt?.[page];

	// A guided phase's deadline is stamped once, the first time the phase is opened, and kept in
	// the tasting state — so Back finds the clock where it was. A layout effect, so the stamp lands
	// before the first paint and the clock never flashes empty.
	useLayoutEffect(() => {
		if (guided && phaseEndsAt === undefined) {
			updateTastingData((current) => stampPhase(current, page, seconds, Date.now()) ?? {});
		}
	}, [guided, phaseEndsAt, page, seconds, updateTastingData]);

	// If timer is not enabled, render nothing.
	if (!tastingData.timerEnabled) {
		return null;
	}

	// Exam mode: one clock for the whole wine, counting to the deadline stamped at Start. Running
	// out ends the wine wherever the taster is, so it always hands over to Save.
	if (isExam) {
		return (
			<TimerWrapper
				defaultDuration={totalSeconds}
				endsAt={tastingData.timerEndsAt}
				pausedAt={tastingData.timerPausedAt}
				destination={`/tastings/save?wineType=${tastingData.wineType?.toLowerCase() ?? 'red'}`}
				nextLabel={null}
				isFinalPhase
			/>
		);
	}

	if (phaseEndsAt === undefined) {
		return null;
	}

	return (
		<TimerWrapper
			defaultDuration={seconds}
			endsAt={phaseEndsAt}
			pausedAt={tastingData.timerPausedAt}
			destination={destination}
			nextLabel={nextPhaseLabel(page, grid)}
			isFinalPhase={page === 'finalConclusion'}
		/>
	);
}
