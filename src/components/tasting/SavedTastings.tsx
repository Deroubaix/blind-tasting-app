'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconCamera, IconChevronDown, IconX } from '@tabler/icons-react';
import RevealFields from '../archives/RevealFields';
import { isRevealed } from '../../utils/revealScore';
import { type LabelPhoto, useTastingContext } from '../tasting/TastingContext';
import ClientTastingService from '../../services/client/ClientTastingService';
import ClientPhotoService from '../../services/client/ClientPhotoService';
import { prepareLabelPhoto, PhotoError } from '../../utils/PhotoUtils';
import { useAuthProvider } from '../auth/AuthProvider';
import { useToastProvider } from '../toast/ToastProvider';
import useLoadTracker from '../../hooks/useLoadTracker';
import { JsonApiError } from '../../utils/ErrorUtils';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';
import { gridOf } from '../../data/grids';
import { useText } from '../../i18n/LanguageProvider';
import { tastingText } from '../../i18n/tasting';

export default function SavedTasting({ wineType }: { wineType: 'red' | 'white' }) {
	const { tastingData, updateTastingData, resetTastingData, labelPhoto, setLabelPhoto } = useTastingContext();
	// Written straight through to the context, like every phase page, so the notes survive
	// "Back to Final Conclusion" and the log-in detour without a flush on each way out.
	const notes = tastingData.notes ?? '';
	// Open if a reveal is already under way, e.g. after the log-in detour.
	const [revealOpen, setRevealOpen] = useState(() => isRevealed(tastingData.reveal));
	// The last photo uploaded and the key it went to, so retrying a failed save does not upload the
	// same photo a second time.
	const uploadedPhoto = useRef<{ photo: LabelPhoto; key: string } | null>(null);
	const { isLoading, addLoader, removeLoader } = useLoadTracker();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const autoSaveTriggered = useRef(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const autoSave = searchParams.get('autoSave') === '1';
	const tastingService = new ClientTastingService();
	const photoService = new ClientPhotoService();
	const { user, isInitialLoading, signOut } = useAuthProvider();
	const { showToast } = useToastProvider();
	const grid = gridOf(tastingData.grid);
	const text = useText(tastingText);
	const t = text.save;

	const clearPhotoInput = () => {
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}
		const loader = addLoader();
		try {
			setLabelPhoto(await prepareLabelPhoto(file));
		} catch (error) {
			showToast({
				title: t.photoNotAdded,
				children: error instanceof PhotoError ? t.photoError[error.code] : t.photoNotOpened,
				color: 'error',
			});
		} finally {
			clearPhotoInput();
			removeLoader(loader);
		}
	};

	/** Uploads the label photo if there is one, reusing the earlier upload when a save is retried. */
	const uploadPhoto = async () => {
		if (!labelPhoto) {
			return null;
		}
		if (uploadedPhoto.current?.photo !== labelPhoto) {
			uploadedPhoto.current = { photo: labelPhoto, key: await photoService.uploadLabelPhoto(labelPhoto.blob) };
		}
		return uploadedPhoto.current.key;
	};

	const saveRedirect = `/login?r=${encodeURIComponent(`/tastings/save?wineType=${wineType}&autoSave=1`)}`;

	// Short, because it rides along onto the login page, which says the same thing in its heading.
	const showLoginRequired = () =>
		showToast({
			title: t.loginRequired,
			children: t.loginRequiredBody,
			color: 'error',
			autoCloseMs: 4000,
		});

	const handleSave = async () => {
		if (!user) {
			showLoginRequired();
			router.push(saveRedirect);
			return;
		}

		const loader = addLoader();

		let stage: 'photo' | 'tasting' = 'photo';
		try {
			const photoKey = await uploadPhoto();
			stage = 'tasting';
			const { tasting, flightLate } = await tastingService.saveTasting({ ...tastingData, photoKey }).response;
			const flight = tastingData.flight;
			resetTastingData();
			if (flight) {
				showToast({
					title: flightLate ? t.alreadyRevealed(flight.wineNumber) : t.submitted(flight.wineNumber),
					children: flightLate ? t.lateBody : t.submittedBody,
					color: flightLate ? undefined : 'success',
				});
				router.push(`/flights/${flight.code}`);
				return;
			}
			// Straight to the tasting just saved, where the reveal is waiting, not to the list.
			router.push(tasting.id ? `/archives/${tasting.id}` : '/archives');
		} catch (error) {
			const apiError = JsonApiError.create(error);
			const isAuthError = apiError.statusCode === 401;
			if (isAuthError) {
				// The session died after the page loaded, so the client still believes in a user. Left
				// that way, the login page would bounce straight back here, auto-save would 401 again,
				// and the two would loop. Signing out clears the cookie and the client's user together.
				await signOut().catch(() => undefined);
				showLoginRequired();
				router.push(saveRedirect);
			} else {
				// A refusal (already submitted, flight ended…) says why; anything else stays generic.
				const refused = stage === 'tasting' && (apiError.statusCode ?? 500) < 500 ? apiError.message : null;
				showToast({
					title: stage === 'photo' ? t.photoUploadFailed : t.saveFailed,
					children: stage === 'photo' ? t.photoUploadFailedBody : refused || t.saveFailedBody,
					color: 'error',
				});
			}
		} finally {
			removeLoader(loader);
		}
	};

	useEffect(() => {
		if (!autoSave || isInitialLoading || !user || autoSaveTriggered.current) {
			return;
		}
		autoSaveTriggered.current = true;
		handleSave();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [autoSave, isInitialLoading, user]);

	return (
		<TastingPhaseLayout
			wineType={wineType}
			title={t.title}
			description={t.description}
			footer={{
				onBack: () => router.push(`/tastings/final-conclusion?wineType=${wineType}`),
				backLabel: grid === 'wset' ? t.backWset : t.backCms,
				nextLabel: t.next,
				onNext: handleSave,
				nextLoading: isLoading,
			}}
		>
			<div className="tasting-grid tasting-grid--2">
				{/* Notes */}
				<div className="tasting-card">
					<div className="tasting-card__label">{t.notes}</div>
					<textarea
						className="tasting-textarea"
						rows={6}
						placeholder={t.notesPlaceholder}
						value={notes}
						onChange={(e) => updateTastingData({ notes: e.target.value })}
					/>
				</div>

				{/* Photo */}
				<div className="tasting-card">
					<div className="tasting-card__label">{t.photo}</div>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						capture="environment"
						style={{ display: 'none' }}
						onChange={handlePhotoChange}
					/>
					{labelPhoto ? (
						<div className="save-photo-preview">
							{/* Local data URL — next/image has nothing to optimise here and would need
							    `unoptimized`, so a plain img is the right element. */}
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={labelPhoto.preview} alt={t.photoAlt} className="save-photo-preview__img" />
							<button
								className="btn-quiet btn-quiet--sm"
								onClick={() => {
									setLabelPhoto(null);
									clearPhotoInput();
								}}
							>
								<IconX size={14} />
								{t.removePhoto}
							</button>
						</div>
					) : (
						<button
							className="btn-quiet btn-quiet--block"
							onClick={() => fileInputRef.current?.click()}
							disabled={isLoading}
						>
							<IconCamera size={18} />
							{t.takePhoto}
						</button>
					)}
				</div>

				{/* Optional reveal: most tasters reveal later from the archive, so it starts collapsed
				    and is saved with the tasting by the footer's Save button. In a flight, the host reveals. */}
				{!tastingData.flight && (
					<div className="tasting-card save-reveal">
						<button
							type="button"
							className="save-reveal__toggle"
							aria-expanded={revealOpen}
							aria-controls="save-reveal-fields"
							onClick={() => setRevealOpen((open) => !open)}
						>
							<span className="save-reveal__text">
								<span className="tasting-card__head">
									<span className="tasting-card__label">{t.reveal}</span>
									<span className="tasting-aside">{text.optional}</span>
								</span>
								<span className="save-reveal__title">{t.revealTitle}</span>
								<span className="save-reveal__sub">{t.revealSub}</span>
							</span>
							<IconChevronDown
								size={16}
								aria-hidden="true"
								className={`save-reveal__chevron${revealOpen ? ' save-reveal__chevron--open' : ''}`}
							/>
						</button>
						{revealOpen && (
							<div id="save-reveal-fields" className="save-reveal__body">
								<RevealFields
									layout="wide"
									grid={grid}
									value={tastingData.reveal ?? {}}
									onChange={(patch) =>
										updateTastingData({ reveal: { ...tastingData.reveal, ...patch } })
									}
								/>
								<p className="save-reveal__note">{t.revealNote}</p>
							</div>
						)}
					</div>
				)}
			</div>
		</TastingPhaseLayout>
	);
}
