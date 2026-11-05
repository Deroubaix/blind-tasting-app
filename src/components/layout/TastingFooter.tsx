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
					<p className="dialog__lead">{t.clears(!!tastingData.flight)}</p>
					<p className="dialog__note">{t.nothingSaved}</p>
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
							<IconRefresh size={16} />
							{t.startOver}
						</button>
					</div>
				</div>
			),
		});
	};

	return (
		<footer className="tasting-footer">
			<div className="tasting-footer__left">
				<button
					className="btn-quiet btn-quiet--sm tasting-footer__start-over"
					onClick={handleStartOver}
					aria-label={t.startOver}
				>
					<span className="tasting-footer__start-over-icon" aria-hidden="true">
						<IconRefresh size={18} />
					</span>
					<span className="tasting-footer__start-over-label">{t.startOver}</span>
				</button>
			</div>

			{onBack && (
				<button className="tasting-footer__back-btn" onClick={onBack} aria-label={back}>
					<span className="tasting-footer__back-icon" aria-hidden="true">
						<IconArrowLeft size={18} />
					</span>
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
				<IconArrowRight size={16} />
			</button>
		</footer>
	);
}
