import { motion } from "motion/react";
import { Camera, Languages, MapPin } from "lucide-react";
import { GlassCard } from "./GlassCard";

const items = [
  {
    icon: Camera,
    title: "No-Type Input",
    text: "Zero-friction camera capture — no typing, no fumbling. Designed for elderly hands and shaky moments.",
    tag: "WebRTC",
  },
  {
    icon: Languages,
    title: "Smart Audio",
    text: "Multilingual summaries read aloud with clear contraindication and side-effect alerts.",
    tag: "TTS",
  },
  {
    icon: MapPin,
    title: "1KM Proximity",
    text: "Instantly finds pharmacies within a 1KM radius, cached for a snappy, offline-friendly experience.",
    tag: "Geo",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-teal-glow">The solution</p>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
            Three moves. One calm experience.
          </h2>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassCard className="p-7 h-full flex flex-col group hover:bg-white/[0.08] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal/15 text-teal-glow group-hover:glow-teal transition-shadow">
                    <it.icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <span className="glass-pill rounded-full px-2.5 py-1 text-[10px] tracking-wider text-muted-foreground">
                    {it.tag}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold">{it.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{it.text}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
