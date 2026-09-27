'use client';

import React, { useEffect } from 'react';
import { IconArrowRight } from '@tabler/icons-react';
import Timer from '../layout/Timer';
import { useRouter } from 'next/navigation';
import { useTastingContext } from '../tasting/TastingContext';
import { useModalProvider } from '../modal/ModalProvider';
import { useToastProvider } from '../../toast/ToastProvider';
import { playBeep, unlockAudio } from '../../utils/beep';

interface TimerWrapperProps {
	defaultDuration: number;
	/** The deadline: exam mode's whole-wine one, or this guided phase's own. */
	endsAt?: number;
	pausedAt?: number | null;
	destination: string;
	/** Display name of the phase being handed over to. Absent on the last phase. */
	nextLabel?: string | null;
	/** The last timed phase ends the session with a modal instead of moving straight on. */
	isFinalPhase?: boolean;
}

export default function TimerWrapper({
	defaultDuration,
	endsAt,
	pausedAt,
	destination,
	nextLabel,
	isFinalPhase,
}: TimerWrapperProps) {
	const router = useRouter();
	const { tastingData } = useTastingContext();
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
				title: 'Time',
				children: nextLabel ? `Moving on to ${nextLabel}.` : 'Moving on.',
				autoCloseMs: 4000,
			});
			router.push(destination);
			return;
		}

		// The timed portion is over, so this is the one place a modal earns the interruption.
		const modalId = 'tasting-time-up';
		openModal({
			modalId,
			title: 'Time',
			className: 'TimeUpModal',
			closeOnClickOutside: false,
			closeOnEsc: true,
			children: (
				<div className="timeup">
					<p className="timeup__lead">
						{tastingData.timerMode === 'exam'
							? 'Time is up for this wine.'
							: 'That is the full deductive sequence — all five phases complete.'}
					</p>
					<p className="timeup__note">
						Your answers are saved as you go, so nothing is lost. Add any closing notes and a photo on the
						next screen.
					</p>
					<button
						className="btn-primary timeup__action"
						onClick={() => {
							closeModal(modalId);
							router.push(destination);
						}}
					>
						Review &amp; Save
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
