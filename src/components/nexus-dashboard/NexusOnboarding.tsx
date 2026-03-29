"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, FileUp, Save, Sparkles, Zap } from "lucide-react";
import { useNexusStore } from "@/lib/nexus-store";
import confetti from "canvas-confetti";

export const NexusOnboarding = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const { agent, updateAgent, completeOnboarding } = useNexusStore();
  const [formData, setFormData] = useState({
    companyName: agent.companyName,
    agentName: agent.agentName,
    objective: agent.objective,
    context: agent.context,
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      updateAgent(formData);
      completeOnboarding();
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00FFD1", "#38bdf8", "#ffffff"],
      });
      onComplete();
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg rounded-[2rem] border border-border/60 bg-card/30 p-6 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-card/50">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-extrabold tracking-tight text-foreground">Setup Inicial</p>
            <p className="text-[11px] font-medium text-muted-foreground">Configuração em 3 passos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                n <= step ? "bg-primary" : "bg-border/60"
              }`}
            />
          ))}
          <div className="ml-2 rounded-full bg-card/40 px-2.5 py-1 text-[11px] font-black text-muted-foreground">
            {step}/3
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mt-8 space-y-6"
          >
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Identidade do seu Agente
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Como os seus leads devem identificar o seu novo SDR?
              </p>
            </div>

            <div className="space-y-4">
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Nome da Empresa
                </span>
                <input
                  type="text"
                  className="h-12 rounded-2xl border border-border/60 bg-card/20 px-4 text-sm text-foreground outline-none transition focus:border-primary/60"
                  placeholder="Ex: Legio Nexus"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Nome do Agente (SDR)
                </span>
                <input
                  type="text"
                  className="h-12 rounded-2xl border border-border/60 bg-card/20 px-4 text-sm text-foreground outline-none transition focus:border-primary/60"
                  placeholder="Ex: Julia"
                  value={formData.agentName}
                  onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                />
              </label>
            </div>

            <button
              onClick={handleNext}
              disabled={!formData.companyName || !formData.agentName}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:hover:brightness-100"
            >
              Próximo passo
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mt-8 space-y-6"
          >
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Contexto e Inteligência</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Forneça o material de vendas para o agente absorver.
              </p>
            </div>

            <div className="space-y-4">
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Objetivo Principal
                </span>
                <select
                  className="h-12 rounded-2xl border border-border/60 bg-card/20 px-4 text-sm text-foreground outline-none transition focus:border-primary/60"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                >
                  <option>Qualificar e agendar call</option>
                  <option>Vender direto no WhatsApp</option>
                  <option>Tirar dúvidas e suporte</option>
                  <option>Qualificar para High Ticket</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Contexto (Copie e cole aqui)
                </span>
                <textarea
                  className="min-h-[160px] resize-none rounded-2xl border border-border/60 bg-card/20 p-4 text-sm text-foreground outline-none transition focus:border-primary/60"
                  placeholder="Descreva seu produto, preços, objeções comuns e argumentos de venda..."
                  value={formData.context}
                  onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                />
              </label>

              <div className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Ou faça upload de um PDF
                </span>
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-border/60 bg-card/20 px-4 py-3 text-sm text-muted-foreground hover:bg-card/30">
                  <span className="truncate">Escolher material…</span>
                  <FileUp className="h-4 w-4 text-primary" />
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" />
                </label>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!formData.context}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:hover:brightness-100"
            >
              Processar contexto
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mt-8 space-y-6 text-center"
          >
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-border/60 bg-card/40">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Agente Pronto!</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                O contexto foi absorvido. {formData.agentName} agora sabe tudo sobre a {formData.companyName} e está pronta para vender.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-border/60 bg-card/20 p-5 text-left">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#10B981,#38BDF8)] text-sm font-extrabold text-[#060B14]">
                    {formData.agentName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold tracking-tight text-foreground">{formData.agentName}</div>
                    <div className="text-[10px] font-medium text-muted-foreground">SDR IA Ativo</div>
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card/30">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <span>Velocidade</span>
                  <span className="text-primary">3s avg</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <span>Contexto</span>
                  <span className="text-primary">100% OK</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <span>Disponibilidade</span>
                  <span className="text-primary">24/7</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground transition hover:brightness-110 active:scale-[0.99]"
            >
              Entrar no Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
