"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Star, UserCheck, Send, Loader2 } from "lucide-react";
import { useNexusStore } from "@/lib/nexus-store";

function badge(status: string) {
  if (status === "Quente") return "bg-primary/15 text-primary border-primary/30";
  if (status === "Morno") return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  return "bg-slate-500/15 text-slate-300 border-slate-500/30";
}

export function ConversationsPage() {
  const { conversations, agent, addMessage } = useNexusStore();
  const [activeId, setActiveId] = useState(conversations[0]?.id || "");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) || conversations[0],
    [activeId, conversations]
  );

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !active) return;

    const userMsg = {
      role: "lead" as const,
      text: inputValue,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    addMessage(active.id, userMsg);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          context: agent.context,
          agentName: agent.agentName,
          companyName: agent.companyName,
          history: active.messages,
        }),
      });

      const data = await res.json();
      addMessage(active.id, {
        role: "agent",
        text: data.text,
        timestamp: data.timestamp,
      });
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-semibold text-muted-foreground">Conversas</div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Inbox</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="rounded-[20px] border border-border/60 bg-card/30 backdrop-blur">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div>
                <div className="text-sm font-bold tracking-tight">Conversas</div>
                <div className="text-[11px] font-medium text-muted-foreground">Status • preview • horário</div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card/40">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="p-2">
              {conversations.map((c) => {
                const selected = c.id === active.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={`w-full rounded-[20px] border px-4 py-3 text-left transition ${
                      selected
                        ? "border-border/60 bg-card/50"
                        : "border-transparent hover:border-border/60 hover:bg-card/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{c.leadName}</div>
                        <div className="truncate text-[11px] font-medium text-muted-foreground">{c.lastMessage}</div>
                      </div>
                      <div className="shrink-0 text-[11px] font-semibold text-muted-foreground">
                        {c.messages[c.messages.length - 1]?.timestamp}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${badge(c.status)}`}>
                        {c.status}
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground">Score {c.score}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="flex h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-[20px] border border-border/60 bg-card/30 backdrop-blur">
            {active ? (
              <>
                <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold tracking-tight">{active.leadName}</div>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-muted-foreground">
                      <span className={`inline-flex rounded-full border px-3 py-1 ${badge(active.status)}`}>
                        {active.status}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/30 px-3 py-1">
                        <Star className="h-3.5 w-3.5 text-primary" />
                        Score {active.score}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.99]"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Assumir conversa
                  </button>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
                  {active.messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === "lead" ? "justify-end" : "justify-start"}`}>
                      <div className="flex max-w-[86%1] flex-col gap-1 sm:max-w-[72%]">
                        <div
                          className={`rounded-[20px] border px-4 py-3 text-sm leading-relaxed ${
                            m.role === "lead"
                              ? "border-border/60 bg-secondary/50 text-foreground"
                              : "border-border/60 bg-card/40 text-foreground"
                          }`}
                        >
                          {m.text}
                        </div>
                        <span className="px-2 text-[10px] text-muted-foreground">{m.timestamp}</span>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-[20px] border border-border/60 bg-card/40 px-4 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-border/60 p-4">
                  <div className="flex gap-2">
                    <input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Responda ao lead ou teste a IA..."
                      className="h-11 flex-1 rounded-[20px] border border-border/60 bg-card/20 px-4 text-sm text-foreground outline-none transition focus:border-primary/60"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Selecione uma conversa para começar
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

