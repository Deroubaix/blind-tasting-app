import { IconX } from "@tabler/icons-react";
import React, {
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { ThemeColorName } from "../styles/Colors";

export type ToastProps = {
  className?: string;
  title?: ReactNode;
  children?: ReactNode;
  onClose?: (toastId: string) => void;
  toastId: string;
  autoCloseMs?: number;
  color?: ThemeColorName;
};

export default function Toast(props: ToastProps) {
  const { className, title, children, onClose, toastId, autoCloseMs } = props;
  const color = props.color ?? "primary";

  const ref = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const autoCloseTimeout = useRef<NodeJS.Timeout | number | null>(null);

  const closeToast = useCallback(() => {
    if (autoCloseTimeout.current) {
      clearTimeout(autoCloseTimeout.current);
      autoCloseTimeout.current = null;
    }
    if (ref.current) {
      ref.current.classList.add("closing");
      setTimeout(() => {
        onClose?.(toastId);
      }, 60);
    } else {
      onClose?.(toastId);
    }
  }, [onClose, toastId]);

  useEffect(() => {
    if (autoCloseMs && !autoCloseTimeout.current) {
      if (progressRef.current) {
        progressRef.current.style.transitionDuration = `${autoCloseMs}ms`;
      }
      setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.classList.add("progressing");
        }
      }, 10);
      autoCloseTimeout.current = setTimeout(() => {
        closeToast();
      }, autoCloseMs);
    }
    return () => {
      if (autoCloseTimeout.current) {
        clearTimeout(autoCloseTimeout.current);
        autoCloseTimeout.current = null;
      }
    };
  }, [autoCloseMs, closeToast, toastId]);

  const handleCloseButtonClicked: MouseEventHandler<SVGSVGElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeToast();
  };

  return (
    <div ref={ref} id={toastId} className={`Toast ${color} ${className ?? ""}`}>
      {title && <h4 className="title">{title}</h4>}
      {children && <div className="body">{children}</div>}
      <IconX className="close" onClick={handleCloseButtonClicked} />
      {autoCloseMs ? <div ref={progressRef} className="autoclose" /> : null}
    </div>
  );
}
