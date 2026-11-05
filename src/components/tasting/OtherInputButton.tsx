import React, { useState } from 'react';
import { useText } from '../../i18n/LanguageProvider';
import { commonText } from '../../i18n/common';
import { tastingText } from '../../i18n/tasting';

interface OtherInputButtonProps {
	label: string;
	savedValue?: string;
	onSave: (category: string, value: string) => void;
}

export default function OtherInputButton({ label, savedValue, onSave }: OtherInputButtonProps) {
	const t = useText(tastingText).inputs;
	const common = useText(commonText);
	const [showInput, setShowInput] = useState(false);
	const [customInput, setCustomInput] = useState(savedValue || '');

	const handleSubmit = () => {
		const trimmed = customInput.trim();
		if (!trimmed) {
			return;
		}
		onSave(label, trimmed);
		setShowInput(false);
	};

	if (showInput) {
		return (
			<div className="other-input">
				<input
					type="text"
					className="tasting-input"
					value={customInput}
					onChange={(e) => setCustomInput(e.target.value)}
					placeholder={t.enterField(label)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							handleSubmit();
						}
						if (e.key === 'Escape') {
							setShowInput(false);
						}
					}}
					autoFocus
				/>
				<button className="rounded quiet" onClick={handleSubmit}>
					{common.save}
				</button>
				<button className="rounded quiet" onClick={() => setShowInput(false)}>
					✕
				</button>
			</div>
		);
	}

	return (
		<div className="other-input">
			{savedValue ? (
				<button className="rounded quiet selected" onClick={() => setShowInput(true)} title={t.clickToEdit}>
					{savedValue} ✎
				</button>
			) : (
				<button className="rounded quiet" onClick={() => setShowInput(true)}>
					{t.enterField(label)}
				</button>
			)}
		</div>
	);
}
