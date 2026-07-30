"use client";

import { useCallback, useRef, useState } from "react";

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface AsyncActionState<TResult> {
  status: AsyncStatus;
  data: TResult | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Wraps an async function with declarative `status` / `data` / `error` state so
 * screens can render loading and error UI without bespoke boilerplate. Ignores
 * stale results if the hook is re-run before a prior call resolves.
 */
export function useAsyncAction<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
) {
  const [state, setState] = useState<AsyncActionState<TResult>>({
    status: "idle",
    data: null,
    error: null,
    isLoading: false,
  });
  const callId = useRef(0);

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      const id = ++callId.current;
      setState((s) => ({ ...s, status: "loading", isLoading: true, error: null }));
      try {
        const data = await fn(...args);
        if (id === callId.current) {
          setState({ status: "success", data, error: null, isLoading: false });
        }
        return data;
      } catch (err) {
        if (id === callId.current) {
          const message =
            err instanceof Error ? err.message : "Something went wrong.";
          setState({ status: "error", data: null, error: message, isLoading: false });
        }
        return undefined;
      }
    },
    [fn],
  );

  const reset = useCallback(() => {
    callId.current++;
    setState({ status: "idle", data: null, error: null, isLoading: false });
  }, []);

  return { ...state, run, reset };
}
