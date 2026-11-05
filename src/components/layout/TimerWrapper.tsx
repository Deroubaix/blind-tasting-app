'use client';

import React, { useEffect } from 'react';
import { IconArrowRight } from '@tabler/icons-react';
import Timer from '../layout/Timer';
import { useRouter } from 'next/navigation';
import { useTastingContext } from '../tasting/TastingContext';
import { useModalProvider } from '../modal/ModalProvider';
import { useToastProvider } from '../toast/ToastProvider';
import { playBeep, unlockAudio } from '../../utils/beep';
import { type TimerPhase } from '../../data/timerData';
import { gridOf } from '../../data/grids';
import { useText } from '../../i18n/LanguageProvider';
import { commonText } from '../../i18n/common';
import { layoutText } from '../../i18n/layout';

interface TimerWrapperProps {
	defaultDuration: number;
	/** The deadline: exam mode's whole-wine one, or this guided phase's own. */
	endsAt?: number;
	pausedAt?: number | null;
	destination: string;
	/** The phase being handed over to. Absent on the last phase. */
	nextPhase?: TimerPhase | null;
	/** The last timed phase ends the session with a modal instead of moving straight on. */
	isFinalPhase?: boolean;
}

export default function TimerWrapper({
	defaultDuration,
	endsAt,
	pausedAt,
	destination,
	nextPhase,
	isFinalPhase,
}: TimerWrapperProps) {
	const router = useRouter();
	const { tastingData } = useTastingContext();
	const t = useText(layoutText).timer;
	const phaseNames = useText(commonText).phase[gridOf(tastingData.grid)];
	const { openModal, closeModal } = useModalProvider();
	const { showToast } = useToastProvider();
	const soundOn = tastingData.soundEnabled !== false;

	// The beep can only sound on iOS if audio was started from a tap. Start does that, but a reload
	// mid-tasting loses it, so the first tap on the page starts it again.
	useEffect(() => {
		if (!soundOn) {
			return;
		}
		const unlock = () => unlockAudio();
		document.addEventListener('pointerdown', unlock, { once: true });
		document.addEventListener('keydown', unlock, { once: true });
		return () => {
			document.removeEventListener('pointerdown', unlock);
			document.removeEventListener('keydown', unlock);
		};
	}, [soundOn]);

	const handleTimeUp = () => {
		if (soundOn) {
			playBeep();
		}
		if (typeof navigator !== 'undefined' && navigator.vibrate) {
			navigator.vibrate([200, 100, 200]);
		}

		// Mid-session expiry never blocks — confirming five times in a four-minute session hands
		// back unlimited thinking time at exactly the boundary being trained against.
		if (!isFinalPhase) {
			showToast({
				title: t.time,
				children: nextPhase ? t.movingOnTo(phaseNames[nextPhase]) : t.movingOn,
				autoCloseMs: 4000,
			});
			router.push(destination);
			return;
		}

		// The timed portion is over, so this is the one place a modal earns the interruption.
		const modalId = 'tasting-time-up';
		openModal({
			modalId,
			title: t.time,
			className: 'TimeUpModal',
			closeOnClickOutside: false,
			closeOnEsc: true,
			children: (
				<div className="dialog">
					<p className="dialog__lead">{tastingData.timerMode === 'exam' ? t.wineOver : t.sequenceOver}</p>
					<p className="dialog__note">{t.kept}</p>
					<button
						className="btn-primary dialog__action"
						onClick={() => {
							closeModal(modalId);
							router.push(destination);
						}}
					>
						{t.reviewSave}
						<IconArrowRight size={16} />
					</button>
				</div>
			),
		});
	};

	// key: a duration change restarts the clock by remounting rather than by resetting state.
	return (
		<Timer
			key={endsAt ?? defaultDuration}
			initialTime={defaultDuration}
			endsAt={endsAt}
			pausedAt={pausedAt}
			onTimeUp={handleTimeUp}
		/>
	);
}
