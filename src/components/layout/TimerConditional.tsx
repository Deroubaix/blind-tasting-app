'use client';

import TimerWrapper from '../layout/TimerWrapper';
import { useTastingContext } from '../../components/tasting/TastingContext';
import { NEXT_PHASE_LABEL, PHASE_TIMER_SECONDS } from '../../data/timerData';

interface TimerConditionalProps {
	page: 'sight' | 'nose' | 'palate' | 'initialConclusion' | 'finalConclusion';
	destination: string;
}

export default function TimerConditional({ page, destination }: TimerConditionalProps) {
	const { tastingData } = useTastingContext();

	// If timer is not enabled, render nothing.
	if (!tastingData.timerEnabled) {
		return null;
	}

	const selectedOption = tastingData.timerDuration === 7.5 ? '7.5 min' : '4 min';

	const defaultDuration = PHASE_TIMER_SECONDS[page][selectedOption];

	return (
		<TimerWrapper
			defaultDuration={defaultDuration}
			destination={destination}
			nextLabel={NEXT_PHASE_LABEL[page]}
			isFinalPhase={page === 'finalConclusion'}
		/>
	);
}
