import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Nav } from "@/components/mediscan/Nav";
import { Hero } from "@/components/mediscan/Hero";
import { Features } from "@/components/mediscan/Features";
import { Pipeline } from "@/components/mediscan/Pipeline";
import { Security } from "@/components/mediscan/Security";
import { Footer } from "@/components/mediscan/Footer";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const startScan = () => navigate({ to: user ? "/app" : "/auth" });
  return (
    <div className="relative overflow-hidden">
      <Nav />
      <Hero onScan={startScan} />
      <Features />
      <Pipeline />
      <Security />
      <Footer />
    </div>
  );
}
