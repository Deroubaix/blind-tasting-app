'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CODE_LENGTH, normalizeCode } from '../../utils/flightLogic';
import { useText } from '../../i18n/LanguageProvider';
import { layoutText } from '../../i18n/layout';

type CodeFormProps = {
	id: string;
	/** A visible label; without one the field is labelled for screen readers only. */
	label?: string;
	hint?: string;
	onGo?: () => void;
};

/** The six-character flight code and Join. The flight page handles joining, or logging in first. */
export default function CodeForm({ id, label, hint, onGo }: CodeFormProps) {
	const t = useText(layoutText).header;
	const router = useRouter();
	const [code, setCode] = useState('');
	return (
		<form
			className="code-form"
			onSubmit={(e) => {
				e.preventDefault();
				if (code.length === CODE_LENGTH) {
					onGo?.();
					router.push(`/flights/${code}`);
				}
			}}
		>
			<label htmlFor={id} className={label ? 'code-form__label' : 'visually-hidden'}>
				{label ?? t.flightCode}
			</label>
			<div className="code-form__row">
				<input
					id={id}
					className="code-form__input"
					placeholder="ABC123"
					autoComplete="off"
					autoCapitalize="characters"
					spellCheck={false}
					value={code}
					onChange={(e) => setCode(normalizeCode(e.target.value).slice(0, CODE_LENGTH))}
				/>
				<button type="submit" className="btn-quiet code-form__btn" disabled={code.length !== CODE_LENGTH}>
					{t.join}
				</button>
			</div>
			{hint && <span className="code-form__hint">{hint}</span>}
		</form>
	);
}
