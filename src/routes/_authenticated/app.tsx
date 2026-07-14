import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { motion } from "motion/react";
import { ScanLine, Camera, LogOut, Pill, Trash2, Volume2, Clock, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { listScans, deleteScan } from "@/lib/scans.functions";
import { ScanModal } from "@/components/mediscan/ScanModal";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppPage,
});

function AppPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [scanOpen, setScanOpen] = useState(false);

  const fetchScans = useServerFn(listScans);
  const removeScan = useServerFn(deleteScan);

  const { data: scans, isLoading } = useQuery({
    queryKey: ["scans"],
    queryFn: () => fetchScans(),
  });

  const del = useMutation({
    mutationFn: (id: string) => removeScan({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scans"] });
      toast.success("Scan deleted");
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  function speak(s: NonNullable<typeof scans>[number]) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const text = `${s.medication_name}. ${s.purpose ?? ""}. ${s.dosage ?? ""}.`;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = s.language || "en";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "there";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.28_0.08_180/0.2),transparent_60%)] pointer-events-none" />

      <header className="relative sticky top-0 z-40 backdrop-blur-xl border-b border-white/5 bg-background/60">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-2 font-display font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-teal/20 text-teal-glow glow-teal">
              <ScanLine className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="tracking-tight">MediScan<span className="text-teal">.</span>AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-muted-foreground">Hi, {displayName}</span>
            <button
              onClick={signOut}
              className="glass-pill rounded-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/10 transition"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 py-10">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-strong rounded-[2rem] p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-teal/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 glass-pill rounded-full px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-teal-glow" /> Powered by AI vision
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight font-display">
              Ready to scan a prescription?
            </h1>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Point your camera at the prescription. We'll extract the medication, dosage, and warnings — spoken aloud in your language.
            </p>
            <button
              onClick={() => setScanOpen(true)}
              className="mt-8 glow-teal inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-teal-glow to-teal px-6 py-3 font-medium text-primary-foreground transition hover:scale-[1.03] active:scale-[0.98]"
            >
              <Camera className="h-4 w-4" /> Start a scan
            </button>
          </div>
        </motion.section>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold font-display">Your scan history</h2>
            <span className="text-xs text-muted-foreground">{scans?.length ?? 0} total</span>
          </div>

          {isLoading && (
            <div className="mt-6 glass rounded-2xl p-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          )}

          {!isLoading && (!scans || scans.length === 0) && (
            <div className="mt-6 glass rounded-2xl p-10 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal/15 text-teal-glow">
                <Pill className="h-6 w-6" />
              </div>
              <p className="mt-4 font-medium">No scans yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Your prescription history will appear here.</p>
            </div>
          )}

          <div className="mt-6 grid gap-3">
            {scans?.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 flex items-start gap-4"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal/15 text-teal-glow shrink-0">
                  <Pill className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="font-semibold truncate">{s.medication_name ?? "Unknown"}</h3>
                    <span className="text-xs text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  {s.dosage && (
                    <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> {s.dosage}
                    </p>
                  )}
                  {s.purpose && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{s.purpose}</p>}
                </div>
                <div className="flex flex-col sm:flex-row gap-1 shrink-0">
                  <button
                    onClick={() => speak(s)}
                    className="glass-pill grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 transition"
                    aria-label="Listen"
                  >
                    <Volume2 className="h-4 w-4 text-teal-glow" />
                  </button>
                  <button
                    onClick={() => del.mutate(s.id)}
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
        </section>
      </main>

      <ScanModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onSaved={() => qc.invalidateQueries({ queryKey: ["scans"] })}
      />
    </div>
  );
}
