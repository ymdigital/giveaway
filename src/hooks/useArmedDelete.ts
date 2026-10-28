"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const DISARM_MS = 3500;

/** First tap arms, second tap within 3.5s confirms. */
export function useArmedDelete(onConfirm: (id: string) => void) {
  const [armedId, setArmedId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const press = useCallback(
    (id: string) => {
      clearTimeout(timer.current);
      if (armedId !== id) {
        setArmedId(id);
        timer.current = setTimeout(() => setArmedId(null), DISARM_MS);
        return;
      }
      setArmedId(null);
      onConfirm(id);
    },
    [armedId, onConfirm],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { armedId, press };
}
