import { useEffect, useRef } from "react";
import { toast } from "sonner";

type Reminder = {
  id: string;
  medication_name: string;
  dosage: string | null;
  notes: string | null;
  times: string[];
  days_of_week: number[];
  enabled: boolean;
  start_date: string | null;
  end_date: string | null;
};

const FIRED_KEY = "mediscan.reminder.fired.v1";

function loadFired(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(FIRED_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveFired(map: Record<string, number>) {
  // keep last 300 entries to avoid unbounded growth
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 300);
  localStorage.setItem(FIRED_KEY, JSON.stringify(Object.fromEntries(entries)));
}

function fireNotification(r: Reminder) {
  const title = `💊 Time for ${r.medication_name}`;
  const body = [r.dosage, r.notes].filter(Boolean).join(" • ") || "Medication reminder";

  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, { body, tag: `mediscan-${r.id}`, icon: "/favicon.ico" });
    } catch {
      /* noop */
    }
  }
  toast(title, { description: body, duration: 15000 });

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      const u = new SpeechSynthesisUtterance(`Time to take ${r.medication_name}. ${r.dosage ?? ""}`);
      u.rate = 0.98;
      window.speechSynthesis.speak(u);
    } catch {
      /* noop */
    }
  }
}

export function useReminderNotifications(reminders: Reminder[] | undefined) {
  const ref = useRef(reminders);
  ref.current = reminders;

  useEffect(() => {
    if (typeof window === "undefined") return;

    function tick() {
      const list = ref.current;
      if (!list?.length) return;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const nowHM = `${hh}:${mm}`;
      const dow = now.getDay(); // 0..6
      const dateKey = now.toISOString().slice(0, 10);
      const fired = loadFired();
      let changed = false;

      for (const r of list) {
        if (!r.enabled) continue;
        if (!r.days_of_week?.includes(dow)) continue;
        if (r.start_date && dateKey < r.start_date) continue;
        if (r.end_date && dateKey > r.end_date) continue;
        if (!r.times?.includes(nowHM)) continue;

        const key = `${r.id}:${dateKey}:${nowHM}`;
        if (fired[key]) continue;
        fired[key] = Date.now();
        changed = true;
        fireNotification(r);
      }
      if (changed) saveFired(fired);
    }

    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  return await Notification.requestPermission();
}
