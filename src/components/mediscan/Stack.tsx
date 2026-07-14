import { motion } from "motion/react";
import { GlassCard } from "./GlassCard";
import { Database, Zap, HardDrive, Layout, Server, Brain } from "lucide-react";

const tech = [
  { icon: Layout, name: "Next.js + Tailwind", role: "Frontend", note: "PWA-ready, camera + geo APIs." },
  { icon: Server, name: "Python FastAPI", role: "Backend", note: "Async inference & OCR pipeline." },
  { icon: Brain, name: "Vision + GPT-4o", role: "AI Services", note: "OCR, summarize, translate." },
];

const storage = [
  { icon: Database, layer: "Relational", tech: "PostgreSQL", use: "Profiles, prescription history, drug metadata." },
  { icon: Zap, layer: "Cache", tech: "Redis", use: "Geo pharmacy results and live sessions." },
  { icon: HardDrive, layer: "Object", tech: "S3 / Supabase", use: "Encrypted prescription image storage." },
];

export function Stack() {
  return (
    <section id="stack" className="relative py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-teal-glow">Technical stack</p>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
            Modern rails. Medical-grade posture.
          </h2>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {tech.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <GlassCard className="p-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal/15 text-teal-glow"><t.icon className="h-4 w-4" /></div>
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{t.role}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{t.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{t.note}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="mt-16">
          <h3 className="text-xl font-semibold">Storage architecture</h3>
          <GlassCard className="mt-4 overflow-hidden">
            <div className="divide-y divide-white/5">
              {storage.map((row) => (
                <div key={row.layer} className="grid grid-cols-[auto_1fr_1fr_2fr] items-center gap-4 px-6 py-5 hover:bg-white/[0.04] transition-colors">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-teal-glow"><row.icon className="h-4 w-4" /></div>
                  <div className="text-sm font-medium">{row.layer}</div>
                  <div className="text-sm text-teal-glow font-mono">{row.tech}</div>
                  <div className="text-sm text-muted-foreground">{row.use}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
