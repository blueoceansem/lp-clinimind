import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, Loader2, Info, MonitorPlay, Wrench } from "lucide-react";
import { PLATFORM_URL } from "@/components/site/common";
import negativeLogo from "@/assets/clinimind-logo-negative.png.asset.json";
import { QUESTIONS, buildRecommendation, type Answers } from "@/lib/quiz";
import { submitLead } from "@/lib/leads.functions";
import { COUNTRY_OPTIONS, formatWhatsApp, validateEmail, validateWhatsApp, type CountryCode } from "@/lib/contact-validation";
import { PAGE_VERSION, PRIVACY_VERSION, captureAttribution, getAttribution, track, uid } from "@/lib/tracking";
import { cn } from "@/lib/utils";

const DEMO_URL = "https://www.clinimind.net/";

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
type FieldErrors = { name?: string; email?: string; whatsapp?: string };

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
    <div className="quiz-theme relative flex min-h-[100dvh] flex-col overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-brand-green/10 blur-[100px]" />
      <header className="relative z-10 flex justify-center px-4 pt-4"><Link to="/" aria-label="Voltar para a página inicial"><img src={negativeLogo.url} alt="CliniMind AI" className="h-12 w-12" /></Link></header>
      <main className={cn("relative z-10 mx-auto flex w-full flex-1 flex-col px-4", stage === "result" ? "max-w-2xl justify-start py-6 lg:max-w-6xl" : "max-w-lg justify-center py-3")}>
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
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-green">Para você que estuda medicina</p>
        {step === 0 && (
          <>
            <h1 className="mt-2 text-lg font-extrabold leading-snug sm:text-xl">Responda 3 perguntas e veja como direcionar melhor seus estudos.</h1>
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
                active ? "border-primary bg-primary-soft text-foreground" : "border-border bg-background hover:border-primary/70 hover:bg-primary-soft/50")}>
              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", active ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground")}>{active && <Check className="h-3 w-3" />}</span>
              {o.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between">
        {step > 0 ? <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Voltar</button> : <span />}
        <p className="text-xs text-muted-foreground">Toque em uma resposta para avançar.</p>
      </div>
    </div>
  );
}

