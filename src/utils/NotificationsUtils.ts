import FetchUtilsError from '../utils/FetchErrorUtils';
import { type ToastProviderValue } from '../toast/ToastProvider';
import { type ToastProps } from '../toast/Toast';
import { JsonApiError } from './ErrorUtils';
import { AbortType } from './AbortUtils';

export default class NotificationUtils {
	private static toastProvider: ToastProviderValue | null = null;

	public static setToastProvider(toastProvider: ToastProviderValue) {
		this.toastProvider = toastProvider;
	}

	public static showError(error: Error, title: string, duration?: number) {
		if (error === undefined) {
			return;
		}

		if (error instanceof FetchUtilsError) {
			if (error.type === AbortType.UNMOUNT) {
				return;
			}
		}

		console.error(error);

		let message = error.message;

		if (JsonApiError.isJsonApiError(error)) {
			message = `${error.error} - ${error.message}`;
		}

		this.showToast(title, message, 'error', duration);
	}

	public static showSuccess(message: string, title: string, duration?: number) {
		this.showToast(title, message, 'success', duration);
	}

	// The ToastProvider at the root of the layout registers itself on every render, so it is always
	// there by the time anything can call this. The old Mantine fallback could never run — no
	// MantineProvider or <Notifications /> was ever mounted for it to render into.
	private static showToast(title: string, message: string, color: ToastProps['color'], duration?: number) {
		this.toastProvider?.showToast({ color, title, children: message, autoCloseMs: duration });
	}
}
