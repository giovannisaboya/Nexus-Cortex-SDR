"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Home,
  MessageCircle,
  Settings,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNexusStore } from "@/lib/nexus-store";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const { agent, userName } = useNexusStore();

  const nav = useMemo(
    () => [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/agentes", label: "Agentes", icon: Bot },
      { href: "/dashboard/conversas", label: "Conversas", icon: MessageCircle },
      { href: "/dashboard/leads", label: "Leads", icon: Users },
      { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
    ],
    [],
  );

  const companyName = agent.companyName;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside
          className={`sticky top-0 h-screen border-r border-border/60 bg-card/20 backdrop-blur transition-[width] duration-200 ${
            expanded ? "w-60" : "w-16"
          }`}
        >
          <div className="flex h-16 items-center justify-between px-3">
            <Link href="/" className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-card/40">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              {expanded ? (
                <div className="leading-tight">
                  <div className="text-sm font-extrabold tracking-tight text-foreground">
                    NEXUS CORTEX <span className="font-medium text-muted-foreground">SDR</span>
                  </div>
                  <div className="text-[11px] font-medium text-muted-foreground">Plataforma</div>
                </div>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-border/60 bg-card/30 text-muted-foreground transition hover:bg-card/45 active:scale-[0.99]"
              aria-label={expanded ? "Recolher sidebar" : "Expandir sidebar"}
            >
              {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>

          <nav className="px-2 py-3">
            <ul className="space-y-1">
              {nav.map((i) => {
                const active = pathname === i.href;
                return (
                  <li key={i.href}>
                    <Link
                      href={i.href}
                      className={`group flex items-center gap-3 rounded-[20px] border px-3 py-2.5 transition ${
                        active
                          ? "border-border/60 bg-card/50 text-foreground"
                          : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-card/30"
                      }`}
                    >
                      <i.icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                      {expanded ? <span className="text-sm font-semibold">{i.label}</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-border/60 bg-card/20 backdrop-blur">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">{companyName}</div>
                <div className="truncate text-[11px] font-medium text-muted-foreground">Área logada</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-card/30 px-3 py-1 text-xs font-semibold text-muted-foreground sm:inline-flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Agente ativo
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-card/30 text-sm font-extrabold text-primary">
                    {userName.slice(0, 1).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>

          <footer className="border-t border-border/60 py-3 text-center">
            <span className="text-[11px] text-muted-foreground/40">
              powered by TRAE with Gemini
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}

