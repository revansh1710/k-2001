import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Notification, NotificationGroup } from "@progress/kendo-react-notification";

type Kind = "info" | "success" | "warning" | "error";

export type InAppNote = {
  id: string;
  kind: Kind;
  title?: string;
  message: string;
  meta?: Record<string, unknown>;
  ttlMs?: number; // auto-dismiss after X ms (default 4000)
};

type Ctx = {
  notify: (note: Omit<InAppNote, "id">) => void;
  clear: (id?: string) => void;
};

const NotificationCtx = createContext<Ctx | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<InAppNote[]>([]);

  const clear = useCallback((id?: string) => {
    if (!id) return setNotes([]);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((note: Omit<InAppNote, "id">) => {
    const id = crypto.randomUUID();
    const ttlMs = note.ttlMs ?? 4000;
    const full: InAppNote = { id, ttlMs, ...note };
    setNotes((prev) => [full, ...prev]);
    if (ttlMs > 0) {
      window.setTimeout(() => clear(id), ttlMs);
    }
  }, [clear]);

  const value = useMemo(() => ({ notify, clear }), [notify, clear]);

  return (
    <NotificationCtx.Provider value={value}>
      {/* top-right stack */}
      <NotificationGroup
        style={{
          right: 24,
          top: 24,
          alignItems: "flex-end",
          position: "fixed",
          zIndex: 60
        }}
      >
        {notes.map((n) => (
          <Notification
            key={n.id}
            type={{ style: n.kind, icon: true }}
            closable={true}
            onClose={() => clear(n.id)}
          >
            <div className="flex flex-col gap-0.5">
              {n.title && <div className="font-semibold">{n.title}</div>}
              <div className="text-sm opacity-90">{n.message}</div>
            </div>
          </Notification>
        ))}
      </NotificationGroup>
      {children}
    </NotificationCtx.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationCtx);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationProvider>");
  return ctx;
}
