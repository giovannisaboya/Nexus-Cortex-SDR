"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Clock, MessageCircle, Sparkles, Users } from "lucide-react";
import { useNexusStore } from "@/lib/nexus-store";

export function DashboardHome() {
  const { conversations, agent } = useNexusStore();

  const metrics = [
    { label: "Leads totais", value: conversations.length, delta: "+10%", icon: Users },
    { label: "Conversas ativas", value: conversations.length, delta: "+2", icon: MessageCircle },
    { label: "Taxa de qualificação", value: "42%", delta: "+4pp", icon: Sparkles },
    { label: "SLA Médio", value: "3,1s", delta: "-0,4s", icon: Clock },
  ] as const;

  const badge = (status: string) => {
    if (status === "Quente") return "bg-primary/15 text-primary border-primary/30";
    if (status === "Morno") return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  };
  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-semibold text-muted-foreground">Dashboard</div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Visão geral</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="rounded-[20px] border border-border/60 bg-card/30 p-5 backdrop-blur"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold text-muted-foreground">{m.label}</div>
                <div className="mt-2 text-2xl font-extrabold tracking-tight">{m.value}</div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card/40">
                <m.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/30 px-3 py-1 text-xs font-semibold text-muted-foreground">
              <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
              {m.delta} vs ontem
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="rounded-[20px] border border-border/60 bg-card/30 backdrop-blur">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div>
                <div className="text-sm font-bold tracking-tight">Leads recentes</div>
                <div className="text-[11px] font-medium text-muted-foreground">Dados mockados • sem backend</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border/60">
                    <th className="px-5 py-3 font-semibold">Nome</th>
                    <th className="px-5 py-3 font-semibold">WhatsApp</th>
                    <th className="px-5 py-3 font-semibold">Score</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Última mensagem</th>
                    <th className="px-5 py-3 font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {conversations.slice(0, 5).map((l) => (
                    <tr key={l.id} className="border-b border-border/60 last:border-b-0">
                      <td className="px-5 py-4 font-semibold">{l.leadName}</td>
                      <td className="px-5 py-4 text-muted-foreground">{l.leadContact}</td>
                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="font-semibold">{l.score}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badge(l.status)}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground truncate max-w-[200px]">{l.lastMessage}</td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          className="rounded-full border border-border/60 bg-card/30 px-3 py-1 text-xs font-semibold text-foreground transition hover:bg-card/45"
                        >
                          Abrir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-[20px] border border-primary/20 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.1),transparent)] p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold tracking-tight text-primary">Nexus Cortex Intelligence</div>
                <div className="text-[11px] font-medium text-muted-foreground">Otimização via Agente {agent.agentName}</div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Com base no contexto da <span className="text-foreground font-semibold">{agent.companyName}</span>, o agente <span className="text-foreground font-semibold">{agent.agentName}</span> identificou que leads respondidos em menos de 5 segundos têm 84% mais chance de agendar call.
            </p>
            <div className="mt-6 rounded-[20px] border border-primary/20 bg-primary/5 px-4 py-3 text-xs font-semibold text-primary">
              Cortex Insight: Otimizando conversão em tempo real.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

