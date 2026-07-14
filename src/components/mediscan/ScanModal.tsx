import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Camera, X, Volume2, Pill, AlertTriangle, Clock, Sparkles, RefreshCw, Upload, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { analyzeScan } from "@/lib/scans.functions";

type Stage = "idle" | "capturing" | "analyzing" | "result" | "error";

type ScanResult = {
  id: string;
  medication_name: string | null;
  dosage: string | null;
  purpose: string | null;
  warnings: string | null;
  extracted_text: string | null;
  language: string;
};

const LANGS = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "hi", label: "हिन्दी" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
  { code: "zh", label: "中文" },
];

export function ScanModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [language, setLanguage] = useState("en");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const analyze = useServerFn(analyzeScan);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setStage("idle");
      setResult(null);
      setErrorMsg(null);
      setCameraError(null);
    }
  }, [open]);

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStage("capturing");
    } catch {
      setCameraError("Camera unavailable. Try uploading a photo instead.");
      setStage("capturing");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function processImage(base64: string, mimeType: string) {
    setStage("analyzing");
    setErrorMsg(null);
    try {
      const res = await analyze({ data: { imageBase64: base64, mimeType, language } });
      setResult(res as ScanResult);
      setStage("result");
      onSaved?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to analyze";
      setErrorMsg(msg);
      setStage("error");
      toast.error(msg);
    } finally {
      stopCamera();
    }
  }

  async function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      toast.error("Camera not ready");
      return;
    }
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const base64 = dataUrl.split(",")[1];
    await processImage(base64, "image/jpeg");
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const [, b64] = dataUrl.split(",");
      processImage(b64, file.type || "image/jpeg");
    };
    reader.readAsDataURL(file);
  }

  function speak() {
    if (!result || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const text = `${result.medication_name}. ${result.purpose ?? ""}. ${result.dosage ?? ""}. ${result.warnings ?? ""}`;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.98;
    u.lang = result.language || "en";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function reset() {
    stopCamera();
    setResult(null);
    setErrorMsg(null);
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
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-teal-glow animate-pulse" />
                {stage === "idle" && "Ready to scan"}
                {stage === "capturing" && "Frame the prescription"}
                {stage === "analyzing" && "Analyzing…"}
                {stage === "result" && "Scan complete"}
                {stage === "error" && "Couldn't analyze"}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="glass-pill rounded-full px-3 py-1.5 text-xs bg-transparent outline-none border-0"
                >
                  {LANGS.map((l) => (
                    <option key={l.code} value={l.code} className="bg-popover">{l.label}</option>
                  ))}
                </select>
                <button onClick={onClose} className="glass-pill grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 transition">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {stage === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 text-center py-8">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-teal/15 text-teal-glow glow-teal">
                    <Camera className="h-8 w-8" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold">Point at your prescription</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    We'll open your camera. Hold steady — MediScan reads the handwriting for you.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={startCamera}
                      className="glow-teal inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-teal-glow to-teal px-6 py-3 font-medium text-primary-foreground transition hover:scale-[1.03] active:scale-[0.98]"
                    >
                      <Camera className="h-4 w-4" /> Open camera
                    </button>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="glass-pill inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium hover:bg-white/10 transition"
                    >
                      <Upload className="h-4 w-4" /> Upload photo
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  </div>
                </motion.div>
              )}

              {(stage === "capturing" || stage === "analyzing") && (
                <motion.div key="cap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-black border border-white/10">
                    <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    {cameraError && (
                      <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground bg-black/60 p-6 text-center">
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
                            Reading prescription…
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
                    {!cameraError ? (
                      <button
                        onClick={capture}
                        disabled={stage === "analyzing"}
                        className="glow-teal rounded-full bg-gradient-to-b from-teal-glow to-teal px-6 py-2.5 font-medium text-primary-foreground disabled:opacity-60 transition hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2"
                      >
                        {stage === "analyzing" ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : "Capture"}
                      </button>
                    ) : (
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="glow-teal rounded-full bg-gradient-to-b from-teal-glow to-teal px-6 py-2.5 font-medium text-primary-foreground transition flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" /> Upload photo
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {stage === "result" && result && (
                <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 space-y-4">
                  <div className="glass rounded-2xl p-5 flex items-start gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal/15 text-teal-glow shrink-0">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">Identified medication</div>
                      <h3 className="mt-1 text-2xl font-semibold truncate">{result.medication_name ?? "Unknown"}</h3>
                    </div>
                    <button onClick={speak} className="glass-pill rounded-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-white/10 transition shrink-0">
                      <Volume2 className="h-4 w-4 text-teal-glow" /> Listen
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="glass rounded-2xl p-5">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">Purpose</div>
                      <p className="mt-2 text-sm leading-relaxed">{result.purpose ?? "—"}</p>
                    </div>
                    <div className="glass rounded-2xl p-5">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> Dosage
                      </div>
                      <p className="mt-2 text-sm font-medium">{result.dosage ?? "—"}</p>
                    </div>
                  </div>

                  {result.warnings && (
                    <div className="glass rounded-2xl p-5">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-200/80">
                        <AlertTriangle className="h-3.5 w-3.5" /> Warnings
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{result.warnings}</p>
                    </div>
                  )}

                  {result.extracted_text && (
                    <details className="glass rounded-2xl p-5">
                      <summary className="text-xs uppercase tracking-widest text-muted-foreground cursor-pointer">Raw extracted text</summary>
                      <p className="mt-3 text-xs text-muted-foreground whitespace-pre-wrap font-mono">{result.extracted_text}</p>
                    </details>
                  )}

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

              {stage === "error" && (
                <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center py-8">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-destructive/15 text-destructive">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">Analysis failed</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{errorMsg}</p>
                  <button onClick={reset} className="mt-6 glass-pill rounded-full px-5 py-2.5 text-sm hover:bg-white/10 transition">Try again</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
