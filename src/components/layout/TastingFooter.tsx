'use client';

import { IconArrowLeft, IconArrowRight, IconRefresh } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import Loading from '../misc/Loading';
import { useModalProvider } from '../modal/ModalProvider';
import { useTastingContext } from '../tasting/TastingContext';

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
	backLabel = 'Back',
	nextLabel,
	onNext,
	nextLoading,
	nextDisabled,
}: TastingFooterProps) {
	const router = useRouter();
	const { resetTastingData } = useTastingContext();
	const { openModal, closeModal } = useModalProvider();

	// Discarding a whole session is worth the interruption: nothing is persisted until the
	// save step, so this has to name what goes before it goes.
	const handleStartOver = () => {
		openModal({
			modalId: START_OVER_MODAL,
			title: 'Start over?',
			className: 'StartOverModal',
			closeOnClickOutside: true,
			closeOnEsc: true,
			children: (
				<div className="start-over">
					<p className="start-over__lead">
						This clears every answer in this tasting — sight, nose, palate and both conclusions — and takes
						you back to setup.
					</p>
					<p className="start-over__note">
						The tasting has not been saved yet, so there is nothing to come back to.
					</p>
					<div className="start-over__actions">
						<button className="outline start-over__cancel" onClick={() => closeModal(START_OVER_MODAL)}>
							Keep tasting
						</button>
						<button
							className="btn-primary start-over__confirm"
							onClick={() => {
								closeModal(START_OVER_MODAL);
								resetTastingData();
								router.push('/tastings/start');
							}}
						>
							<IconRefresh size={16} />
							Start over
						</button>
					</div>
				</div>
			),
		});
	};

	return (
		<footer className="tasting-footer">
			<div className="tasting-footer__left">
				<button className="tasting-footer__start-over" onClick={handleStartOver} aria-label="Start over">
					<span className="tasting-footer__start-over-icon" aria-hidden="true">
						<IconRefresh size={18} />
					</span>
					<span className="tasting-footer__start-over-label">Start over</span>
				</button>
			</div>

			{onBack && (
				<button className="tasting-footer__back-btn" onClick={onBack} aria-label={backLabel}>
					<span className="tasting-footer__back-icon" aria-hidden="true">
						<IconArrowLeft size={18} />
					</span>
					<span className="tasting-footer__back-label">{backLabel}</span>
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
