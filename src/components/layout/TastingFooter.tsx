'use client';

import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import Loading from '../misc/Loading';
import { useText } from '../../i18n/LanguageProvider';
import { commonText } from '../../i18n/common';

type TastingFooterProps = {
	onBack?: () => void;
	backLabel?: string;
	nextLabel: string;
	onNext: () => void;
	nextLoading?: boolean;
	nextDisabled?: boolean;
};

export default function TastingFooter({
	onBack,
	backLabel,
	nextLabel,
	onNext,
	nextLoading,
	nextDisabled,
}: TastingFooterProps) {
	const c = useText(commonText);
	const back = backLabel ?? c.back;
	return (
		<footer className="tasting-footer">
			{onBack && (
				<button className="btn-quiet tasting-footer__back" onClick={onBack} aria-label={back}>
					<IconArrowLeft size={16} aria-hidden="true" />
					<span className="tasting-footer__back-label">{back}</span>
				</button>
			)}

			<button
				className="tasting-footer__next btn-primary"
				onClick={onNext}
				disabled={nextLoading || nextDisabled}
			>
				{nextLoading && <Loading size={14} inline />}
				{nextLabel}
				<IconArrowRight size={16} aria-hidden="true" />
			</button>
		</footer>
	);
}
