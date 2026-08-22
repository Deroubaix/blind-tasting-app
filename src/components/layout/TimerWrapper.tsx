'use client';

import React from 'react';
import Timer from '../layout/Timer';
import { useRouter } from 'next/navigation';
import { useTastingContext } from '../tasting/TastingContext';
import { useModalProvider } from '../modal/ModalProvider';
import { useToastProvider } from '../../toast/ToastProvider';

interface TimerWrapperProps {
	defaultDuration: number;
	destination: string;
	/** Display name of the phase being handed over to. Absent on the last phase. */
	nextLabel?: string | null;
	/** The last timed phase ends the session with a modal instead of moving straight on. */
	isFinalPhase?: boolean;
}

function playBeep() {
	try {
		const AudioCtx =
			window.AudioContext ??
			(window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (!AudioCtx) {
			return;
		}
		const audioCtx = new AudioCtx();
		const oscillator = audioCtx.createOscillator();
		const gainNode = audioCtx.createGain();
		oscillator.connect(gainNode);
		gainNode.connect(audioCtx.destination);
		oscillator.type = 'sine';
		oscillator.frequency.value = 880;
		gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
		oscillator.start(audioCtx.currentTime);
		oscillator.stop(audioCtx.currentTime + 0.8);
	} catch {
		// Audio not available
	}
}

export default function TimerWrapper({ defaultDuration, destination, nextLabel, isFinalPhase }: TimerWrapperProps) {
	const router = useRouter();
	const { tastingData } = useTastingContext();
	const { openModal, closeModal } = useModalProvider();
	const { showToast } = useToastProvider();

	const handleTimeUp = () => {
		if (tastingData.soundEnabled !== false) {
			playBeep();
		}
		if (typeof navigator !== 'undefined' && navigator.vibrate) {
			navigator.vibrate([200, 100, 200]);
		}

		// Mid-session the clock is the point of the exercise, so expiry never blocks: it moves on and
		// says so afterwards. Stopping for a confirmation five times in a four-minute session would
		// hand back unlimited thinking time at exactly the boundary being trained against.
		if (!isFinalPhase) {
			showToast({
				title: 'Time',
				children: nextLabel ? `Moving on to ${nextLabel}.` : 'Moving on.',
				autoCloseMs: 4000,
			});
			router.push(destination);
			return;
		}

		// The last phase is different — the timed portion is over, so there is nothing left to rush.
		// This is the natural stopping point, and the one place a modal earns the interruption.
		const modalId = 'tasting-time-up';
		openModal({
			modalId,
			title: 'Time',
			className: 'TimeUpModal',
			closeOnClickOutside: false,
			closeOnEsc: true,
			children: (
				<div className="timeup">
					<p className="timeup__lead">That is the full deductive sequence — all five phases complete.</p>
					<p className="timeup__note">
						Your answers are saved as you go, so nothing is lost. Add any closing notes and a label photo on
						the next screen.
					</p>
					<button
						className="btn-primary timeup__action"
						onClick={() => {
							closeModal(modalId);
							router.push(destination);
						}}
					>
						Review &amp; Save →
					</button>
				</div>
			),
		});
	};

	return <Timer initialTime={defaultDuration} onTimeUp={handleTimeUp} />;
}
