'use client';

import React from 'react';
import { LANGS, LANG_NAMES } from './index';
import { useLang } from './LanguageProvider';

/** EN | PT. Each button is labelled with the full language name for screen readers. */
export default function LanguageSwitch({ className = '' }: { className?: string }) {
	const { lang, setLang } = useLang();
	return (
		<div className={`lang-switch ${className}`.trim()} role="group" aria-label="Language / Idioma">
			{LANGS.map((code, i) => (
				<React.Fragment key={code}>
					{i > 0 && <span className="lang-switch__sep" aria-hidden="true" />}
					<button
						type="button"
						className="lang-switch__btn"
						lang={code}
						aria-label={LANG_NAMES[code]}
						aria-pressed={lang === code}
						onClick={() => setLang(code)}
					>
						{code.toUpperCase()}
					</button>
				</React.Fragment>
			))}
		</div>
	);
}
