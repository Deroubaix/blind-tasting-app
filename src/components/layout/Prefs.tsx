'use client';

import React from 'react';
import LanguageSwitch from '../../i18n/LanguageSwitch';
import ThemeSwitch from '../../theme/ThemeSwitch';
import { useText } from '../../i18n/LanguageProvider';
import { layoutText } from '../../i18n/layout';

/** Appearance and Language as two labelled rows: the account menus and the phone menu. */
export default function Prefs() {
	const t = useText(layoutText);
	return (
		<div className="prefs">
			<div className="prefs__row">
				<span aria-hidden="true">{t.appearance.label}</span>
				<ThemeSwitch />
			</div>
			<div className="prefs__row">
				<span aria-hidden="true">{t.header.language}</span>
				<LanguageSwitch />
			</div>
		</div>
	);
}
