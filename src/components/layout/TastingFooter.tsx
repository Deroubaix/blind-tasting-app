'use client';

import { IconArrowLeft, IconArrowRight, IconRefresh } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import Loading from '../misc/Loading';
import { useModalProvider } from '../modal/ModalProvider';
import { useTastingContext } from '../tasting/TastingContext';
import { useText } from '../../i18n/LanguageProvider';
import { commonText } from '../../i18n/common';
import { layoutText } from '../../i18n/layout';

type TastingFooterProps = {
	onBack?: () => void;
	backLabel?: string;
	nextLabel: string;
	onNext: () => void;
	nextLoading?: boolean;
	nextDisabled?: boolean;
};

const START_OVER_MODAL = 'tasting-start-over';

export default function TastingFooter({
	onBack,
	backLabel,
	nextLabel,
	onNext,
	nextLoading,
	nextDisabled,
}: TastingFooterProps) {
	const t = useText(layoutText).tastingFooter;
	const c = useText(commonText);
	const back = backLabel ?? c.back;
	const router = useRouter();
	const { tastingData, resetTastingData } = useTastingContext();
	const { openModal, closeModal } = useModalProvider();

	// Discarding a whole session is worth the interruption: nothing is persisted until the
	// save step, so this has to name what goes before it goes.
	const handleStartOver = () => {
		openModal({
			modalId: START_OVER_MODAL,
			title: t.startOverQ,
			className: 'StartOverModal',
			closeOnClickOutside: true,
			closeOnEsc: true,
			children: (
				<div className="dialog">
					<p className="dialog__lead">{t.clears(tastingData.flight?.wineNumber ?? null)}</p>
					<p className="dialog__note">{tastingData.flight ? t.clockRuns : t.nothingSaved}</p>
					<div className="dialog__actions">
						<button className="btn-quiet" onClick={() => closeModal(START_OVER_MODAL)}>
							{t.keepTasting}
						</button>
						<button
							className="btn-primary"
							onClick={() => {
								closeModal(START_OVER_MODAL);
								const flight = tastingData.flight;
								resetTastingData();
								router.push(flight ? `/flights/${flight.code}` : '/tastings/start');
							}}
						>
							{t.startOver}
						</button>
					</div>
				</div>
			),
		});
	};

	return (
		<footer className="tasting-footer">
			<button className="btn-quiet tasting-footer__start-over" onClick={handleStartOver} aria-label={t.startOver}>
				<IconRefresh size={18} aria-hidden="true" />
			</button>

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
