import { defineConfig } from 'vitest/config';

// Tests sit next to the code they cover as *.test.ts(x). Node by default; a test that renders a
// component opts into jsdom with a `@vitest-environment jsdom` comment at its top.
export default defineConfig({
	// tsconfig says `jsx: preserve`, which is right for Next (it compiles JSX itself) but leaves
	// Vitest's transformer nothing to do. Compile it here with the automatic runtime instead.
	oxc: { jsx: { runtime: 'automatic' } },
	test: {
		include: ['src/**/*.test.{ts,tsx}'],
		environment: 'node',
	},
});
