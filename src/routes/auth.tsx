import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ScanLine, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) navigate({ to: "/app" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/app",
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created — you're in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.28_0.08_180/0.25),transparent_60%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-teal/10 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-strong w-full max-w-md rounded-[2rem] p-8"
        >
          <Link to="/" className="flex items-center gap-2 font-display font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-teal/20 text-teal-glow glow-teal">
              <ScanLine className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="tracking-tight">MediScan<span className="text-teal">.</span>AI</span>
          </Link>

          <h1 className="mt-8 text-3xl font-semibold tracking-tight font-display">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to scan and access your history."
              : "Start reading prescriptions in seconds."}
          </p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="mt-6 w-full glass-pill rounded-full py-3 text-sm font-medium flex items-center justify-center gap-3 hover:bg-white/10 transition disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
            Continue with Google
          </button>

          <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-white/10" /> or <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleEmail} className="mt-6 space-y-3">
            {mode === "signup" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-teal/60 focus:bg-white/10 transition"
              />
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl bg-white/5 border border-white/10 pl-11 pr-4 py-3 text-sm outline-none focus:border-teal/60 focus:bg-white/10 transition"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 chars)"
                className="w-full rounded-2xl bg-white/5 border border-white/10 pl-11 pr-4 py-3 text-sm outline-none focus:border-teal/60 focus:bg-white/10 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full glow-teal rounded-full bg-gradient-to-b from-teal-glow to-teal py-3 font-medium text-primary-foreground transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to MediScan? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-teal-glow hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
