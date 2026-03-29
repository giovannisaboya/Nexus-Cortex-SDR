"use client";

import { useMemo, useState } from "react";
import { Filter, PanelRightClose, PanelRightOpen, Search } from "lucide-react";
import { useNexusStore } from "@/lib/nexus-store";

function badge(status: string) {
  if (status === "Quente") return "bg-primary/15 text-primary border-primary/30";
  if (status === "Morno") return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  return "bg-slate-500/15 text-slate-300 border-slate-500/30";
}

export function LeadsPage() {
  const { conversations } = useNexusStore();
  const [filter, setFilter] = useState<"Todos" | "Quente" | "Morno" | "Frio">("Todos");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const rows = useMemo(() => {
    return conversations.filter((l) => {
      const okStatus = filter === "Todos" ? true : l.status === filter;
      const q = query.trim().toLowerCase();
      const okQuery =
        q.length === 0 ? true : `${l.leadName} ${l.leadContact} ${l.origin}`.toLowerCase().includes(q);
      return okStatus && okQuery;
    });
  }, [filter, query, conversations]);

  const selected = useMemo(
    () => conversations.find((l) => l.id === selectedId) ?? null,
    [selectedId, conversations]
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm font-semibold text-muted-foreground">Leads</div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Pipeline</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className={`${drawerOpen ? "lg:col-span-8" : "lg:col-span-12"}`}>
          <div className="rounded-[20px] border border-border/60 bg-card/30 backdrop-blur">
            <div className="flex flex-col gap-3 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-bold tracking-tight">Lista de leads</div>
                <div className="text-[11px] font-medium text-muted-foreground">Filtros e detalhes • dados mockados</div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/20 px-3 py-2 text-xs font-semibold text-muted-foreground">
                  <Search className="h-3.5 w-3.5 text-primary" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar"
                    className="w-40 bg-transparent text-xs font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/20 px-3 py-2 text-xs font-semibold text-muted-foreground">
                  <Filter className="h-3.5 w-3.5 text-primary" />
                  {(["Todos", "Quente", "Morno", "Frio"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFilter(s)}
                      className={`rounded-full px-2 py-0.5 transition ${
                        filter === s ? "bg-primary/15 text-primary" : "hover:bg-card/40"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setDrawerOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/20 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-card/30"
                >
                  {drawerOpen ? <PanelRightClose className="h-3.5 w-3.5 text-primary" /> : <PanelRightOpen className="h-3.5 w-3.5 text-primary" />}
                  Detalhes
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border/60">
                    <th className="px-5 py-3 font-semibold">Nome</th>
                    <th className="px-5 py-3 font-semibold">Contato</th>
                    <th className="px-5 py-3 font-semibold">Score</th>
                    <th className="px-5 py-3 font-semibold">Origem</th>
                    <th className="px-5 py-3 font-semibold">Data</th>
                    <th className="px-5 py-3 font-semibold">Próxima ação</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => setSelectedId(l.id)}
                      className={`cursor-pointer border-b border-border/60 last:border-b-0 hover:bg-card/20 ${
                        selectedId === l.id ? "bg-card/20" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold">{l.leadName}</td>
                      <td className="px-5 py-4 text-muted-foreground">{l.leadContact}</td>
                      <td className="px-5 py-4 font-semibold">{l.score}</td>
                      <td className="px-5 py-4 text-muted-foreground">{l.origin}</td>
                      <td className="px-5 py-4 text-muted-foreground">Hoje</td>
                      <td className="px-5 py-4 text-muted-foreground">Qualificar</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badge(l.status)}`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 ? (
                    <tr>
                      <td className="px-5 py-10 text-sm text-muted-foreground" colSpan={7}>
                        Nenhum lead encontrado.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {drawerOpen ? (
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-[20px] border border-border/60 bg-card/30 p-6 backdrop-blur">
              <div className="text-sm font-bold tracking-tight">Detalhes do lead</div>
              <div className="mt-1 text-[11px] font-medium text-muted-foreground">Clique em um lead para ver</div>

              {selected ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-[20px] border border-border/60 bg-card/20 p-4">
                    <div className="text-sm font-semibold">{selected.leadName}</div>
                    <div className="mt-1 text-xs font-medium text-muted-foreground">{selected.leadContact}</div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badge(selected.status)}`}>
                        {selected.status}
                      </span>
                      <span className="inline-flex rounded-full border border-border/60 bg-card/20 px-3 py-1 text-xs font-semibold text-muted-foreground">
                        Score {selected.score}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-border/60 bg-card/20 p-4">
                    <div className="text-xs font-semibold text-muted-foreground">Origem</div>
                    <div className="mt-1 text-sm font-semibold">{selected.origin}</div>
                    <div className="mt-3 text-xs font-semibold text-muted-foreground">Próxima ação</div>
                    <div className="mt-1 text-sm font-semibold">Qualificar</div>
                    <div className="mt-3 text-xs font-semibold text-muted-foreground">Última Mensagem</div>
                    <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{selected.lastMessage}</div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-[20px] border border-border/60 bg-card/20 p-4 text-sm text-muted-foreground">
                  Selecione um lead para abrir o drawer de detalhes.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

