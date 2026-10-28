"use client";
import type { ToastState } from "@/hooks/useToast";
import s from "./Toast.module.css";

interface ToastProps {
  toast: ToastState | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;
  const { action } = toast;
  return (
    <div key={toast.id} className={action ? `${s.toast} ${s.withAction}` : s.toast} role="status">
      {toast.icon === "check" && <span className={s.okDot} aria-hidden="true">✓</span>}
      {toast.icon === "bow" && <span aria-hidden="true">🎀</span>}
      {toast.icon === "copy" && <span aria-hidden="true">⧉</span>}
      <span>{toast.message}</span>
      {action && (
        <button
          type="button"
          className={s.action}
          onClick={() => {
            onDismiss();
            action.onClick();
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
