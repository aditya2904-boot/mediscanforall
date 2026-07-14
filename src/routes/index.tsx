import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Nav } from "@/components/mediscan/Nav";
import { Hero } from "@/components/mediscan/Hero";
import { Features } from "@/components/mediscan/Features";
import { Pipeline } from "@/components/mediscan/Pipeline";
import { Stack } from "@/components/mediscan/Stack";
import { Security } from "@/components/mediscan/Security";
import { Footer } from "@/components/mediscan/Footer";
import { ScanModal } from "@/components/mediscan/ScanModal";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [scanOpen, setScanOpen] = useState(false);
  return (
    <div className="relative overflow-hidden">
      <Nav onScan={() => setScanOpen(true)} />
      <Hero onScan={() => setScanOpen(true)} />
      <Features />
      <Pipeline />
      <Stack />
      <Security />
      <Footer />
      <ScanModal open={scanOpen} onClose={() => setScanOpen(false)} />
    </div>
  );
}
