import { useEffect, useState, useCallback } from "react";

type Apod = {
  id: number;
  date: string;
  title: string;
  explanation: string;
  media_type: "image" | "video";
  url: string;
  hdurl?: string;
};

export function useStrapiApod() {
  const apiUrl = import.meta.env.VITE_STRAPI_URL || "http://localhost:1337";
  const [apod, setApod] = useState<Apod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApod = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/apod`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setApod(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch APOD");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchApod();
  }, [fetchApod]);

  return { apod, loading, error, refresh: fetchApod };
}
