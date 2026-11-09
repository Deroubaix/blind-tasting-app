'use client';

import React, { type ReactNode } from 'react';
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
	/** At the start of the row: Start over on a desktop. */
	start?: ReactNode;
};

export default function TastingFooter({
	onBack,
	backLabel,
	nextLabel,
	onNext,
	nextLoading,
	nextDisabled,
	start,
}: TastingFooterProps) {
	const c = useText(commonText);
	const back = backLabel ?? c.back;
	return (
		<footer className="tasting-footer">
			{start}
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
				aria-busy={nextLoading || undefined}
			>
				{nextLabel}
				{nextLoading ? <Loading size={16} inline /> : <IconArrowRight size={16} aria-hidden="true" />}
			</button>
		</footer>
	);
}
