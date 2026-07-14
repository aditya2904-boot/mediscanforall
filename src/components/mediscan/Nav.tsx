import { motion } from "motion/react";
import { ScanLine } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export function Nav() {
  const { user } = useAuth();
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-[min(1100px,calc(100%-1.5rem))]"
    >
      <div className="glass-pill flex items-center justify-between rounded-full px-3 py-2 pl-5">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-teal/20 text-teal-glow glow-teal">
            <ScanLine className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="tracking-tight">MediScan<span className="text-teal">.</span>AI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#security" className="hover:text-foreground transition-colors">Security</a>
        </nav>
        <Link
          to={user ? "/app" : "/auth"}
          className="glass-pill glow-teal rounded-full bg-teal/25 px-5 py-2 text-sm font-medium text-foreground transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          {user ? "Open app" : "Sign in"}
        </Link>
      </div>
    </motion.header>
  );
}
