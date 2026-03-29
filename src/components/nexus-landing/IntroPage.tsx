"use client";

import { Bot } from "lucide-react";

export function IntroPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15),rgba(16,185,129,0)_65%)] blur-3xl" />
      </div>

      <div className="flex flex-col items-center gap-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-border/60 bg-card/50">
          <Bot className="h-7 w-7 text-primary" />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary/80">
            Nexus Cortex
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Seu SDR de IA,<br />
            <span className="text-muted-foreground font-medium">pronto em minutos.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            Configure o agente com o contexto da sua empresa e ele responde leads,
            qualifica e organiza o pipeline — 24 horas por dia, sem parar.
          </p>
        </div>

        <button
          onClick={onEnter}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.98]"
        >
          Conhecer a plataforma →
        </button>

        <p className="text-xs text-muted-foreground/60">
          Sem instalação. Sem contrato.
        </p>
      </div>

      <footer className="absolute bottom-6 flex items-center gap-2 text-xs text-muted-foreground/50">
        <span>Powered by</span>
        <span className="font-semibold text-muted-foreground">Legio Nexus</span>
      </footer>
    </div>
  );
}
