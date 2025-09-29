// src/hooks/useStrapiApod.ts
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

export interface Apod {
  title: string;
  date: string;
  explanation: string;
  url: string;
  hdurl?: string | null;
  media_type: "image" | "video";
  original_url?: string | null;
}

type ApodLiveResponse = Apod;
const LIVE_API = import.meta.env.VITE_LIVE_URL 
const REFRESH_API = import.meta.env.VITE_REFRESH_URL

export const useStrapiApod = () => {
  const [apod, setApod] = useState<Apod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // track latest request to cancel older ones
  const abortRef = useRef<AbortController | null>(null);

  const fetchLive = useCallback(
    async (opts?: { date?: string; persist?: boolean }) => {
      // cancel any in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      try {
        if (opts?.persist) {
          // optional, non-blocking: sync Strapi DB
          try {
            await axios.get(REFRESH_API);
          } catch {
            /* ignore */
          }
        }

        const res = await axios.get<ApodLiveResponse>(LIVE_API, {
          params: { _: Date.now(), ...(opts?.date ? { date: opts.date } : {}) },
          // no custom headers → no CORS preflight issue
          signal: controller.signal as any, // axios supports AbortController in modern versions
          withCredentials: false,
        });

        const a = res.data;
        setApod({
          title: a.title ?? "Untitled",
          date: a.date ?? "",
          explanation: a.explanation ?? "",
          url: a.url ?? "",
          hdurl: a.hdurl ?? null,
          media_type: a.media_type ?? "image",
          original_url: a.original_url ?? null,
        });
      } catch (e: any) {
        // ignore abort errors
        if (e?.name !== "CanceledError" && e?.message !== "canceled") {
          setError(e?.response?.data?.error?.message || e?.message || "Failed to fetch APOD");
        }
      } finally {
        // only unset loading if this request is still current
        if (abortRef.current === controller) {
          setLoading(false);
          abortRef.current = null;
        }
      }
    },
    []
  );

  useEffect(() => {
    fetchLive();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchLive]);

  // tiny helpers so onClick types are happy
  const refreshToday = useCallback(() => {
    void fetchLive();
  }, [fetchLive]);

  const refreshDate = useCallback(
    (date: string) => {
      if (!date) return;
      void fetchLive({ date });
    },
    [fetchLive]
  );

  return {
    apod,
    loading,
    error,
    refresh: fetchLive,      // advanced: pass { date, persist }
    refreshToday,            // simple onClick handler
    refreshDate,             // simple onClick handler with date
  };
};
