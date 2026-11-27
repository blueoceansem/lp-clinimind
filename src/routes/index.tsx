import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { BookMarked, Brain, ClipboardCheck, Compass, ListChecks, Rotate3d, Sparkles, Stethoscope, Target, Timer, UserRound, Route as RouteIcon, Rocket } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Blobs, Eyebrow, Logo, QuizCta, Reveal, useSectionView } from "@/components/site/common";
import { AnatomyDemo, CaseDemo, GuidedDemo, QuestionDemo, ReferenceDemo } from "@/components/site/demos";
import { attributionSearch, captureAttribution, track } from "@/lib/tracking";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CliniMind | Organize seus estudos de medicina" },
      { name: "description", content: "Simulados, casos clínicos, anatomia 3D e revisão para você estudar medicina com direção. 20 créditos grátis após o cadastro." },
      { property: "og:title", content: "CliniMind | Organize seus estudos de medicina" },
      { property: "og:description", content: "Saiba por onde começar para a próxima prova. Teste a CliniMind com 20 créditos grátis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: ClipboardCheck, title: "Simulados e questões para treinar para as provas", text: "Coloque seus conhecimentos à prova. Confira as explicações e use as dúvidas que aparecerem para orientar sua revisão.", Demo: QuestionDemo },
  { icon: Stethoscope, title: "Casos clínicos para praticar o raciocínio", text: "Relacione a teoria às informações de um caso educacional. Organize seu raciocínio e retome os conceitos que precisa aprofundar.", Demo: CaseDemo },
  { icon: Rotate3d, title: "Anatomia 3D para explorar o conteúdo das aulas", text: "Visualize estruturas e relações anatômicas para aprofundar o que está estudando.", Demo: AnatomyDemo },
  { icon: Compass, title: "Estudo guiado para organizar sua revisão", text: "Siga uma sequência inicial, explore os conteúdos e retome o que precisa de atenção.", Demo: GuidedDemo },
  { icon: BookMarked, title: "Livros e referências para aprofundar o aprendizado", text: "Confira as fontes apresentadas e encontre fundamentos para continuar estudando.", Demo: ReferenceDemo },
];

const FAQ = [
  ["Preciso pagar para começar?", "Não. Após o cadastro na CliniMind, você recebe 20 créditos gratuitos para experimentar a plataforma."],
  ["O que recebo ao responder às perguntas?", "Uma recomendação inicial de estudo baseada no seu objetivo e na dificuldade informada. Ela orienta como começar a revisar, entender um conteúdo ou praticar."],
  ["O quiz avalia meu conhecimento?", "Não. As perguntas identificam sua necessidade de estudo. Elas não medem seu domínio do conteúdo nem substituem uma avaliação."],
  ["Onde começo a atividade?", "Dentro da CliniMind. Depois de acessar sua recomendação e criar sua conta, você escolhe o conteúdo para começar a estudar."],
  ["Como funciona o teste grátis?", "Você recebe 20 créditos para experimentar os recursos. O saldo e o consumo das atividades são acompanhados dentro da plataforma."],
  ["A CliniMind substitui professores ou materiais de referência?", "Não. É uma ferramenta de apoio ao estudo, com recursos para aprender, revisar e praticar."],
];

