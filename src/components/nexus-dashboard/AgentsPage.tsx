"use client";

import { motion } from "framer-motion";
import { Bot, FileUp, Play, Save, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNexusStore } from "@/lib/nexus-store";

export function AgentsPage() {
  const { agent, updateAgent } = useNexusStore();
  const [company, setCompany] = useState(agent.companyName);
  const [agentName, setAgentName] = useState(agent.agentName);
  const [context, setContext] = useState(agent.context);
  const [fileName, setFileName] = useState<string | null>(null);
  const [testPrompt, setTestPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "agent" | "lead"; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    updateAgent({
      companyName: company,
      agentName: agentName,
      context: context,
    });
    alert("Configurações salvas!");
  };

  const handleTestChat = async () => {
    if (!testPrompt.trim() || isLoading) return;

    const newMessage = { role: "lead" as const, text: testPrompt };
    setChatHistory((prev) => [...prev, newMessage]);
    setTestPrompt("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: testPrompt,
          context: context,
          agentName: agentName,
          companyName: company,
          history: chatHistory,
        }),
      });

      const data = await res.json();
      setChatHistory((prev) => [...prev, { role: "agent", text: data.text }]);
    } catch (error) {
      console.error("Erro no chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-semibold text-muted-foreground">Agentes</div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Configuração do agente</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="rounded-[20px] border border-border/60 bg-card/30 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold tracking-tight">Configurar</div>
                <div className="text-[11px] font-medium text-muted-foreground">Dados mockados • sem backend</div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card/40">
                <Bot className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Nome da empresa</span>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="h-11 rounded-[20px] border border-border/60 bg-card/20 px-4 text-sm text-foreground outline-none transition focus:border-primary/60"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Nome do agente</span>
                <input
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="h-11 rounded-[20px] border border-border/60 bg-card/20 px-4 text-sm text-foreground outline-none transition focus:border-primary/60"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Cole aqui o contexto da empresa e materiais de venda
                </span>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="min-h-[260px] resize-none rounded-[20px] border border-border/60 bg-card/20 p-4 text-sm text-foreground outline-none transition focus:border-primary/60"
                />
              </label>

              <div className="grid gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Upload de arquivo (PDF, DOC, TXT)</span>
                <label className="flex cursor-pointer items-center justify-between rounded-[20px] border border-border/60 bg-card/20 px-4 py-3 text-sm text-muted-foreground hover:bg-card/30">
                  <span className="truncate">{fileName ?? "Escolher arquivo…"}</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/30 px-3 py-1 text-xs font-semibold">
                    <FileUp className="h-3.5 w-3.5 text-primary" />
                    Upload
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.99]"
              >
                <Save className="h-4 w-4" />
                Salvar e ativar agente
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="rounded-[20px] border border-border/60 bg-card/30 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold tracking-tight">Preview do chat</div>
                <div className="text-[11px] font-medium text-muted-foreground">Como o agente responde com seu contexto</div>
              </div>
              <button
                type="button"
                onClick={() => setChatHistory([])}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/30 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-card/45 active:scale-[0.99]"
              >
                Limpar chat
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              <label className="grid gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Mensagem do lead</span>
                <div className="flex gap-2">
                  <input
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTestChat()}
                    placeholder="Digite uma mensagem para testar..."
                    className="h-11 flex-1 rounded-[20px] border border-border/60 bg-card/20 px-4 text-sm text-foreground outline-none transition focus:border-primary/60"
                  />
                  <button
                    onClick={handleTestChat}
                    disabled={isLoading}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  </button>
                </div>
              </label>
            </div>

            <div className="mt-6 overflow-hidden rounded-[20px] border border-border/60 bg-card/20">
              <div className="flex items-center justify-between border-b border-border/60 bg-card/20 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#10B981,#38BDF8)] text-sm font-extrabold text-[#060B14]">
                    {agentName.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-bold tracking-tight">{agentName}</div>
                    <div className="text-[11px] font-medium text-muted-foreground">Online agora</div>
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-muted-foreground">{company}</div>
              </div>

              <div className="max-h-[400px] space-y-3 overflow-y-auto px-4 py-4">
                {chatHistory.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-4">
                    Nenhuma mensagem enviada. Teste o agente acima!
                  </p>
                )}
                {chatHistory.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex ${m.role === "lead" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[86%] whitespace-pre-line rounded-[20px] border px-4 py-3 text-sm leading-relaxed sm:max-w-[78%] ${
                        m.role === "lead"
                          ? "border-border/60 bg-secondary/50 text-foreground"
                          : "border-border/60 bg-card/30 text-foreground"
                      }`}
                    >
                      {m.text}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-[20px] border border-border/60 bg-card/30 px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

