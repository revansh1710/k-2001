const API = import.meta.env.VITE_STRAPI_URL ?? "http://localhost:1337";

export async function saveToStrapi(note: {
  title?: string;
  message: string;
  kind: "info" | "success" | "warning" | "error";
  meta?: Record<string, unknown>;
  userId?: string | number | null;
}) {
  try {
    // If you use bearer token, attach here; else your custom auth header
    const token = localStorage.getItem("cosmoscope_jwt"); // or whatever you stored
    const res = await fetch(`${API}/api/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ data: note })
    });
    if (!res.ok) throw new Error("Failed to persist notification");
    return await res.json();
  } catch (e) {
    // Non-fatal; we still showed in-app/browser
    console.warn("Strapi notification save failed:", e);
    return null;
  }
}