function Landing() {
  useEffect(() => { captureAttribution("lp_primeiro"); }, []);
  const heroRef = useSectionView("hero");
  const quizRef = useSectionView("chamada_quiz");
  const featRef = useSectionView("funcionalidades");
  const howRef = useSectionView("como_funciona");
  const faqRef = useSectionView("faq");
  const endRef = useSectionView("fechamento");

  return (
    <div className="quiz-theme min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Logo negative className="h-11" />
          <Link to="/quiz" search={attributionSearch()} onClick={() => track("landing_cta_click", { cta_id: "cta_header", cta_position: "header" })}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-cta transition hover:bg-primary/90">
            Teste grátis
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section ref={heroRef} className="relative">
        <Blobs />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-14 md:pt-20 lg:grid-cols-[1.1fr_1fr]">
          <div className="text-center lg:text-left">
            <div className="animate-fade-up"><Eyebrow>Para você que estuda medicina</Eyebrow></div>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight md:text-[3.4rem] animate-fade-up" style={{ animationDelay: "80ms" }}>
              Organize seus estudos e saiba <span className="text-primary">por onde começar</span> para a próxima prova.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg lg:mx-0 animate-fade-up" style={{ animationDelay: "160ms" }}>
              Desenvolvida com a participação de uma médica e baseada em livros de referência, a CliniMind reúne simulados, casos clínicos, anatomia 3D e revisão de conteúdos para você estudar com direção e colocar o conhecimento em prática.
            </p>
            <div className="mt-9 flex justify-center lg:justify-start animate-fade-up" style={{ animationDelay: "240ms" }}>
              <QuizCta position="hero" />
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md animate-fade-up" style={{ animationDelay: "200ms" }}>
            <QuestionDemo className="relative z-10" />
            <div className="absolute -left-6 -top-6 z-20 hidden items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-card sm:flex animate-float">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green-soft"><Brain className="h-5 w-5 text-brand-green-ink animate-wiggle" /></span>
              <div><p className="text-xs font-bold">Casos clínicos</p><p className="text-[10px] text-muted-foreground">Raciocínio na prática</p></div>
            </div>
            <div className="absolute -bottom-6 -right-4 z-20 hidden items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-card sm:flex animate-float" style={{ animationDelay: "1.2s" }}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft"><Rotate3d className="h-5 w-5 text-primary" /></span>
              <div><p className="text-xs font-bold">Anatomia 3D</p><p className="text-[10px] text-muted-foreground">Estruturas e relações</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* CHAMADA QUIZ — quebra azul */}
      <section ref={quizRef} className="relative px-5">
        <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-primary-foreground md:px-14 md:py-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary-foreground/10" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-brand-green/30 blur-3xl" />
          <div className="relative grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
            <div>
              <h2 className="text-3xl font-bold leading-tight md:text-4xl">Melhore seus estudos com o método da CliniMind.</h2>
              <p className="mt-4 text-lg font-medium text-primary-foreground/90">Não sabe por onde começar? Tem pouco tempo? Entende a teoria, mas trava nas questões?</p>
              <p className="mt-3 text-primary-foreground/80">Responda a 3 perguntas sobre sua formação, seu objetivo e sua dificuldade. Receba um roteiro inicial para organizar sua revisão e começar a praticar.</p>
              <Link to="/quiz" search={attributionSearch()} onClick={() => track("landing_cta_click", { cta_id: "cta_chamada_quiz", cta_position: "chamada_quiz" })}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-card px-7 py-4 font-semibold text-primary shadow-card transition hover:-translate-y-0.5">
                Encontrar meu roteiro de estudo <Sparkles className="h-5 w-5 animate-wiggle" />
              </Link>
              <p className="mt-3 text-sm text-primary-foreground/80">Depois, coloque sua recomendação em prática na plataforma com 20 créditos grátis após o cadastro.</p>
            </div>
            <div className="space-y-3">
              {[[UserRound, "Sua formação"], [Target, "Seu objetivo"], [Timer, "Sua dificuldade"]].map(([Icon, t], i) => {
                const I = Icon as typeof UserRound;
                return (
                  <Reveal key={t as string} delay={i * 120} className="flex items-center gap-4 rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-card text-primary"><I className="h-5 w-5 animate-float" style={{ animationDelay: `${i * 0.4}s` }} /></span>
                    <div><p className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/70">Pergunta {i + 1}</p><p className="font-semibold">{t as string}</p></div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </Reveal>
      </section>

      {/* FUNCIONALIDADES */}
      <section ref={featRef} className="relative py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>Funcionalidades</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">Entenda o conteúdo. Pratique. <span className="text-primary">Revise suas dúvidas.</span></h2>
          </Reveal>
          <div className="mt-16 space-y-20">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="grid items-center gap-10 md:grid-cols-2">
                <Reveal className={i % 2 ? "md:order-2" : ""}>
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary"><f.icon className="h-7 w-7 animate-float" /></span>
                  <h3 className="mt-5 text-2xl font-bold leading-snug">{f.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{f.text}</p>
                </Reveal>
                <Reveal delay={120} className="relative">
                  <div className="absolute inset-6 -z-0 rounded-3xl bg-brand-green/10 blur-2xl" />
                  <f.Demo className="relative mx-auto max-w-md" />
                </Reveal>
              </div>
            ))}
          </div>
          <Reveal className="mt-16 flex justify-center"><QuizCta position="funcionalidades" className="sm:items-center" /></Reveal>
        </div>
      </section>

      {/* COMO FUNCIONA — quebra clara */}
      <section ref={howRef} className="relative border-y border-border bg-card py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="text-center"><Eyebrow>Como funciona</Eyebrow><h2 className="mt-5 text-3xl font-bold md:text-4xl">Da dificuldade à prática.</h2></Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              [ListChecks, "Conte o que você precisa", "Responda a 3 perguntas sobre sua formação, seu objetivo e o que mais dificulta seus estudos."],
              [RouteIcon, "Acesse seu roteiro", "Informe seus contatos para visualizar uma recomendação baseada nas suas respostas."],
              [Rocket, "Comece a estudar na CliniMind", "Crie sua conta na plataforma, escolha o conteúdo e experimente os recursos com 20 créditos grátis."],
            ].map(([Icon, t, d], i) => {
              const I = Icon as typeof ListChecks;
              return (
                <Reveal key={t as string} delay={i * 140} className="group relative rounded-3xl border border-border bg-background p-8 transition hover:-translate-y-1 hover:shadow-card">
                  <span className="absolute right-6 top-5 text-6xl font-extrabold text-primary/10">{i + 1}</span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-cta"><I className="h-6 w-6 transition-transform group-hover:scale-110" /></span>
                  <h3 className="mt-6 text-lg font-bold">{i + 1}. {t as string}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d as string}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section ref={faqRef} className="py-24">
        <div className="mx-auto max-w-3xl px-5">
          <Reveal className="text-center"><Eyebrow>Dúvidas</Eyebrow><h2 className="mt-5 text-3xl font-bold md:text-4xl">Perguntas frequentes</h2></Reveal>
          <Reveal className="mt-10 rounded-3xl border border-border bg-card p-2 shadow-card md:p-4">
            <Accordion type="single" collapsible onValueChange={(v) => v && track("faq_open", { faq_id: v })}>
              {FAQ.map(([q, a], i) => (
                <AccordionItem key={q} value={`faq_${i + 1}`} className="border-border px-4 last:border-0">
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">{q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* FECHAMENTO */}
      <section ref={endRef} className="px-5 pb-24">
        <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-16 text-center shadow-card md:px-16">
          <Blobs />
          <div className="relative">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green-soft"><Brain className="h-7 w-7 text-brand-green-ink animate-wiggle" /></span>
            <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold leading-tight md:text-4xl">Pratique para a prova e revise o que gerar dúvida.</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Explore questões, resolva casos educacionais e aprofunde os conceitos com referências. Conheça a CliniMind enquanto estuda.</p>
            <div className="mt-9 flex justify-center"><QuizCta position="fechamento" note="20 créditos grátis após o cadastro na plataforma." className="sm:items-center" /></div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-muted-foreground sm:flex-row">
          <Logo negative className="h-9" />
          <Link to="/privacidade" className="hover:text-primary">Política de privacidade</Link>
        </div>
      </footer>
    </div>
  );
}
