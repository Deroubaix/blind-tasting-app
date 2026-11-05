import React from 'react';
import { useText } from '../../i18n/LanguageProvider';
import { commonText } from '../../i18n/common';
import { tastingText } from '../../i18n/tasting';

type WineInputProps = {
	wineName: string;
	setWineName: (name: string) => void;
	onNext: () => void;
};

export default function WineInput({ wineName, setWineName, onNext }: WineInputProps) {
	const t = useText(tastingText).inputs;
	const common = useText(commonText);
	const handleNext = () => {
		if (!wineName.trim()) {
			alert(t.wineNameRequired);
			return;
		}
		onNext();
	};

	return (
		<section className="wine-input">
			<h1>{t.wine}</h1>
			<input
				type="text"
				value={wineName}
				placeholder={t.wineNamePlaceholder}
				onChange={(e) => setWineName(e.target.value)}
			/>
			<button onClick={handleNext}>{common.next}</button>
		</section>
	);
}
