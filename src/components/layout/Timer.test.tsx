// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Timer from './Timer';

const display = (container: HTMLElement) => container.querySelector('.timer-display')!;

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

describe('Timer', () => {
	it('shows the starting time as mm:ss', () => {
		const { container } = render(<Timer initialTime={120} />);

		expect(display(container).textContent).toBe('02:00');
	});

	it('counts down', () => {
		const { container } = render(<Timer initialTime={30} />);

		act(() => vi.advanceTimersByTime(10_000));

		expect(display(container).textContent).toBe('00:20');
	});

	it('fires onTimeUp exactly once, and stops at zero', () => {
		const onTimeUp = vi.fn();
		const { container } = render(<Timer initialTime={30} onTimeUp={onTimeUp} />);

		act(() => vi.advanceTimersByTime(30_000));
		act(() => vi.advanceTimersByTime(10_000));

		expect(onTimeUp).toHaveBeenCalledTimes(1);
		expect(display(container).textContent).toBe('00:00');
		expect(display(container).classList.contains('timer-display--expired')).toBe(true);
	});

	// The reason the timer is anchored to a deadline: a locked phone suspends the interval, and a
	// clock that counted ticks would resume where it stopped instead of where it should be.
	it('catches up after the page was suspended', () => {
		const onTimeUp = vi.fn();
		const { container } = render(<Timer initialTime={120} onTimeUp={onTimeUp} />);

		// Wall-clock time moves on 90s while no interval fires, as on screen lock.
		act(() => {
			vi.setSystemTime(Date.now() + 90_000);
			document.dispatchEvent(new Event('visibilitychange'));
		});

		expect(display(container).textContent).toBe('00:30');
		expect(onTimeUp).not.toHaveBeenCalled();
	});

	it('fires onTimeUp on return if the deadline passed while suspended', () => {
		const onTimeUp = vi.fn();
		render(<Timer initialTime={30} onTimeUp={onTimeUp} />);

		act(() => {
			vi.setSystemTime(Date.now() + 60_000);
			document.dispatchEvent(new Event('visibilitychange'));
		});

		expect(onTimeUp).toHaveBeenCalledTimes(1);
	});

	// Exam mode: one clock for the whole wine. Each phase page mounts its own Timer, and every one
	// must count to the same deadline rather than restarting.
	describe('with a shared deadline', () => {
		it('carries on where the last page left off', () => {
			const endsAt = Date.now() + 240_000;
			const first = render(<Timer initialTime={240} endsAt={endsAt} />);
			act(() => vi.advanceTimersByTime(100_000));
			first.unmount();

			const { container } = render(<Timer initialTime={240} endsAt={endsAt} />);

			expect(display(container).textContent).toBe('02:20');
		});

		it('fires once when the whole-wine time runs out', () => {
			const onTimeUp = vi.fn();
			render(<Timer initialTime={240} endsAt={Date.now() + 5_000} onTimeUp={onTimeUp} />);

			act(() => vi.advanceTimersByTime(10_000));

			expect(onTimeUp).toHaveBeenCalledTimes(1);
		});
	});

	describe('amber warning', () => {
		it('comes on at 25% of the phase time', () => {
			// 120s phase: warns from 30s left.
			const { container } = render(<Timer initialTime={120} />);

			act(() => vi.advanceTimersByTime(89_000));
			expect(display(container).classList.contains('timer-display--warning')).toBe(false);

			act(() => vi.advanceTimersByTime(1_000));
			expect(display(container).classList.contains('timer-display--warning')).toBe(true);
		});

		it('is not on from the first tick of a short phase', () => {
			// A flat 60s threshold used to put every 30s phase in amber from the start.
			const { container } = render(<Timer initialTime={30} />);

			act(() => vi.advanceTimersByTime(1_000));

			expect(display(container).classList.contains('timer-display--warning')).toBe(false);
		});

		it('never starts later than 5s from the end', () => {
			// 25% of 12s is 3s; the 5s floor wins.
			const { container } = render(<Timer initialTime={12} />);

			act(() => vi.advanceTimersByTime(7_000));

			expect(display(container).classList.contains('timer-display--warning')).toBe(true);
		});
	});
});
