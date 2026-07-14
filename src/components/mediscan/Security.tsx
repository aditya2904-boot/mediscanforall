import { motion } from "motion/react";
import { Lock, KeyRound, ShieldCheck, FileKey2 } from "lucide-react";
import { GlassCard } from "./GlassCard";

const bullets = [
  { icon: KeyRound, title: "JWT (RS256)", body: "Stateless, signed sessions. No passwords on the wire." },
  { icon: ShieldCheck, title: "Role-based access", body: "Fine-grained RBAC across patient, clinician, and admin scopes." },
  { icon: FileKey2, title: "AES-256 at rest", body: "Images and PHI encrypted with envelope keys, rotated quarterly." },
  { icon: Lock, title: "TLS 1.3 in flight", body: "Modern ciphers only. HSTS-preloaded across every subdomain." },
];

export function Security() {
  return (
    <section id="security" className="relative py-24 px-6">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-teal-glow">Auth & privacy</p>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
            Health data is sacred. We treat it that way.
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            MediScan follows healthcare-grade data practices end-to-end — from signed tokens between
            client and edge, to hardware-backed key storage protecting every scanned image.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {bullets.map((b, i) => (
            <motion.div key={b.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <GlassCard className="p-5 h-full">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal/15 text-teal-glow"><b.icon className="h-4 w-4" /></div>
                <h3 className="mt-4 font-semibold">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.body}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
