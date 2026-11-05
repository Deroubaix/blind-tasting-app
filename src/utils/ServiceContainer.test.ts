import { describe, expect, it } from 'vitest';
import ServiceContainer from './ServiceContainer';

class Clock {
	now = () => 1;
}
class Greeter {
	constructor(public readonly clock: Clock) {}
}
class Loop {
	constructor(public readonly other: unknown) {}
}

describe('ServiceContainer', () => {
	it('builds each class once, on first use, in any registration order', () => {
		let built = 0;
		const c = new ServiceContainer()
			.withClassConstructorCallback(Greeter, (s) => [s.getClass(Clock)])
			.withFactory(Clock, () => {
				built += 1;
				return new Clock();
			});
		expect(built).toBe(0);
		expect(c.getClass(Greeter).clock).toBe(c.getClass(Clock));
		expect(c.getClass(Greeter)).toBe(c.getClass(Greeter));
		expect(built).toBe(1);
	});

	it('names a type that was never registered', () => {
		expect(() => new ServiceContainer().getClass(Clock)).toThrow('No class constructor found for type Clock');
	});

	it('reports a cycle instead of overflowing the stack', () => {
		const c = new ServiceContainer().withClassConstructorCallback(Loop, (s) => [s.getClass(Loop)]);
		expect(() => c.getClass(Loop)).toThrow('Circular dependency while building Loop');
	});

	it('registers a class with no arguments', () => {
		expect(new ServiceContainer().withClass(Clock).getClass(Clock).now()).toBe(1);
	});
});
