import { motion } from "motion/react";
import { Camera, Sparkles, ShieldCheck } from "lucide-react";
import { GlassCard } from "./GlassCard";

export function Hero({ onScan }: { onScan: () => void }) {
  return (
    <section id="top" className="relative pt-40 pb-24 px-6">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-[1.15fr_1fr] gap-12 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-teal-glow animate-pulse" />
            Preventing 7,000+ prescription errors annually
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mt-6 text-5xl md:text-7xl font-semibold leading-[1.02] tracking-tight"
          >
            Scan the scribble.<br />
            <span className="text-gradient-teal">Hear the meaning.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed"
          >
            MediScan AI reads any handwritten prescription with your camera, then
            speaks the medicine name, dosage, warnings, and nearest pharmacy —
            in your language, in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <button
              onClick={onScan}
              className="glow-teal group inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-teal-glow to-teal px-6 py-3 font-medium text-primary-foreground transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <Camera className="h-4 w-4" />
              Try a live scan
              <span className="ml-1 opacity-70 transition-transform group-hover:translate-x-1">→</span>
            </button>
            <a
              href="#how"
              className="glass-pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-teal-glow" />
              See how it works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 flex items-center gap-6 text-xs text-muted-foreground"
          >
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal" />AES-256 encrypted</div>
            <div className="hidden sm:flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-muted-foreground" />JWT + RBAC</div>
            <div className="hidden sm:flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-muted-foreground" />HIPAA-aligned</div>
          </motion.div>
        </div>

        {/* Floating device mock */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="absolute -inset-8 bg-gradient-to-tr from-teal/30 via-lilac/20 to-transparent blur-3xl rounded-full" />
          <GlassCard strong className="relative p-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Live capture</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-teal-glow animate-pulse" />Analyzing</span>
            </div>
            <div className="relative mt-3 aspect-[4/5] overflow-hidden rounded-2xl bg-black/40 border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-teal/15 via-transparent to-lilac/15" />
              {/* Prescription lines */}
              <div className="absolute inset-8 space-y-3 opacity-90">
                <div className="h-3 w-2/3 rounded-full bg-white/70" />
                <div className="h-3 w-1/2 rounded-full bg-white/50" />
                <div className="h-3 w-3/4 rounded-full bg-white/60" />
                <div className="h-3 w-2/5 rounded-full bg-white/40" />
                <div className="h-3 w-3/5 rounded-full bg-white/55" />
              </div>
              {/* Scan line */}
              <motion.div
                initial={{ y: "0%" }}
                animate={{ y: ["0%", "380%", "0%"] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-0 right-0 top-0 h-16 bg-gradient-to-b from-teal-glow/0 via-teal-glow/40 to-teal-glow/0"
              />
              {/* Corner brackets */}
              {["top-3 left-3 border-t-2 border-l-2", "top-3 right-3 border-t-2 border-r-2", "bottom-3 left-3 border-b-2 border-l-2", "bottom-3 right-3 border-b-2 border-r-2"].map((c) => (
                <span key={c} className={`absolute h-6 w-6 rounded-md border-teal-glow ${c}`} />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]">
              {["Detecting text", "Cross-referencing", "Summarizing"].map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4 }}
                  className="glass rounded-lg px-2 py-1.5 text-center text-muted-foreground"
                >
                  {s}
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
