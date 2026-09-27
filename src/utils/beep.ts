/**
 * The time-up beep. One AudioContext for the whole visit, because iOS Safari only lets a context
 * make sound once it has been started from a tap: a context created when the clock runs out (from
 * a timer, not a tap) stays silent there. `unlockAudio` is called from taps — Start, Pause, and the
 * first tap on each phase page — so by the time the beep is needed the context is already running.
 *
 * Web Audio still follows the iPhone's silent switch; the on-screen notice covers that case.
 */
let context: AudioContext | null = null;

function getContext(): AudioContext | null {
	if (context) {
		return context;
	}
	if (typeof window === 'undefined') {
		return null;
	}
	const AudioCtx =
		window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
	if (!AudioCtx) {
		return null;
	}
	try {
		context = new AudioCtx();
	} catch {
		return null;
	}
	return context;
}

/** Call from a tap or key press. Safe to call repeatedly. */
export function unlockAudio() {
	const ctx = getContext();
	if (ctx && ctx.state === 'suspended') {
		void ctx.resume().catch(() => {});
	}
}

export function playBeep() {
	const ctx = getContext();
	if (!ctx) {
		return;
	}
	try {
		if (ctx.state === 'suspended') {
			void ctx.resume().catch(() => {});
		}
		const oscillator = ctx.createOscillator();
		const gainNode = ctx.createGain();
		oscillator.connect(gainNode);
		gainNode.connect(ctx.destination);
		oscillator.type = 'sine';
		oscillator.frequency.value = 880;
		gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
		oscillator.start(ctx.currentTime);
		oscillator.stop(ctx.currentTime + 0.8);
	} catch {
		// Audio not available
	}
}
