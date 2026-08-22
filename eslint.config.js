/**
 * Flat ESLint config, adapted from dr-pam's `shared-config/eslint.js` for a single-package repo.
 *
 * The layering matters. `eslint-config-next` already registers the `react`, `react-hooks`,
 * `jsx-a11y` and `import` plugins, and flat config throws "Cannot redefine plugin" if any of them is
 * registered twice — so Next's copies are used as-is and everything else is layered around them.
 * Prettier goes last so formatting always has the final say.
 */
import js from '@eslint/js';
import next from 'eslint-config-next';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import security from 'eslint-plugin-security';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** Build output, generated code and vendored files — never linted. */
const ignores = [
	'**/.next/**',
	'**/build/**',
	'**/dist/**',
	'**/node_modules/**',
	'**/coverage/**',
	'**/public/**',
	'**/src/generated/**',
	'**/prisma/migrations/**',
];

const languageOptions = {
	globals: { ...globals.browser, ...globals.node },
	parserOptions: { sourceType: 'module', ecmaFeatures: { jsx: true } },
};

export default tseslint.config(
	{ ignores },
	js.configs.recommended,
	security.configs.recommended,
	...next,
	// The TypeScript rules are scoped to TypeScript files and re-assert the TS parser.
	// `eslint-config-next` sets its own parser for *every* file, so without this scoping the
	// type-aware rules get applied to plain `.js` files — including this config itself.
	{
		files: ['**/*.ts', '**/*.tsx'],
		extends: [...tseslint.configs.recommended],
		languageOptions: { ...languageOptions, parser: tseslint.parser },
	},
	prettierRecommended,
	{
		files: ['**/*.ts', '**/*.tsx'],
		settings: { react: { version: 'detect' } },
		rules: {
			// The codebase annotates return types where they matter and leans on inference elsewhere.
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/consistent-type-imports': ['warn', { fixStyle: 'inline-type-imports' }],
			curly: ['error', 'all'],
			// These fire on ordinary indexing and path building, which this app does constantly.
			'security/detect-non-literal-fs-filename': 'off',
			'security/detect-object-injection': 'off',
			// Types do this job; prop-types are not used.
			'react/prop-types': 'off',
			// The new JSX transform makes React imports unnecessary.
			'react/react-in-jsx-scope': 'off',
		},
	},
);
