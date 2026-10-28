"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const TOAST_MS = 2400;
const TOAST_WITH_ACTION_MS = 5000;

export type ToastIcon = "check" | "bow" | "copy";
export type ToastAction = { label: string; onClick: () => void };
export type ToastOptions = { icon?: ToastIcon; action?: ToastAction };
export type ToastState = ToastOptions & { id: number; message: string };
export type ShowToast = (message: string, options?: ToastOptions) => void;

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const dismiss = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback<ShowToast>((message, options = {}) => {
    clearTimeout(timer.current);
    setToast({ ...options, id: Date.now(), message });
    timer.current = setTimeout(
      () => setToast(null),
      options.action ? TOAST_WITH_ACTION_MS : TOAST_MS,
    );
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { toast, show, dismiss };
}
