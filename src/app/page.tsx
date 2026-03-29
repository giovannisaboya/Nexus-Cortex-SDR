"use client";

import { useState, useEffect } from "react";
import { IntroPage } from "@/components/nexus-landing/IntroPage";
import { NexusLanding } from "@/components/nexus-landing/NexusLanding";
import { NexusOnboarding } from "@/components/nexus-dashboard/NexusOnboarding";
import { DashboardHome } from "@/components/nexus-dashboard/DashboardHome";
import { DashboardShell } from "@/components/nexus-dashboard/DashboardShell";
import { useNexusStore } from "@/lib/nexus-store";

export default function Home() {
  const [view, setView] = useState<"intro" | "landing" | "onboarding" | "dashboard">("intro");
  const { hasCompletedOnboarding } = useNexusStore();

  useEffect(() => {
    if (hasCompletedOnboarding) {
      setView("dashboard");
    }
  }, [hasCompletedOnboarding]);

  if (view === "intro") {
    return <IntroPage onEnter={() => setView("landing")} />;
  }

  if (view === "landing") {
    return <NexusLanding onStart={() => setView("onboarding")} />;
  }

  if (view === "onboarding") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex flex-1 items-center justify-center p-4">
          <NexusOnboarding onComplete={() => setView("dashboard")} />
        </div>
        <footer className="py-3 text-center">
          <span className="text-[11px] text-muted-foreground/40">
            powered by TRAE with Gemini
          </span>
        </footer>
      </div>
    );
  }

  return (
    <DashboardShell>
      <DashboardHome />
    </DashboardShell>
  );
}
