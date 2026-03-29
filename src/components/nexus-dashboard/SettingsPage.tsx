"use client";

import { Check, Settings, Trash2 } from "lucide-react";
import { useNexusStore } from "@/lib/nexus-store";

export function SettingsPage() {
  const { resetAll } = useNexusStore();

  const handleReset = () => {
    if (confirm("Tem certeza que deseja resetar todos os dados? Isso apagará suas configurações e conversas.")) {
      resetAll();
      window.location.href = "/";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-semibold text-muted-foreground">Configurações</div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Preferências</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="rounded-[20px] border border-border/60 bg-card/30 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold tracking-tight">Conta e Sistema</div>
                <div className="text-[11px] font-medium text-muted-foreground">Gerencie seus dados do Nexus</div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card/40">
                <Settings className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-[20px] border border-border/60 bg-card/20 p-4">
                <div className="text-xs font-semibold text-muted-foreground">Tema</div>
                <div className="mt-1 text-sm font-semibold">Dark mode nativo (Nexus Cortex Style)</div>
              </div>
              
              <div className="rounded-[20px] border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-destructive">Zona de Perigo</div>
                    <div className="mt-1 text-sm font-semibold text-foreground">Resetar Plataforma</div>
                    <div className="text-[10px] text-muted-foreground mt-1">Apaga configurações do agente e histórico.</div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-[20px] border border-border/60 bg-card/30 p-6 backdrop-blur">
            <div className="text-sm font-bold tracking-tight">Status</div>
            <div className="mt-1 text-[11px] font-medium text-muted-foreground">Checklist rápido</div>
            <div className="mt-5 space-y-3">
              {["Rotas separadas", "Layout logado", "Dados mockados", "Pronto para integrar backend"].map((t) => (
                <div key={t} className="flex items-center justify-between rounded-[20px] border border-border/60 bg-card/20 px-4 py-3">
                  <div className="text-sm font-semibold">{t}</div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-2xl border border-border/60 bg-card/30">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

