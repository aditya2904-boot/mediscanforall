import { motion } from "motion/react";
import { Camera, Cpu, Sparkles } from "lucide-react";
import { GlassCard } from "./GlassCard";

const steps = [
  { icon: Camera, title: "Ingestion", body: "Camera stream captured via WebRTC — frames streamed straight to the edge.", meta: "01" },
  { icon: Cpu, title: "AI Orchestration", body: "FastAPI fans out to Google Vision OCR and GPT-4o for summarization & translation.", meta: "02" },
  { icon: Sparkles, title: "Response", body: "Structured, spoken result delivered to the client over signed, streaming endpoints.", meta: "03" },
];

export function Pipeline() {
  return (
    <section id="how" className="relative py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-teal-glow">Data pipeline</p>
            <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
              From shutter to summary in one breath.
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            A streaming architecture keeps the median round-trip under a second, even on low-bandwidth cellular.
          </p>
        </div>

        <div className="relative mt-14">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-14 hidden md:block h-px bg-gradient-to-r from-transparent via-teal/40 to-transparent" />
          <div className="grid md:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative"
              >
                <GlassCard className="p-6 h-full">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 border border-white/10">
                      <s.icon className="h-4 w-4 text-teal-glow" />
                    </div>
                    <span className="font-display text-3xl font-semibold text-white/20">{s.meta}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
