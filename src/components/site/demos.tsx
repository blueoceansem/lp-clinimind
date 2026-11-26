import { BookOpen, Check, CircleHelp, Rotate3d, Stethoscope, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Illustrative product previews built in UI (no patient data, no real records).
function Frame({ title, children, className }: { title: string; children: React.ReactNode; className?: string | undefined }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-card shadow-card", className)}>
      <div className="flex items-center gap-1.5 border-b border-border bg-muted px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-border" /><span className="h-2.5 w-2.5 rounded-full bg-border" /><span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="ml-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function QuestionDemo({ className }: { className?: string | undefined }) {
  return (
    <Frame title="Simulado · Cardiologia" className={className}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Questão 4 de 20</p>
      <p className="mt-2 text-sm font-medium text-foreground">Qual estrutura do sistema de condução cardíaco é considerada o marca-passo natural do coração?</p>
      <div className="mt-4 space-y-2 text-sm">
        {[["Nó atrioventricular", false], ["Nó sinoatrial", true], ["Feixe de His", false]].map(([t, ok]) => (
          <div key={t as string} className={cn("flex items-center justify-between rounded-xl border px-3 py-2.5", ok ? "border-brand-green bg-brand-green-soft font-semibold text-brand-green-ink" : "border-border bg-muted text-muted-foreground")}>
            {t as string}{ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 opacity-40" />}
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-primary-soft p-3 text-xs text-foreground">
        <span className="font-bold text-primary">Explicação · </span>O nó sinoatrial gera os impulsos que iniciam cada ciclo cardíaco. <span className="font-semibold">Revisar: fisiologia da condução.</span>
      </div>
    </Frame>
  );
}

export function CaseDemo({ className }: { className?: string | undefined }) {
  return (
    <Frame title="Caso clínico educacional" className={className}>
      <div className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" /><p className="text-sm font-semibold">Situação simulada</p></div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Caso fictício para treino: adulto relata dor torácica ao esforço que melhora com repouso.</p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
        {["Dados", "Hipóteses", "Fundamentos"].map((s, i) => (
          <div key={s} className={cn("rounded-lg px-2 py-2", i === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{s}</div>
        ))}
      </div>
      <div className="mt-3 space-y-1.5 text-xs">
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-green" />Relação com o esforço</div>
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Revisar: perfusão miocárdica</div>
      </div>
    </Frame>
  );
}

export function AnatomyDemo({ className }: { className?: string | undefined }) {
  return (
    <Frame title="Anatomia 3D" className={className}>
      <div className="relative mx-auto flex h-40 items-center justify-center">
        <div className="absolute h-36 w-36 rounded-full border-2 border-dashed border-primary/30 animate-[spin_18s_linear_infinite]" />
        <div className="absolute h-24 w-24 rounded-full bg-primary/10 blur-xl" />
        <Rotate3d className="h-16 w-16 text-primary animate-float" strokeWidth={1.4} />
        <span className="absolute left-2 top-4 rounded-full bg-card px-2.5 py-1 text-[10px] font-semibold shadow-card">Ventrículo esquerdo</span>
        <span className="absolute bottom-3 right-1 rounded-full bg-card px-2.5 py-1 text-[10px] font-semibold shadow-card">Artéria aorta</span>
      </div>
      <div className="mt-2 flex justify-center gap-2 text-[10px] font-bold uppercase tracking-wider">
        <span className="rounded-full bg-primary-soft px-3 py-1 text-primary">Girar</span>
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Camadas</span>
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">Relações</span>
      </div>
    </Frame>
  );
}

export function GuidedDemo({ className }: { className?: string | undefined }) {
  return (
    <Frame title="Estudo guiado" className={className}>
      {[["Conceitos básicos", "done"], ["Prática com questões", "now"], ["Revisão das dúvidas", "next"]].map(([t, s], i) => (
        <div key={t} className="flex items-center gap-3 py-2">
          <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", s === "done" ? "bg-brand-green-soft text-brand-green-ink" : s === "now" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{s === "done" ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
          <div className="flex-1"><p className="text-sm font-medium">{t}</p><div className="mt-1 h-1.5 rounded-full bg-muted"><div className={cn("h-full rounded-full", s === "done" ? "w-full bg-brand-green" : s === "now" ? "w-1/2 bg-primary" : "w-0")} /></div></div>
        </div>
      ))}
    </Frame>
  );
}

export function ReferenceDemo({ className }: { className?: string | undefined }) {
  return (
    <Frame title="Referências" className={className}>
      <div className="flex items-start gap-3 rounded-xl bg-muted p-3">
        <BookOpen className="mt-0.5 h-5 w-5 text-primary" />
        <div><p className="text-sm font-semibold">Livro de referência · Fisiologia</p><p className="text-xs text-muted-foreground">Capítulo: Excitação rítmica do coração</p></div>
      </div>
      <div className="mt-2 flex items-start gap-3 rounded-xl border border-border p-3">
        <CircleHelp className="mt-0.5 h-5 w-5 text-brand-green-ink" />
        <p className="text-xs text-muted-foreground">Fonte apresentada junto ao conteúdo para você continuar estudando.</p>
      </div>
    </Frame>
  );
}
