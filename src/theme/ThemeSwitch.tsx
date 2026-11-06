'use client';

import React from 'react';
import { THEMES } from './index';
import { useTheme } from './ThemeProvider';
import { useText } from '../i18n/LanguageProvider';
import { layoutText } from '../i18n/layout';

/** Light · Dark · Auto, as words. Auto follows the system setting. */
export default function ThemeSwitch({ className = '' }: { className?: string }) {
	const t = useText(layoutText).appearance;
	const { theme, setTheme } = useTheme();
	return (
		<div className={`word-switch ${className}`.trim()} role="group" aria-label={t.label}>
			{THEMES.map((name, i) => (
				<React.Fragment key={name}>
					{i > 0 && (
						<span className="word-switch__sep" aria-hidden="true">
							·
						</span>
					)}
					<button
						type="button"
						className="word-switch__btn"
						aria-pressed={theme === name}
						onClick={() => setTheme(name)}
					>
						{t[name]}
					</button>
				</React.Fragment>
			))}
		</div>
	);
}
