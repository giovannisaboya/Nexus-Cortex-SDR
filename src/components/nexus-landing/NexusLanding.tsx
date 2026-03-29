"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  Bot,
  Clock,
  FileText,
  Home,
  LayoutList,
  ListChecks,
  MessageCircle,
  MessageSquareWarning,
  Shuffle,
  Smile,
  Users2,
  Zap,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs font-semibold tracking-wide text-muted-foreground backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {children}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="nexus-typing-dot" style={{ animationDelay: "0ms" }} />
      <span className="nexus-typing-dot" style={{ animationDelay: "150ms" }} />
      <span className="nexus-typing-dot" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

export function NexusLanding({ onStart }: { onStart: () => void }) {
  const problemCards = [
    {
      icon: Clock,
      title: "Resposta lenta demais",
      description: "Leads esfriam em horas. Quem responde tarde perde a conversa.",
    },
    {
      icon: Users2,
      title: "SDR que não escala",
      description: "Um humano, uma conversa por vez. O volume sempre vence.",
    },
    {
      icon: BadgeDollarSign,
      title: "Custo alto por lead qualificado",
      description: "CAC sobe, time estressa e o pipeline continua inconsistente.",
    },
    {
      icon: MessageSquareWarning,
      title: "Produto mal apresentado",
      description: "Roteiro genérico não vende. Contexto específico cria confiança.",
    },
  ] as const;

  const steps = [
    {
      n: "01",
      title: "Configure o contexto",
      description: "Cole texto ou envie PDF com produto, ICP e argumentos de venda.",
    },
    {
      n: "02",
      title: "O agente vira especialista",
      description: "Sem treinamento manual: ele absorve o material e fala como time interno.",
    },
    {
      n: "03",
      title: "Leads qualificados pra você",
      description: "Conversa, score e próxima ação organizados num pipeline limpo.",
    },
  ] as const;

  const features = [
    {
      icon: FileText,
      title: "Absorve qualquer material",
      description: "PDF, texto ou doc. Você manda, ela aprende.",
    },
    {
      icon: ListChecks,
      title: "Qualificação estruturada",
      description: "Coleta dados certos, no timing certo, sem interrogatório.",
    },
    {
      icon: Shuffle,
      title: "Adapta a qualquer nicho",
      description: "Troca o contexto, troca o discurso. O produto manda.",
    },
    {
      icon: Smile,
      title: "Parece uma pessoa real",
      description: "Tom natural, contrações e emojis só quando faz sentido.",
    },
    {
      icon: Zap,
      title: "Resposta em segundos",
      description: "Velocidade de máquina com linguagem humana — 24/7.",
    },
    {
      icon: LayoutList,
      title: "Pipeline sempre organizado",
      description: "Score, histórico e próxima ação claros em cada conversa.",
    },
  ] as const;

  const chat = [
    {
      side: "agent",
      text: "Oi, Carlos! Eu sou a Julia 😊 Vi que você pediu mais detalhes. Posso te fazer 2 perguntas rápidas pra te indicar o melhor setup?",
    },
    { side: "lead", text: "Pode sim. Tô com muita lead chegando e ninguém responde a tempo." },
    {
      side: "agent",
      text: "Entendi: volume alto e SLA estourando. Hoje você quer qualificar pra agendar call, vender direto no WhatsApp, ou os dois?",
    },
    { side: "lead", text: "Agendar call. E não quero roteiro genérico." },
    {
      side: "agent",
      text: "Fechado. Você me manda o contexto do seu produto (pode ser PDF) e eu configuro a Julia pra responder como especialista da sua equipe. Quer que eu te mostre um exemplo com o seu material?",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-card/30 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-card/50">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight">
                NEXUS CORTEX <span className="font-medium text-muted-foreground">SDR</span>
              </div>
              <div className="text-[11px] font-medium text-muted-foreground">Agente SDR IA • Context-driven</div>
            </div>
          </div>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.99]"
          >
            Acessar plataforma
          </button>
        </div>
      </header>

      <section className="nexus-scanlines relative overflow-hidden pt-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.22),rgba(16,185,129,0)_60%)] blur-2xl" />
          <div className="absolute right-[-180px] top-[40px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12),rgba(16,185,129,0)_65%)] blur-2xl" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16">
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item} className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs font-semibold text-muted-foreground backdrop-blur">
                <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                  <span className="absolute h-2.5 w-2.5 rounded-full bg-primary/30 nexus-dot-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                Agente IA ativo agora
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs font-semibold text-muted-foreground backdrop-blur">
                <Home className="h-3.5 w-3.5 text-primary" />
                Publico • Sempre dark
              </div>
            </motion.div>

            <motion.h1
              variants={item}
              className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Coloque um SDR inteligente trabalhando pelo seu negócio 24 horas por dia
            </motion.h1>

            <motion.p variants={item} className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Configure uma vez. Forneça o contexto da sua empresa. O agente absorve tudo e vende como um especialista da sua equipe.
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={onStart}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.99]"
              >
                Entrar na plataforma →
              </button>
              <Link
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-card/30 px-7 py-3.5 text-base font-semibold text-foreground backdrop-blur transition hover:bg-card/45 active:scale-[0.99]"
              >
                Ver como funciona
              </Link>
            </motion.div>

            <motion.div variants={container} className="mt-10 grid gap-3 sm:grid-cols-3" initial="hidden" animate="show">
              {[
                { label: "24/7", value: "Disponibilidade", icon: Clock },
                { label: "3s", value: "Tempo de resposta", icon: Zap },
                { label: "100%", value: "Adaptado ao seu produto", icon: MessageCircle },
              ].map((p) => (
                <motion.div
                  key={p.label}
                  variants={item}
                  className="flex items-center justify-between rounded-[20px] border border-border/60 bg-card/30 px-4 py-3 backdrop-blur"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-card/40">
                      <p.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="leading-tight">
                      <div className="text-lg font-bold tracking-tight">{p.label}</div>
                      <div className="text-xs font-medium text-muted-foreground">{p.value}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/10 py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <SectionLabel>O problema real</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Leads chegando. Ninguém respondendo a tempo.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Não é falta de lead. É falta de velocidade, consistência e contexto na primeira resposta.
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-10 grid gap-4 sm:grid-cols-2"
          >
            {problemCards.map((c) => (
              <motion.div
                key={c.title}
                variants={item}
                className="rounded-[20px] border border-border/60 bg-card/30 p-6 backdrop-blur"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-card/40">
                    <c.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">{c.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="como-funciona" className="py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <SectionLabel>Como funciona</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Três passos para ter um SDR especialista no seu produto
            </h2>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-10 grid gap-4 lg:grid-cols-3"
          >
            {steps.map((s) => (
              <motion.div
                key={s.n}
                variants={item}
                className="relative overflow-hidden rounded-[20px] border border-border/60 bg-card/30 p-6 backdrop-blur"
              >
                <div className="pointer-events-none absolute right-5 top-4 select-none text-6xl font-extrabold tracking-tighter text-foreground/10">
                  {s.n}
                </div>
                <h3 className="text-lg font-bold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/10 py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <SectionLabel>Veja em ação</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Uma conversa real. Um agente que parece humano.
            </h2>
          </div>

          <motion.div
            variants={item}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-10 overflow-hidden rounded-[20px] border border-border/60 bg-card/30 backdrop-blur"
          >
            <div className="flex items-center justify-between border-b border-border/60 bg-card/30 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#10B981,#38BDF8)] text-sm font-extrabold text-[#060B14]">
                  J
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-bold tracking-tight">Julia</div>
                  <div className="text-[11px] font-medium text-muted-foreground">Online agora</div>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                WhatsApp-like
              </div>
            </div>

            <div className="space-y-3 px-5 py-5">
              {chat.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`flex ${m.side === "lead" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[86%] rounded-[20px] border px-4 py-3 text-sm leading-relaxed sm:max-w-[72%] ${
                      m.side === "lead"
                        ? "border-border/60 bg-secondary/50 text-foreground"
                        : "border-border/60 bg-card/40 text-foreground"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}

              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-[20px] border border-border/60 bg-card/40 px-4 py-3 text-sm text-muted-foreground">
                  <TypingIndicator />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <SectionLabel>Diferenciais</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Tudo que um SDR humano faz, sem os custos e limitações
            </h2>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={item}
                className="rounded-[20px] border border-border/60 bg-card/30 p-6 backdrop-blur"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-card/40">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-card/10 py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="rounded-[20px] border border-border/60 bg-card/30 p-8 backdrop-blur sm:p-10">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Acesse a plataforma e configure seu agente agora
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Não precisa de integração complexa. Em minutos você tem um SDR ativo.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={onStart}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.99]"
                >
                  Entrar na plataforma →
                </button>
                <Link
                  href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-card/30 px-7 py-3.5 text-base font-semibold text-foreground backdrop-blur transition hover:bg-card/45 active:scale-[0.99]"
                >
                  Ver como funciona
                </Link>
              </div>
            </div>
          </div>

          <footer className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-xs text-muted-foreground sm:flex-row">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <span className="font-semibold tracking-tight text-foreground">NEXUS CORTEX</span>
              <span className="text-muted-foreground">SDR</span>
            </div>
            <span className="text-[11px] text-muted-foreground/40">
              powered by TRAE with Gemini
            </span>
          </footer>
        </div>
      </section>
    </div>
  );
}
