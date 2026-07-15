import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TimeStr = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM");

const ReminderInput = z.object({
  medication_name: z.string().min(1).max(120),
  dosage: z.string().max(200).nullish(),
  notes: z.string().max(500).nullish(),
  times: z.array(TimeStr).min(1).max(12),
  days_of_week: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  timezone: z.string().max(64).default("UTC"),
  enabled: z.boolean().default(true),
  start_date: z.string().nullish(),
  end_date: z.string().nullish(),
  scan_id: z.string().uuid().nullish(),
});

function clean<T extends Record<string, unknown>>(o: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined && v !== null) out[k] = v;
  return out as T;
}

export const listReminders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("reminders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ReminderInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("reminders")
      .insert(clean({ ...data, user_id: context.userId }) as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), patch: ReminderInput.partial() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("reminders")
      .update(clean(data.patch) as never)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("reminders").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
