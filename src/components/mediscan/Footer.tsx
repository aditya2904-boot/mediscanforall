import { ScanLine } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative px-6 py-14">
      <div className="mx-auto max-w-6xl glass rounded-3xl p-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-display font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-teal/20 text-teal-glow">
            <ScanLine className="h-4 w-4" />
          </span>
          MediScan<span className="text-teal">.</span>AI
        </div>
        <p className="text-sm text-muted-foreground">
          tech-support@mediscan.ai · www.mediscan.ai/docs
        </p>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} MediScan AI</p>
      </div>
    </footer>
  );
}
