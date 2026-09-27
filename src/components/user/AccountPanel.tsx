'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconTrash } from '@tabler/icons-react';
import { useAuthProvider } from '../auth/AuthProvider';
import { useModalProvider } from '../modal/ModalProvider';
import { useToastProvider } from '../../toast/ToastProvider';
import ClientTastingService from '../../services/client/ClientTastingService';
import { JsonApiError } from '../../utils/ErrorUtils';

const service = new ClientTastingService();
const DELETE_ACCOUNT_MODAL = 'delete-account';

function deletionSummary(count: number | null) {
	if (count === 0) {
		return 'Your account';
	}
	const tastings = count === null ? 'all your tastings' : count === 1 ? 'your one tasting' : `all ${count} tastings`;
	return `Your account, ${tastings} and every label photo`;
}

export default function AccountPanel() {
	const { user, isInitialLoading, deleteAccount } = useAuthProvider();
	const { openModal, closeModal } = useModalProvider();
	const { showToast } = useToastProvider();
	const router = useRouter();
	const [tastingCount, setTastingCount] = useState<number | null>(null);
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);
	// Set once the account is gone, so signing out doesn't also send the page to log in.
	const deletedRef = useRef(false);

	useEffect(() => {
		if (isInitialLoading) {
			return;
		}
		if (!user) {
			if (!deletedRef.current) {
				router.push('/login?r=/account');
			}
			return;
		}
		service
			.getTastings()
			.then((tastings) => setTastingCount(tastings.length))
			.catch(() => setTastingCount(null));
	}, [user, isInitialLoading, router]);

	if (isInitialLoading || !user) {
		return <div className="archives-loading">Loading…</div>;
	}

	const remove = async (typed: string) => {
		closeModal(DELETE_ACCOUNT_MODAL);
		setDeleting(true);
		setError(null);
		try {
			deletedRef.current = true;
			await deleteAccount(typed);
			showToast({ title: 'Account deleted', children: 'Your account and everything in it are gone.' });
			router.replace('/');
		} catch (err) {
			deletedRef.current = false;
			setError(JsonApiError.create(err).message || 'The account could not be deleted. Please try again.');
			setDeleting(false);
		}
	};

	const confirm = () => {
		if (!password) {
			setError('Enter your password to confirm.');
			return;
		}
		const typed = password;
		openModal({
			modalId: DELETE_ACCOUNT_MODAL,
			title: 'Delete your account?',
			closeOnClickOutside: true,
			closeOnEsc: true,
			children: (
				<div className="confirm-dialog">
					<p className="confirm-dialog__lead">{deletionSummary(tastingCount)} will be deleted for good.</p>
					<p className="confirm-dialog__note">This cannot be undone.</p>
					<div className="confirm-dialog__actions">
						<button
							className="outline confirm-dialog__cancel"
							onClick={() => closeModal(DELETE_ACCOUNT_MODAL)}
						>
							Keep my account
						</button>
						<button className="btn-primary confirm-dialog__confirm" onClick={() => remove(typed)}>
							<IconTrash size={16} aria-hidden="true" />
							Delete everything
						</button>
					</div>
				</div>
			),
		});
	};

	const memberSince = user.created_at
		? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
		: null;

	return (
		<div className="account">
			<section className="account-card" aria-labelledby="account-details-heading">
				<h2 className="account-card__heading" id="account-details-heading">
					Your details
				</h2>
				<dl className="account-details">
					<dt>Name</dt>
					<dd>{user.displayName}</dd>
					<dt>Email</dt>
					<dd>{user.email}</dd>
					{memberSince && (
						<>
							<dt>Member since</dt>
							<dd>{memberSince}</dd>
						</>
					)}
					<dt>Tastings</dt>
					<dd>{tastingCount ?? '—'}</dd>
				</dl>
				<p className="account-card__note">
					What is stored and why is set out in the <Link href="/privacy">privacy notice</Link>.
				</p>
			</section>

			<section className="account-card account-card--danger" aria-labelledby="account-delete-heading">
				<h2 className="account-card__heading" id="account-delete-heading">
					Delete your account
				</h2>
				<p className="account-card__text">
					Deletes your account, every tasting and every label photo, straight away and for good. Enter your
					password to confirm.
				</p>
				<div className="account-delete">
					<label className="account-delete__label" htmlFor="account-delete-password">
						Password
					</label>
					<input
						id="account-delete-password"
						type="password"
						autoComplete="current-password"
						className="tasting-input account-delete__input"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						aria-describedby={error ? 'account-delete-error' : undefined}
					/>
					<button
						type="button"
						className="btn-primary account-delete__btn"
						onClick={confirm}
						disabled={deleting}
					>
						<IconTrash size={16} aria-hidden="true" />
						{deleting ? 'Deleting…' : 'Delete my account'}
					</button>
				</div>
				{error && (
					<p className="account-delete__error" id="account-delete-error" role="alert">
						{error}
					</p>
				)}
			</section>
		</div>
	);
}
