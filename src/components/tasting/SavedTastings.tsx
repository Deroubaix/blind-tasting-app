'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconCamera, IconChevronDown, IconX } from '@tabler/icons-react';
import RevealFields from '../archives/RevealFields';
import { isRevealed } from '../archives/revealScore';
import { type LabelPhoto, useTastingContext } from '../tasting/TastingContext';
import ClientTastingService from '../../services/client/ClientTastingService';
import ClientPhotoService from '../../services/client/ClientPhotoService';
import { prepareLabelPhoto } from '../../utils/PhotoUtils';
import { useAuthProvider } from '../auth/AuthProvider';
import { useToastProvider } from '../../toast/ToastProvider';
import useLoadTracker from '../../hooks/useLoadTracker';
import { JsonApiError } from '../../utils/ErrorUtils';
import TastingPhaseLayout from '../layout/TastingPhaseLayout';

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
				title: 'Photo not added',
				children: error instanceof Error ? error.message : 'This photo could not be opened.',
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
			title: 'Log in required',
			children: 'Please log in or sign up to save your tasting.',
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
					title: flightLate
						? `Wine ${flight.wineNumber} was already revealed`
						: `Wine ${flight.wineNumber} submitted`,
					children: flightLate
						? 'Saved to your archive with its score, but it is not part of the flight results.'
						: 'You will see the results once the host reveals it.',
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
				showToast({
					title: stage === 'photo' ? 'Photo upload failed' : 'Save failed',
					children:
						stage === 'photo'
							? 'The photo could not be uploaded. Try again, or remove the photo to save without it.'
							: 'Something went wrong. Please try again.',
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
			phase="Wrap Up"
			title="Review & Save"
			description="Add any final notes and a photo before saving your tasting record."
			footer={{
				onBack: () => router.push(`/tastings/final-conclusion?wineType=${wineType}`),
				backLabel: 'Back to Final Conclusion',
				nextLabel: 'Save Tasting',
				onNext: handleSave,
				nextLoading: isLoading,
			}}
		>
			<div className="save-layout">
				{/* Notes */}
				<div className="tasting-card">
					<div className="tasting-card__label">Notes</div>
					<textarea
						className="tasting-textarea"
						rows={6}
						placeholder="Add your final observations, impressions, or anything worth remembering..."
						value={notes}
						onChange={(e) => updateTastingData({ notes: e.target.value })}
					/>
				</div>

				{/* Photo */}
				<div className="tasting-card">
					<div className="tasting-card__label">Photo</div>
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
							<img src={labelPhoto.preview} alt="Your photo" className="save-photo-preview__img" />
							<button
								className="save-photo-remove"
								onClick={() => {
									setLabelPhoto(null);
									clearPhotoInput();
								}}
							>
								<IconX size={14} />
								Remove
							</button>
						</div>
					) : (
						<button
							className="save-photo-btn"
							onClick={() => fileInputRef.current?.click()}
							disabled={isLoading}
						>
							<IconCamera size={18} />
							Take / Choose Photo
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
								<span className="save-reveal__eyebrow">
									<span className="tasting-card__label">The reveal</span>
									<span className="save-reveal__optional">optional</span>
								</span>
								<span className="save-reveal__title">Know the wine already? Reveal it now</span>
								<span className="save-reveal__sub">
									Most students skip this and reveal the wine later, from the archive.
								</span>
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
									value={tastingData.reveal ?? {}}
									onChange={(patch) =>
										updateTastingData({ reveal: { ...tastingData.reveal, ...patch } })
									}
								/>
								<p className="save-reveal__note">
									Saved with the tasting. Your score appears in the archive straight away.
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</TastingPhaseLayout>
	);
}
