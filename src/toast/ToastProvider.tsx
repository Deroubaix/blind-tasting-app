"use client";

import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import Toast, { ToastProps } from "./Toast";
import { v4 as uuid } from "uuid";
import NotificationUtils from "../utils/NotificationsUtils";

export type OpenToast = Omit<ToastProps, "toastId"> &
  Partial<Pick<ToastProps, "toastId">>;

export type ToastProviderValue = {
  toasts: ToastProps[];
  showToast: (toast: OpenToast) => string;
  hideToast: (toastId: string) => void;
};

export const ToastProviderContext = createContext<ToastProviderValue | null>(
  null
);

export type ToastProviderProps = {
  children: ReactNode;
};

export default function ToastProvider(props: ToastProviderProps) {
  const { children } = props;

  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = (toast: OpenToast) => {
    const toastId = toast.toastId ?? uuid();
    setToasts((current) => [
      ...current,
      {
        ...toast,
        toastId,
      },
    ]);
    return toastId;
  };

  const hideToast = useCallback((toastId: string) => {
    setToasts((current) =>
      current.filter((toast) => toast.toastId !== toastId)
    );
  }, []);

  const value: ToastProviderValue = {
    toasts,
    showToast,
    hideToast,
  };

  NotificationUtils.setToastProvider(value);

  return (
    <ToastProviderContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="ToastProvider">
          {toasts.map((props) => {
            return <Toast key={props.toastId} {...props} onClose={hideToast} />;
          })}
        </div>
      )}
    </ToastProviderContext.Provider>
  );
}

export function useToastProvider() {
  const context = useContext(ToastProviderContext);

  if (!context) {
    throw new Error("useToastProvider must be used within an ToastProvider");
  }

  return context;
}
