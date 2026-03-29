"use client";

export function IntroPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/2 top-0 h-[600px] w-[700px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }}
        />
      </div>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-24">
        <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">Julia AI SDR</span>
        </div>

        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          A maioria das empresas perde leads todos os dias.
        </h1>

        <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          <p>
            Não por falta de produto. Por falta de resposta rápida. Um lead chega,
            ninguém atende na hora, e o interesse evapora.
          </p>
          <p>
            A Julia resolve isso. Ela é uma agente de inteligência artificial que atua
            como SDR da sua empresa. Você configura o contexto do seu negócio uma única
            vez, e ela passa a qualificar leads de forma natural, estruturada e humana
            — sem parecer robô, sem limite de conversas simultâneas, 24 horas por dia.
          </p>
          <p>
            Não importa o produto, não importa o nicho. Cole o material da sua empresa
            e a Julia vira a especialista que você precisava contratar.
          </p>
        </div>

        <button
          onClick={onEnter}
          className="mt-10 w-fit rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-semibold text-black transition-all hover:bg-emerald-400 active:scale-[0.98]"
        >
          Acesse a plataforma e configure seu agente agora
        </button>
      </main>

      <footer className="py-4 text-center">
        <span className="text-[11px] text-muted-foreground/40">
          powered by TRAE with Gemini
        </span>
      </footer>
    </div>
  );
}
