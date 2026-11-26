import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Info } from "lucide-react";
import { Logo, PLATFORM_URL } from "@/components/site/common";
import { CaseDemo, GuidedDemo, QuestionDemo } from "@/components/site/demos";
import { QUESTIONS, buildRecommendation, type Answers } from "@/lib/quiz";
import { submitLead } from "@/lib/leads.functions";
import { PAGE_VERSION, PRIVACY_VERSION, captureAttribution, getAttribution, track, uid } from "@/lib/tracking";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quiz")({
  // Keep ad origin params (utm_*, creative_id) on the URL across the flow.
  validateSearch: (s: Record<string, unknown>): Record<string, string | undefined> =>
    Object.fromEntries(Object.entries(s).filter(([, v]) => typeof v === "string")) as Record<string, string>,
  head: () => ({
    meta: [
      { title: "Seu roteiro de estudo | CliniMind" },
      { name: "description", content: "Responda 3 perguntas e veja como direcionar melhor seus estudos de medicina." },
      { property: "og:title", content: "Responda 3 perguntas | CliniMind" },
      { property: "og:description", content: "Receba um roteiro inicial para organizar sua revisão e começar a praticar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuizPage,
});

type Stage = 0 | 1 | 2 | "capture" | "result";

function QuizPage() {
  const [stage, setStage] = useState<Stage>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [attemptId] = useState(() => uid("qa"));
  const [leadId, setLeadId] = useState<string | null>(null);
  const lock = useRef(false);

  useEffect(() => {
    captureAttribution("quiz_direto");
    track("quiz_start", { quiz_attempt_id: attemptId });
  }, [attemptId]);

  useEffect(() => {
    if (typeof stage === "number") track("quiz_step_view", { quiz_attempt_id: attemptId, question_id: QUESTIONS[stage].id, step_number: stage + 1 });
    window.scrollTo({ top: 0 });
  }, [stage, attemptId]);

  function choose(step: 0 | 1 | 2, answerId: string) {
    if (lock.current) return;
    lock.current = true;
    const q = QUESTIONS[step];
    const prev = answers[q.id as keyof Answers];
    const next = { ...answers, [q.id]: answerId } as Answers;
    setAnswers(next);
    track("quiz_answer", { quiz_attempt_id: attemptId, question_id: q.id, step_number: step + 1, answer_id: answerId, previous_answer_id: prev ?? null, button_id: `btn_${q.id}_${answerId}` });
    if (q.id === "profile" && answerId === "vestibular") track("quiz_outside_target", { quiz_attempt_id: attemptId, answer_id: answerId });
    setTimeout(() => {
      if (step < 2) { track("quiz_auto_advance", { quiz_attempt_id: attemptId, from_step: step + 1, to_step: step + 2 }); setStage((step + 1) as Stage); }
      else { track("quiz_complete", { quiz_attempt_id: attemptId, profile: next.profile, goal: next.goal, difficulty: next.difficulty }); setStage("capture"); }
      lock.current = false;
    }, 260);
  }

  function back() {
    if (stage === "capture") { setStage(2); track("quiz_back", { quiz_attempt_id: attemptId, from_step: "capture" }); return; }
    if (typeof stage === "number" && stage > 0) { track("quiz_back", { quiz_attempt_id: attemptId, from_step: stage + 1 }); setStage((stage - 1) as Stage); }
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden bg-background">
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-brand-green/10 blur-[100px]" />
      <header className="relative z-10 flex justify-center px-4 pt-4"><Link to="/"><Logo className="h-9" /></Link></header>
      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-3">
        {typeof stage === "number" && <QuestionStep step={stage} answers={answers} onChoose={choose} onBack={back} />}
        {stage === "capture" && <Capture answers={answers as Required<Answers>} attemptId={attemptId} onBack={back} onSaved={(id) => { setLeadId(id); setStage("result"); }} />}
        {stage === "result" && <Result answers={answers as Required<Answers>} attemptId={attemptId} leadId={leadId} />}
      </main>
    </div>
  );
}

function QuestionStep({ step, answers, onChoose, onBack }: { step: 0 | 1 | 2; answers: Answers; onChoose: (s: 0 | 1 | 2, id: string) => void; onBack: () => void }) {
  const q = QUESTIONS[step];
  const selected = answers[q.id as keyof Answers];
  const firstRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (step > 0) firstRef.current?.focus({ preventScroll: true }); }, [step]);
  return (
    <div key={step} className="animate-fade-up rounded-3xl border border-border bg-card p-5 shadow-card sm:p-7">
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Para você que estuda medicina</p>
        {step === 0 && (
          <>
            <h1 className="mt-2 text-lg font-bold leading-snug sm:text-xl">Responda 3 perguntas e veja como direcionar melhor seus estudos.</h1>
            <p className="mt-1.5 hidden text-xs text-muted-foreground min-[400px]:block [@media(max-height:700px)]:hidden">Conte sua formação, seu objetivo e sua dificuldade. Depois, informe seus contatos para acessar seu roteiro e seguir para o teste grátis na CliniMind.</p>
          </>
        )}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex flex-1 gap-1.5" aria-hidden>{[0, 1, 2].map((i) => <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-muted")} />)}</div>
        <span className="text-xs font-bold text-muted-foreground" aria-live="polite">{step + 1} de 3</span>
      </div>
      <h2 className="mt-4 text-base font-bold sm:text-lg">Pergunta {step + 1} — {q.title}</h2>
      <div className="mt-3 space-y-2" role="radiogroup" aria-label={q.title}>
        {q.options.map((o, i) => {
          const active = selected === o.id;
          return (
            <button key={o.id} ref={i === 0 ? firstRef : undefined} type="button" role="radio" aria-checked={active} id={`btn_${q.id}_${o.id}`}
              onClick={() => onChoose(step, o.id)}
              className={cn("flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]",
                active ? "border-primary bg-primary-soft text-primary" : "border-border bg-background hover:border-primary/40 hover:bg-primary-soft/50")}>
              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", active ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{active && <Check className="h-3 w-3" />}</span>
              {o.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between">
        {step > 0 ? <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />Voltar</button> : <span />}
        <p className="text-xs text-muted-foreground">Toque em uma resposta para avançar.</p>
      </div>
    </div>
  );
}

function Capture({ answers, attemptId, onBack, onSaved }: { answers: Required<Answers>; attemptId: string; onBack: () => void; onSaved: (leadId: string) => void }) {
  const save = useServerFn(submitLead);
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", consent: false });
  const [errors, setErrors] = useState<{ name?: string; email?: string; whatsapp?: string }>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submissionId] = useState(() => uid("sub"));
  const started = useRef(false);
  useEffect(() => { track("lead_capture_view", { quiz_attempt_id: attemptId }); }, [attemptId]);

  function onField(k: keyof typeof form, v: string | boolean) {
    if (!started.current) { started.current = true; track("lead_form_start", { quiz_attempt_id: attemptId }); }
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    const errs: { name?: string; email?: string; whatsapp?: string } = {};
    if (form.name.trim().length < 2) errs.name = "Informe seu nome.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = "Informe um e-mail válido.";
    if (form.whatsapp && !/^[0-9()+\-\s]{8,30}$/.test(form.whatsapp.trim())) errs.whatsapp = "Informe um WhatsApp válido ou deixe em branco.";
    setErrors(errs);
    track("lead_submit", { quiz_attempt_id: attemptId, submission_id: submissionId });
    if (Object.keys(errs).length) { track("lead_validation_error", { quiz_attempt_id: attemptId, fields: Object.keys(errs) }); return; }
    setSaving(true); setServerError(null);
    const a = getAttribution();
    const rec = buildRecommendation(answers);
    try {
      const res = await save({ data: {
        submission_id: submissionId, name: form.name.trim(), email: form.email.trim(), whatsapp: form.whatsapp.trim() || undefined,
        profile: answers.profile, goal: answers.goal, difficulty: answers.difficulty, recommendation_id: rec.id, quiz_attempt_id: attemptId,
        entry_point: a.entry_point ?? "quiz_direto", creative_id: a.creative_id, utm_source: a.utm_source, utm_medium: a.utm_medium,
        utm_campaign: a.utm_campaign, utm_content: a.utm_content, utm_term: a.utm_term, marketing_consent: form.consent,
        privacy_version: PRIVACY_VERSION, page_version: PAGE_VERSION,
      } });
      track("lead_saved", { quiz_attempt_id: attemptId, lead_id: res.lead_id, submission_id: submissionId, recommendation_id: rec.id, marketing_consent: form.consent });
      onSaved(res.lead_id);
    } catch {
      track("lead_save_error", { quiz_attempt_id: attemptId, submission_id: submissionId });
      setServerError("Não foi possível salvar agora. Seus dados continuam aqui — tente novamente.");
      setSaving(false);
    }
  }

  const input = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
  const label = "mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground";
  return (
    <form onSubmit={submit} noValidate className="animate-fade-up rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
      <h1 className="text-center text-xl font-bold sm:text-2xl">Veja como direcionar seus estudos.</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">Informe seus contatos para acessar seu roteiro e seguir para o teste grátis na CliniMind.</p>
      <div className="mt-6 space-y-4">
        <div><label htmlFor="name" className={label}>Nome</label><input id="name" autoComplete="name" maxLength={100} className={input} value={form.name} onChange={(e) => onField("name", e.target.value)} aria-invalid={!!errors.name} />{errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}</div>
        <div><label htmlFor="email" className={label}>E-mail</label><input id="email" type="email" inputMode="email" autoComplete="email" maxLength={255} className={input} value={form.email} onChange={(e) => onField("email", e.target.value)} aria-invalid={!!errors.email} />{errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}</div>
        <div><label htmlFor="whatsapp" className={label}>WhatsApp — opcional</label><input id="whatsapp" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} className={input} value={form.whatsapp} onChange={(e) => onField("whatsapp", e.target.value)} aria-invalid={!!errors.whatsapp} />{errors.whatsapp && <p className="mt-1 text-xs text-destructive">{errors.whatsapp}</p>}</div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          <input type="checkbox" checked={form.consent} onChange={(e) => onField("consent", e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--primary)]" />
          Quero receber orientações de estudo e comunicações da CliniMind pelos contatos informados.
        </label>
      </div>
      {serverError && <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{serverError}</p>}
      <button type="submit" disabled={saving} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-semibold text-primary-foreground shadow-cta transition hover:bg-primary/90 disabled:opacity-70">
        {saving ? <><Loader2 className="h-5 w-5 animate-spin" />Salvando…</> : <>Ver meu roteiro de estudo<ArrowRight className="h-5 w-5" /></>}
      </button>
      <div className="mt-4 flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} disabled={saving} className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />Voltar</button>
        <Link to="/privacidade" target="_blank" className="text-xs font-semibold text-primary underline-offset-2 hover:underline">Política de privacidade</Link>
      </div>
    </form>
  );
}

function Result({ answers, attemptId, leadId }: { answers: Required<Answers>; attemptId: string; leadId: string | null }) {
  const rec = buildRecommendation(answers);
  useEffect(() => { track("recommendation_view", { quiz_attempt_id: attemptId, recommendation_id: rec.id, lead_id: leadId }); }, [attemptId, rec.id, leadId]);
  const Demo = rec.feature === "casos" ? CaseDemo : rec.feature === "estudo" ? GuidedDemo : QuestionDemo;

  function goPlatform() {
    const a = getAttribution();
    track("platform_trial_cta_click", { quiz_attempt_id: attemptId, recommendation_id: rec.id, lead_id: leadId });
    const url = new URL(PLATFORM_URL);
    for (const [k, v] of Object.entries(a)) if (v) url.searchParams.set(k, String(v));
    if (leadId) url.searchParams.set("cm_lead", leadId); // opaque id only
    url.searchParams.set("cm_rec", rec.id);
    track("platform_redirect", { quiz_attempt_id: attemptId, recommendation_id: rec.id, lead_id: leadId, destination: url.origin });
    window.location.href = url.toString();
  }

  return (
    <div className="animate-fade-up space-y-5 pb-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-green-ink"><Check className="h-3 w-3" />Roteiro pronto</span>
        <h1 className="mt-4 text-2xl font-bold leading-tight">{rec.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{rec.context}</p>
        {rec.outsideTarget && (
          <p className="mt-4 flex gap-2 rounded-xl bg-primary-soft p-3 text-xs text-foreground"><Info className="h-4 w-4 shrink-0 text-primary" />A experiência da CliniMind é voltada à formação médica. Use estas orientações como referência geral de estudo.</p>
        )}
        <h2 className="mt-6 text-[11px] font-bold uppercase tracking-wider text-primary">Seu roteiro de revisão</h2>
        <ol className="mt-3 space-y-3">
          {rec.steps.map((s, i) => (
            <li key={s.title} className="flex gap-3 rounded-2xl border border-border bg-background p-4" style={{ animation: `fade-up .5s ${0.1 + i * 0.12}s both` }}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
              <div><p className="font-semibold">{s.title}</p><p className="mt-1 text-sm text-muted-foreground">{s.text}</p></div>
            </li>
          ))}
        </ol>
      </div>
      <Demo />
      <div className="rounded-3xl bg-primary p-6 text-center text-primary-foreground shadow-cta sm:p-8">
        <h2 className="text-xl font-bold">Coloque esse roteiro em prática na CliniMind.</h2>
        <p className="mt-2 text-sm text-primary-foreground/85">Use os recursos de questões e revisão para começar a estudar o conteúdo escolhido.</p>
        <button type="button" onClick={goPlatform} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-card py-4 font-semibold text-primary transition hover:-translate-y-0.5 sm:w-auto sm:px-8">
          Teste a plataforma gratuitamente <ArrowRight className="h-5 w-5" />
        </button>
        <p className="mt-3 text-xs text-primary-foreground/85">Crie sua conta na CliniMind e comece com 20 créditos grátis.</p>
      </div>
      <p className="text-center text-xs text-muted-foreground">Recomendação baseada nas suas respostas. O quiz não avalia seu conhecimento.</p>
    </div>
  );
}