function Capture({ answers, attemptId, onBack, onSaved }: { answers: Required<Answers>; attemptId: string; onBack: () => void; onSaved: (leadId: string) => void }) {
  const save = useServerFn(submitLead);
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", country: "BR" as CountryCode, consent: false, website: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submissionId] = useState(() => uid("sub"));
  const started = useRef(false);
  const mountedAt = useRef(0);
  useEffect(() => { mountedAt.current = Date.now(); track("lead_capture_view", { quiz_attempt_id: attemptId }); }, [attemptId]);

  function markStarted() {
    if (!started.current) { started.current = true; track("lead_form_start", { quiz_attempt_id: attemptId }); }
  }

  function clearError(field: keyof FieldErrors) {
    setErrors((current) => { const next = { ...current }; delete next[field]; return next; });
  }

  function onField(field: "name" | "email" | "website", value: string) {
    markStarted();
    setForm((current) => ({ ...current, [field]: value }));
    if (field !== "website") clearError(field);
  }

  function onPhone(value: string) {
    markStarted();
    setForm((current) => ({ ...current, whatsapp: formatWhatsApp(current.country, value) }));
    clearError("whatsapp");
  }

  function checkEmail() {
    const result = validateEmail(form.email);
    if (!result.ok) setErrors((current) => ({ ...current, email: result.message }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    const errs: FieldErrors = {};
    if (form.name.trim().length < 2) errs.name = "Informe seu nome.";
    const emailResult = validateEmail(form.email);
    if (!emailResult.ok) errs.email = emailResult.message;
    const phoneResult = form.whatsapp ? validateWhatsApp(form.country, form.whatsapp) : null;
    if (phoneResult && !phoneResult.ok) errs.whatsapp = phoneResult.message;
    setErrors(errs);
    track("lead_submit", { quiz_attempt_id: attemptId, submission_id: submissionId });
    if (Object.keys(errs).length) {
      const fields = Object.keys(errs);
      track("lead_validation_error", { quiz_attempt_id: attemptId, fields });
      track("form_validation_error", { quiz_attempt_id: attemptId, submission_id: submissionId, fields });
      return;
    }
    setSaving(true); setServerError(null);
    const a = getAttribution();
    const rec = buildRecommendation(answers);
    try {
      const res = await save({ data: {
        submission_id: submissionId, name: form.name.trim(), email: form.email.trim(), whatsapp: form.whatsapp.trim() || undefined,
        whatsapp_country: form.country,
        profile: answers.profile, goal: answers.goal, difficulty: answers.difficulty, recommendation_id: rec.id, quiz_attempt_id: attemptId,
        entry_point: a.entry_point ?? "quiz_direto", creative_id: a.creative_id, utm_source: a.utm_source, utm_medium: a.utm_medium,
        utm_campaign: a.utm_campaign, utm_content: a.utm_content, utm_term: a.utm_term, marketing_consent: form.consent,
        ad_attribution: { campaign_name: a.campaign_name, adset_name: a.adset_name, ad_name: a.ad_name, campaign_id: a.campaign_id, adset_id: a.adset_id, ad_id: a.ad_id, placement: a.placement, source: a.source },
        privacy_version: PRIVACY_VERSION, page_version: PAGE_VERSION,
        form_elapsed_ms: Date.now() - mountedAt.current, website: form.website,
      } });
      if (!res.ok) {
        if ("field" in res) {
          setErrors((current) => ({ ...current, [res.field]: res.message }));
          track("form_validation_error", { quiz_attempt_id: attemptId, submission_id: submissionId, fields: [res.field], validation_source: "server" });
        } else setServerError(res.formError);
        track("lead_save_error", { quiz_attempt_id: attemptId, submission_id: submissionId });
        setSaving(false);
        return;
      }
      track("lead_saved", { quiz_attempt_id: attemptId, lead_id: res.lead_id, submission_id: submissionId, recommendation_id: rec.id, marketing_consent: form.consent, email_domain_validated: true, whatsapp_structure_validated: !!phoneResult?.ok });
      onSaved(res.lead_id);
    } catch {
      track("lead_save_error", { quiz_attempt_id: attemptId, submission_id: submissionId });
      setServerError("Não foi possível salvar agora. Seus dados continuam aqui — tente novamente.");
      setSaving(false);
    }
  }

  const input = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
  const label = "mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground";
  return (
    <form onSubmit={submit} noValidate className="animate-fade-up rounded-3xl border border-border bg-card p-5 shadow-card sm:p-7">
      <h1 className="text-center text-xl font-extrabold sm:text-2xl">Veja como direcionar seus estudos.</h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">Informe seus contatos para acessar seu roteiro e seguir para o teste grátis na CliniMind.</p>
      <div className="mt-5 space-y-4">
        <div><label htmlFor="name" className={label}>Nome</label><input id="name" autoComplete="name" maxLength={100} className={input} value={form.name} onChange={(e) => onField("name", e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />{errors.name && <p id="name-error" className="mt-1 text-xs text-destructive">{errors.name}</p>}</div>
        <div><label htmlFor="email" className={label}>E-mail</label><input id="email" type="email" inputMode="email" autoComplete="email" maxLength={255} className={input} value={form.email} onChange={(e) => onField("email", e.target.value)} onBlur={checkEmail} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />{errors.email && <p id="email-error" className="mt-1 text-xs text-destructive">{errors.email}</p>}</div>
        <div>
          <label htmlFor="whatsapp" className={label}>WhatsApp — opcional</label>
          <div className="flex gap-2">
            <label className="sr-only" htmlFor="country">Código do país</label>
            <select id="country" aria-label="Código do país" className="w-[118px] shrink-0 rounded-xl border border-border bg-background px-2 py-3 text-sm text-foreground focus:border-primary focus:outline-none" value={form.country} onChange={(e) => { const country = e.target.value as CountryCode; setForm((current) => ({ ...current, country, whatsapp: formatWhatsApp(country, current.whatsapp) })); }}>
              {COUNTRY_OPTIONS.map((country) => <option key={country.code} value={country.code}>{country.flag} +{country.ddi}</option>)}
            </select>
            <input id="whatsapp" type="tel" inputMode="tel" autoComplete="tel-national" maxLength={20} placeholder={form.country === "BR" ? "(11) 99999-9999" : "Número com DDD"} className={input} value={form.whatsapp} onChange={(e) => onPhone(e.target.value)} aria-invalid={!!errors.whatsapp} aria-describedby={errors.whatsapp ? "whatsapp-error" : undefined} />
          </div>
          {errors.whatsapp && <p id="whatsapp-error" className="mt-1 text-xs text-destructive">{errors.whatsapp}</p>}
        </div>
        <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true"><label htmlFor="website">Não preencha</label><input id="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => onField("website", e.target.value)} /></div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          <input type="checkbox" checked={form.consent} onChange={(e) => { markStarted(); setForm((current) => ({ ...current, consent: e.target.checked })); }} className="mt-0.5 h-4 w-4 accent-primary" />
          Quero receber orientações de estudo e comunicações da CliniMind pelos contatos informados.
        </label>
      </div>
      {serverError && <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{serverError}</p>}
      <button type="submit" disabled={saving} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-semibold text-primary-foreground shadow-cta transition hover:bg-primary/90 disabled:opacity-70">
        {saving ? <><Loader2 className="h-5 w-5 animate-spin" />Validando e salvando…</> : <>Ver meu roteiro de estudo<ArrowRight className="h-5 w-5" /></>}
      </button>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">A confirmação efetiva dos contatos acontece no cadastro oficial. Até lá, eles ficam sinalizados como não verificados.</p>
      <div className="mt-4 flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} disabled={saving} className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Voltar</button>
        <Link to="/privacidade" target="_blank" className="text-xs font-semibold text-foreground underline-offset-2 hover:underline">Política de privacidade</Link>
      </div>
    </form>
  );
}

function Result({ answers, attemptId, leadId }: { answers: Required<Answers>; attemptId: string; leadId: string | null }) {
  const rec = buildRecommendation(answers);
  const offerRef = useRef<HTMLDivElement>(null);
  const primaryCtaRef = useRef<HTMLButtonElement>(null);
  const studyPlanTracked = useRef(false);
  const offerTracked = useRef(false);
  const [showSticky, setShowSticky] = useState(false);
  const recommendedFeatures = rec.steps.map((step) => step.tool_id).join(",");

  useEffect(() => {
    if (studyPlanTracked.current) return;
    studyPlanTracked.current = true;
    const params = { quiz_attempt_id: attemptId, recommendation_id: rec.id, lead_id: leadId, profile: answers.profile, recommended_feature: recommendedFeatures };
    track("recommendation_view", params);
    track("study_plan_view", params);
  }, [attemptId, rec.id, leadId, answers.profile, recommendedFeatures]);

  useEffect(() => {
    const element = offerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !offerTracked.current) {
        offerTracked.current = true;
        track("trial_offer_view", { quiz_attempt_id: attemptId, recommendation_id: rec.id, lead_id: leadId, profile: answers.profile, recommended_feature: recommendedFeatures, offer: "20_creditos" });
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [attemptId, rec.id, leadId, answers.profile, recommendedFeatures]);

  useEffect(() => {
    const element = primaryCtaRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setShowSticky(!entry?.isIntersecting), { threshold: 0.1 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function destination(base: string, includeLead: boolean) {
    const a = getAttribution();
    const url = new URL(base);
    for (const [key, value] of Object.entries(a)) if (value) url.searchParams.set(key, String(value));
    if (includeLead && leadId) url.searchParams.set("cm_lead", leadId);
    url.searchParams.set("cm_rec", rec.id);
    return url;
  }

  function goPlatform(position: "offer" | "sticky_mobile") {
    const params = { quiz_attempt_id: attemptId, recommendation_id: rec.id, lead_id: leadId, profile: answers.profile, recommended_feature: recommendedFeatures, cta_id: `trial_${position}`, cta_position: position };
    track("platform_trial_cta_click", params);
    track("trial_cta_click", params);
    const url = destination(PLATFORM_URL, true);
    track("platform_redirect", { ...params, destination: url.origin });
    track("registration_redirect", { ...params, destination: url.origin });
    window.location.assign(url.toString());
  }

  function goDemo() {
    track("platform_demo_click", { quiz_attempt_id: attemptId, recommendation_id: rec.id, lead_id: leadId, profile: answers.profile, recommended_feature: recommendedFeatures, cta_id: "platform_demo", cta_position: "offer" });
    window.location.assign(destination(DEMO_URL, false).toString());
  }

  return (
    <div className={cn("animate-fade-up space-y-4", showSticky ? "pb-24 sm:pb-6" : "pb-6")}>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-6">
      <section className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-7" aria-labelledby="study-plan-title">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-green-soft px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-green"><Check className="h-3 w-3" />Identificação inicial</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Contatos validados · confirmação pendente</span>
        </div>
        <h1 id="study-plan-title" className="mt-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">Seu roteiro de estudos personalizado está pronto.</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Com base nas suas respostas, selecionamos 3 etapas de estudo e as ferramentas da CliniMind mais relevantes para seu objetivo acadêmico.</p>
        <div className="mt-4 rounded-2xl border border-primary/40 bg-primary-soft p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-green">Recomendação para seu objetivo</p>
          <h2 className="mt-1 text-base font-bold leading-snug sm:text-lg">{rec.title}</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{rec.context}</p>
        </div>
        {rec.outsideTarget && (
          <p className="mt-3 flex gap-2 rounded-xl bg-muted p-3 text-xs leading-relaxed text-foreground"><Info className="h-4 w-4 shrink-0 text-brand-green" />A experiência da CliniMind é voltada à formação médica. Use estas orientações como referência geral de estudo.</p>
        )}
        <ol className="mt-4 space-y-2.5">
          {rec.steps.map((step, index) => (
            <li key={step.title} className="relative rounded-2xl border border-border bg-background p-3.5 pl-14" style={{ animation: `fade-up .45s ${0.08 + index * 0.1}s both` }}>
              <span className="absolute left-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-sm font-extrabold tabular-nums text-background">{index + 1}</span>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-green"><Wrench className="h-3 w-3" />{step.tool}</div>
              <h3 className="mt-1 text-sm font-bold leading-snug sm:text-base">{step.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <div id="trial-offer" ref={offerRef} className="relative overflow-hidden rounded-3xl border border-primary/50 bg-card p-5 text-center shadow-card sm:p-7 lg:sticky lg:top-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-green">20 créditos grátis</p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-brand-green sm:text-5xl"><span className="tabular-nums">20</span> <span className="text-xl sm:text-2xl">créditos</span></p>
          <h2 className="mx-auto mt-3 max-w-md text-xl font-extrabold leading-tight sm:text-2xl">Seu roteiro está pronto. Agora, coloque-o em prática.</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">Experimente as ferramentas recomendadas para você e explore mais de 18 recursos de estudo médico em uma única plataforma.</p>
          <button ref={primaryCtaRef} id="trial_offer" type="button" onClick={() => goPlatform("offer")} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-cta transition hover:-translate-y-0.5 hover:bg-primary/90 sm:w-auto">
            Comece seu teste grátis <ArrowRight className="h-5 w-5" />
          </button>
          <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-muted-foreground">Receba 20 créditos gratuitos após o cadastro e coloque seu roteiro de estudos em prática antes de assinar.</p>
          <button type="button" onClick={goDemo} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:border-brand-green hover:bg-muted sm:w-auto">
            <MonitorPlay className="h-4 w-4 text-brand-green" />Veja a CliniMind funcionando
          </button>
        </div>
      </div>
      </div>

      <p className="flex items-start justify-center gap-1.5 text-center text-[11px] leading-relaxed text-muted-foreground"><BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0" />Recomendação baseada nas suas respostas. O quiz não avalia seu conhecimento.</p>

      {showSticky && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg sm:hidden">
          <button id="trial_sticky_mobile" type="button" onClick={() => goPlatform("sticky_mobile")} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-cta">
            Comece seu teste grátis <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-1.5 text-center text-[10px] font-semibold text-brand-green">20 créditos grátis após o cadastro</p>
        </div>
      )}
    </div>
  );
}
