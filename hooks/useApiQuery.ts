"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api-client";

export function useApiQuery<T>(
  url: string,
  initial: T,
  refreshMs?: number,
  enabled = true
) {
  const initialRef = useRef(initial);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!enabled) {
      if (mountedRef.current) {
        setError(null);
        setLoading(false);
      }
      return;
    }

    const requestId = ++requestIdRef.current;
    try {
      if (mountedRef.current) {
        setError(null);
      }
      const next = await apiFetch<T>(url, undefined, initialRef.current);
      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return;
      }
      setData(next);
    } catch (err) {
      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return;
      }
      setLoading(false);
    }
  }, [enabled, url]);

  useEffect(() => {
    if (!enabled) {
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    void refetch();
  }, [enabled, refetch]);

  useEffect(() => {
    initialRef.current = initial;
  }, [initial]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !refreshMs) return;
    const id = setInterval(() => void refetch(), refreshMs);
    return () => clearInterval(id);
  }, [enabled, refetch, refreshMs]);

  return { data, loading, error, refetch, setData };
}
