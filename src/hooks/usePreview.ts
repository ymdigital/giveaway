"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/client-api";
import { HTTP_URL_PATTERN } from "@/lib/limits";
import type { Preview } from "@/lib/types";

const DEBOUNCE_MS = 500;

export type PreviewState =
  | { status: "idle" }
  | { status: "loading"; url: string }
  | { status: "ready"; url: string; data: Preview }
  | { status: "failed"; url: string; message: string };

export function usePreview(initial: PreviewState, onText: (text: string) => void) {
  const [state, setState] = useState<PreviewState>(initial);
  const latestUrl = useRef(initial.status === "idle" ? "" : initial.url);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onTextRef = useRef(onText);
  onTextRef.current = onText;

  const load = useCallback(async (raw: string) => {
    const url = raw.trim();
    if (!HTTP_URL_PATTERN.test(url)) {
      latestUrl.current = "";
      setState({ status: "idle" });
      return;
    }
    if (url === latestUrl.current) return;
    latestUrl.current = url;
    setState({ status: "loading", url });

    const data = await api.preview(url);
    if (url !== latestUrl.current) return;
    if (data?.ok) {
      setState({ status: "ready", url, data });
      if (data.text) onTextRef.current(data.text);
      return;
    }
    setState({
      status: "failed",
      url,
      message: data
        ? "ดึงรูปจากลิงก์นี้ไม่ได้ แต่ยังบันทึกได้ตามปกติค่ะ"
        : "ดึงรูปไม่สำเร็จ แต่ยังบันทึกได้ตามปกติค่ะ",
    });
  }, []);

  const schedule = useCallback(
    (raw: string) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => void load(raw), DEBOUNCE_MS);
    },
    [load],
  );

  const flush = useCallback(
    (raw: string) => {
      clearTimeout(timer.current);
      void load(raw);
    },
    [load],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { state, schedule, flush };
}
