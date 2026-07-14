import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Camera, X, Volume2, MapPin, Pill, AlertTriangle, Clock, Sparkles, RefreshCw } from "lucide-react";

type Stage = "idle" | "capturing" | "analyzing" | "result";

const MOCK = {
  medicine: "Amoxicillin 500mg",
  brand: "Trimox",
  purpose: "Broad-spectrum antibiotic used to treat bacterial infections of the throat, ears, sinuses, and urinary tract.",
  dosage: "1 capsule, three times a day — every 8 hours",
  duration: "7 days",
  warnings: [
    "Do not skip doses — complete the full course even if you feel better.",
    "May cause mild nausea. Take with food if stomach upset occurs.",
    "Avoid if allergic to penicillin.",
  ],
  pharmacies: [
    { name: "Wellness Pharmacy", distance: "0.3 km", eta: "4 min walk", stock: "In stock" },
    { name: "MedPlus Health", distance: "0.6 km", eta: "8 min walk", stock: "In stock" },
    { name: "Apollo Corner Store", distance: "0.9 km", eta: "12 min walk", stock: "Low stock" },
  ],
};

export function ScanModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stage, setStage] = useState<Stage>("idle");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setStage("idle");
      setCameraError(null);
    }
  }, [open]);

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStage("capturing");
    } catch {
      setCameraError("Camera unavailable — running a demo scan instead.");
      setStage("capturing");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function capture() {
    setStage("analyzing");
    setTimeout(() => {
      stopCamera();
      setStage("result");
    }, 2400);
  }

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const text = `${MOCK.medicine}. ${MOCK.purpose}. Take ${MOCK.dosage} for ${MOCK.duration}. Warning: ${MOCK.warnings[0]}`;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.98;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function reset() {
    stopCamera();
    setStage("idle");
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-background/70 backdrop-blur-xl" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="glass-strong relative w-full max-w-3xl rounded-[2rem] p-6 md:p-8 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-teal-glow animate-pulse" />
                {stage === "idle" && "Ready to scan"}
                {stage === "capturing" && "Frame the prescription"}
                {stage === "analyzing" && "Analyzing prescription…"}
                {stage === "result" && "Scan complete"}
              </div>
              <button onClick={onClose} className="glass-pill grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {stage === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 text-center py-10">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-teal/15 text-teal-glow glow-teal">
                    <Camera className="h-8 w-8" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold">Point at your prescription</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    We'll open your rear camera. Hold steady — MediScan reads the handwriting for you.
                  </p>
                  <button
                    onClick={startCamera}
                    className="mt-8 glow-teal inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-teal-glow to-teal px-6 py-3 font-medium text-primary-foreground transition hover:scale-[1.03] active:scale-[0.98]"
                  >
                    <Camera className="h-4 w-4" /> Open camera
                  </button>
                </motion.div>
              )}

              {(stage === "capturing" || stage === "analyzing") && (
                <motion.div key="cap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-black border border-white/10">
                    <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
                    {cameraError && (
                      <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground bg-black/60">
                        {cameraError}
                      </div>
                    )}
                    {["top-4 left-4 border-t-2 border-l-2", "top-4 right-4 border-t-2 border-r-2", "bottom-4 left-4 border-b-2 border-l-2", "bottom-4 right-4 border-b-2 border-r-2"].map((c) => (
                      <span key={c} className={`absolute h-8 w-8 rounded-lg border-teal-glow ${c}`} />
                    ))}
                    {stage === "analyzing" && (
                      <>
                        <motion.div
                          initial={{ y: "0%" }}
                          animate={{ y: ["0%", "1000%"] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 top-0 h-24 bg-gradient-to-b from-teal-glow/0 via-teal-glow/50 to-teal-glow/0"
                        />
                        <div className="absolute inset-x-0 bottom-4 flex justify-center">
                          <div className="glass-pill rounded-full px-4 py-2 text-sm flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-teal-glow animate-pulse" />
                            OCR · Summarize · Translate
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button
                      onClick={reset}
                      className="glass-pill rounded-full px-5 py-2.5 text-sm hover:bg-white/10 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={capture}
                      disabled={stage === "analyzing"}
                      className="glow-teal rounded-full bg-gradient-to-b from-teal-glow to-teal px-6 py-2.5 font-medium text-primary-foreground disabled:opacity-60 transition hover:scale-[1.03] active:scale-[0.98]"
                    >
                      {stage === "analyzing" ? "Analyzing…" : "Capture"}
                    </button>
                  </div>
                </motion.div>
              )}

              {stage === "result" && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 space-y-4"
                >
                  <div className="glass rounded-2xl p-5 flex items-start gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal/15 text-teal-glow">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">Identified medicine</div>
                      <h3 className="mt-1 text-2xl font-semibold">{MOCK.medicine}</h3>
                      <p className="text-sm text-muted-foreground">Also sold as {MOCK.brand}</p>
                    </div>
                    <button onClick={speak} className="glass-pill rounded-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-white/10 transition">
                      <Volume2 className="h-4 w-4 text-teal-glow" /> Listen
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="glass rounded-2xl p-5">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">Purpose</div>
                      <p className="mt-2 text-sm leading-relaxed">{MOCK.purpose}</p>
                    </div>
                    <div className="glass rounded-2xl p-5">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> Dosage
                      </div>
                      <p className="mt-2 text-sm font-medium">{MOCK.dosage}</p>
                      <p className="text-xs text-muted-foreground mt-1">Course: {MOCK.duration}</p>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-200/80">
                      <AlertTriangle className="h-3.5 w-3.5" /> Warnings
                    </div>
                    <ul className="mt-3 space-y-2">
                      {MOCK.warnings.map((w) => (
                        <li key={w} className="text-sm text-muted-foreground flex gap-2">
                          <span className="mt-2 h-1 w-1 rounded-full bg-teal-glow shrink-0" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-teal-glow" /> Pharmacies within 1KM
                      </div>
                      <span className="text-[10px] text-muted-foreground">Cached · Redis</span>
                    </div>
                    <div className="mt-3 divide-y divide-white/5">
                      {MOCK.pharmacies.map((p) => (
                        <div key={p.name} className="flex items-center justify-between py-3">
                          <div>
                            <div className="text-sm font-medium">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.distance} · {p.eta}</div>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full glass-pill ${p.stock === "Low stock" ? "text-amber-200" : "text-teal-glow"}`}>
                            {p.stock}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button onClick={reset} className="glass-pill inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm hover:bg-white/10 transition">
                      <RefreshCw className="h-4 w-4" /> Scan another
                    </button>
                    <button onClick={onClose} className="glow-teal rounded-full bg-gradient-to-b from-teal-glow to-teal px-6 py-2.5 font-medium text-primary-foreground transition hover:scale-[1.03] active:scale-[0.98]">
                      Done
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
