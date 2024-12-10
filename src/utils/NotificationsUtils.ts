import FetchUtilsError from "../utils/FectchErrorUtils";
import { ToastProviderValue } from "../toast/ToastProvider";
import { ToastProps } from "../toast/Toast";
import { notifications } from "@mantine/notifications";
import { JsonApiError } from "./ErrorUtils";
import type { MantineColor } from "@mantine/core";
import { AbortType } from "./AbortUtils";

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

    this.showToast(title, message, "error", duration);
  }

  public static showSuccess(message: string, title: string, duration?: number) {
    this.showToast(title, message, "success", duration);
  }

  private static showToast(
    title: string,
    message: string,
    color: ToastProps["color"],
    duration?: number
  ) {
    if (this.toastProvider) {
      this.toastProvider.showToast({
        color,
        title,
        children: message,
        autoCloseMs: duration ?? 8000,
      });
    } else {
      // Fallback to Mantine (for backwards compatibility)
      notifications.show({
        title,
        message,
        color: mantineColorMap[color ?? "success"],
        autoClose: duration ?? 8000,
      });
    }
  }
}

const mantineColorMap: Record<
  NonNullable<ToastProps["color"]>,
  MantineColor
> = {
  primary: "green",
  secondary: "green",
  error: "red",
  warning: "red",
  success: "green",
  "accent-1": "green",
  "accent-2": "green",
  "brand-1": "green",
  "brand-2": "green",
};
