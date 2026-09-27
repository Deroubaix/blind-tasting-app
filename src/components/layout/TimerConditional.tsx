'use client';

import TimerWrapper from '../layout/TimerWrapper';
import { useTastingContext } from '../../components/tasting/TastingContext';
import { DEFAULT_TIMER_SECONDS, NEXT_PHASE_LABEL, type TimerPhase, phaseSeconds } from '../../data/timerData';

interface TimerConditionalProps {
	page: TimerPhase;
	destination: string;
}

export default function TimerConditional({ page, destination }: TimerConditionalProps) {
	const { tastingData } = useTastingContext();

	// If timer is not enabled, render nothing.
	if (!tastingData.timerEnabled) {
		return null;
	}

	const totalSeconds = tastingData.timerSeconds ?? DEFAULT_TIMER_SECONDS;

	// Exam mode: one clock for the whole wine, counting to the deadline stamped at Start. Running
	// out ends the wine wherever the taster is, so it always hands over to Save.
	if (tastingData.timerMode === 'exam' && tastingData.timerEndsAt) {
		return (
			<TimerWrapper
				defaultDuration={totalSeconds}
				endsAt={tastingData.timerEndsAt}
				destination={`/tastings/save?wineType=${tastingData.wineType?.toLowerCase() ?? 'red'}`}
				nextLabel={null}
				isFinalPhase
			/>
		);
	}

	return (
		<TimerWrapper
			defaultDuration={phaseSeconds(totalSeconds, page)}
			destination={destination}
			nextLabel={NEXT_PHASE_LABEL[page]}
			isFinalPhase={page === 'finalConclusion'}
		/>
	);
}
