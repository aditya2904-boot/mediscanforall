import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell, BellOff, Plus, Trash2, Clock, X, Loader2, BellRing, Pill, Check } from "lucide-react";
import { toast } from "sonner";
import {
  listReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from "@/lib/reminders.functions";
import {
  useReminderNotifications,
  requestNotificationPermission,
} from "@/hooks/useReminderNotifications";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

function tz() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function formatDays(days: number[]) {
  if (days.length === 7) return "Every day";
  if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) return "Weekdays";
  if (days.length === 2 && days.includes(0) && days.includes(6)) return "Weekends";
  return days.map((d) => DAY_LABELS[d]).join(", ");
}

export function RemindersPanel({ defaultMedication }: { defaultMedication?: string }) {
  const qc = useQueryClient();
  const fetchList = useServerFn(listReminders);
  const create = useServerFn(createReminder);
  const update = useServerFn(updateReminder);
  const remove = useServerFn(deleteReminder);

  const { data: reminders, isLoading } = useQuery({
    queryKey: ["reminders"],
    queryFn: () => fetchList(),
  });

  useReminderNotifications(reminders as Reminder[] | undefined);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);

  const notifState = useMemo(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
    return Notification.permission;
  }, [formOpen]);

  const toggle = useMutation({
    mutationFn: (r: Reminder) => update({ data: { id: r.id, patch: { enabled: !r.enabled } } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Reminder removed");
    },
  });
  const save = useMutation({
    mutationFn: async (payload: Omit<Reminder, "id"> & { id?: string }) => {
      if (payload.id) {
        const { id, ...patch } = payload;
        return update({ data: { id, patch } });
      }
      return create({ data: { ...payload, timezone: tz() } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      setFormOpen(false);
      setEditing(null);
      toast.success("Reminder saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to save"),
  });

  async function askPermission() {
    const p = await requestNotificationPermission();
    if (p === "granted") toast.success("Notifications enabled");
    else if (p === "denied") toast.error("Notifications blocked in browser settings");
  }

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold font-display flex items-center gap-2">
            <BellRing className="h-5 w-5 text-teal-glow" /> Medication reminders
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule daily doses — we'll notify you and read them aloud.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notifState !== "granted" && notifState !== "unsupported" && (
            <button
              onClick={askPermission}
              className="glass-pill rounded-full px-4 py-2 text-xs flex items-center gap-2 hover:bg-white/10 transition"
            >
              <Bell className="h-3.5 w-3.5" /> Enable notifications
            </button>
          )}
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="glow-teal inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-teal-glow to-teal px-4 py-2 text-sm font-medium text-primary-foreground transition hover:scale-[1.03] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" /> New reminder
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mt-6 glass rounded-2xl p-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {!isLoading && (!reminders || reminders.length === 0) && (
        <div className="mt-6 glass rounded-2xl p-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal/15 text-teal-glow">
            <Bell className="h-6 w-6" />
          </div>
          <p className="mt-4 font-medium">No reminders yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first reminder to stay on schedule.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {(reminders as Reminder[] | undefined)?.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-2xl p-5 flex items-start gap-4 ${!r.enabled ? "opacity-60" : ""}`}
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal/15 text-teal-glow shrink-0">
              <Pill className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className="font-semibold truncate">{r.medication_name}</h3>
                {r.dosage && <span className="text-xs text-muted-foreground">· {r.dosage}</span>}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {r.times.slice().sort().map((t) => (
                  <span key={t} className="glass-pill rounded-full px-2.5 py-1 text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3 text-teal-glow" /> {t}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{formatDays(r.days_of_week)}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => toggle.mutate(r)}
                className="glass-pill grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 transition"
                aria-label={r.enabled ? "Pause" : "Enable"}
                title={r.enabled ? "Pause" : "Enable"}
              >
                {r.enabled ? <Bell className="h-4 w-4 text-teal-glow" /> : <BellOff className="h-4 w-4" />}
              </button>
              <button
                onClick={() => {
                  setEditing(r);
                  setFormOpen(true);
                }}
                className="glass-pill grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 transition text-xs"
                aria-label="Edit"
              >
                ✎
              </button>
              <button
                onClick={() => del.mutate(r.id)}
                disabled={del.isPending}
                className="glass-pill grid h-9 w-9 place-items-center rounded-full hover:bg-destructive/20 transition"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {formOpen && (
          <ReminderForm
            initial={editing ?? undefined}
            defaultMedication={defaultMedication}
            saving={save.isPending}
            onClose={() => {
              setFormOpen(false);
              setEditing(null);
            }}
            onSubmit={(v) => save.mutate({ ...v, id: editing?.id })}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function ReminderForm({
  initial,
  defaultMedication,
  saving,
  onClose,
  onSubmit,
}: {
  initial?: Partial<Reminder>;
  defaultMedication?: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (v: {
    medication_name: string;
    dosage: string | null;
    notes: string | null;
    times: string[];
    days_of_week: number[];
    enabled: boolean;
    start_date: string | null;
    end_date: string | null;
  }) => void;
}) {
  const [name, setName] = useState(initial?.medication_name ?? defaultMedication ?? "");
  const [dosage, setDosage] = useState(initial?.dosage ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [times, setTimes] = useState<string[]>(initial?.times ?? ["09:00"]);
  const [days, setDays] = useState<number[]>(initial?.days_of_week ?? [0, 1, 2, 3, 4, 5, 6]);
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);
  const [startDate, setStartDate] = useState(initial?.start_date ?? "");
  const [endDate, setEndDate] = useState(initial?.end_date ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Medication name required");
    if (times.length === 0) return toast.error("Add at least one time");
    if (days.length === 0) return toast.error("Pick at least one day");

    // request permission on first save
    requestNotificationPermission();

    onSubmit({
      medication_name: name.trim(),
      dosage: dosage.trim() || null,
      notes: notes.trim() || null,
      times: Array.from(new Set(times)).sort(),
      days_of_week: days.slice().sort(),
      enabled,
      start_date: startDate || null,
      end_date: endDate || null,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-background/70 backdrop-blur-xl" onClick={onClose} />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: "spring", damping: 26, stiffness: 260 }}
        className="glass-strong relative w-full max-w-lg rounded-[2rem] p-6 md:p-8 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold font-display">
            {initial?.id ? "Edit reminder" : "New reminder"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="glass-pill grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Medication</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amoxicillin"
              className="mt-2 w-full glass rounded-2xl px-4 py-3 text-sm bg-transparent outline-none focus:ring-2 focus:ring-teal-glow/40"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Dosage</label>
              <input
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="1 tablet"
                className="mt-2 w-full glass rounded-2xl px-4 py-3 text-sm bg-transparent outline-none focus:ring-2 focus:ring-teal-glow/40"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Notes</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="After meals"
                className="mt-2 w-full glass rounded-2xl px-4 py-3 text-sm bg-transparent outline-none focus:ring-2 focus:ring-teal-glow/40"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Times</label>
              <button
                type="button"
                onClick={() => setTimes([...times, "12:00"])}
                className="glass-pill rounded-full px-3 py-1 text-xs flex items-center gap-1 hover:bg-white/10 transition"
              >
                <Plus className="h-3 w-3" /> Add time
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {times.map((t, i) => (
                <div key={i} className="glass rounded-full pl-3 pr-1 py-1 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-teal-glow" />
                  <input
                    type="time"
                    value={t}
                    onChange={(e) => {
                      const next = [...times];
                      next[i] = e.target.value;
                      setTimes(next);
                    }}
                    className="bg-transparent text-sm outline-none w-[85px]"
                  />
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setTimes(times.filter((_, j) => j !== i))}
                      className="grid h-6 w-6 place-items-center rounded-full hover:bg-destructive/20"
                      aria-label="Remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Repeat</label>
            <div className="mt-2 flex gap-1.5">
              {DAYS.map((d, i) => {
                const active = days.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      setDays(active ? days.filter((x) => x !== i) : [...days, i])
                    }
                    className={`h-10 w-10 rounded-full text-sm font-medium transition ${
                      active
                        ? "bg-gradient-to-b from-teal-glow to-teal text-primary-foreground glow-teal"
                        : "glass hover:bg-white/10"
                    }`}
                    aria-label={DAY_LABELS[i]}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex gap-2 text-xs">
              <button type="button" onClick={() => setDays([0, 1, 2, 3, 4, 5, 6])} className="text-teal-glow hover:underline">
                Every day
              </button>
              <span className="text-muted-foreground">·</span>
              <button type="button" onClick={() => setDays([1, 2, 3, 4, 5])} className="text-teal-glow hover:underline">
                Weekdays
              </button>
              <span className="text-muted-foreground">·</span>
              <button type="button" onClick={() => setDays([0, 6])} className="text-teal-glow hover:underline">
                Weekends
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Start (optional)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2 w-full glass rounded-2xl px-4 py-3 text-sm bg-transparent outline-none focus:ring-2 focus:ring-teal-glow/40"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">End (optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2 w-full glass rounded-2xl px-4 py-3 text-sm bg-transparent outline-none focus:ring-2 focus:ring-teal-glow/40"
              />
            </div>
          </div>

          <label className="glass rounded-2xl p-4 flex items-center justify-between cursor-pointer">
            <span className="text-sm">Enabled</span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-5 w-5 accent-teal-glow"
            />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="glass-pill rounded-full px-5 py-2.5 text-sm hover:bg-white/10 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="glow-teal inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-teal-glow to-teal px-6 py-2.5 font-medium text-primary-foreground disabled:opacity-60 transition hover:scale-[1.03] active:scale-[0.98]"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {initial?.id ? "Save changes" : "Create reminder"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
