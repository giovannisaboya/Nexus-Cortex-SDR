"use client";

import { useState } from "react";
import { NexusLanding } from "@/components/nexus-landing/NexusLanding";
import { NexusOnboarding } from "@/components/nexus-dashboard/NexusOnboarding";
import { DashboardHome } from "@/components/nexus-dashboard/DashboardHome";
import { DashboardShell } from "@/components/nexus-dashboard/DashboardShell";
import { useNexusStore } from "@/lib/nexus-store";
import { useEffect } from "react";

export default function Home() {
  const [view, setView] = useState<"landing" | "onboarding" | "dashboard">("landing");
  const { hasCompletedOnboarding } = useNexusStore();

  useEffect(() => {
    if (hasCompletedOnboarding) {
      setView("dashboard");
    }
  }, [hasCompletedOnboarding]);

  if (view === "landing") {
    return <NexusLanding onStart={() => setView("onboarding")} />;
  }

  if (view === "onboarding") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <NexusOnboarding onComplete={() => setView("dashboard")} />
      </div>
    );
  }

  return (
    <DashboardShell>
      <DashboardHome />
    </DashboardShell>
  );
}
