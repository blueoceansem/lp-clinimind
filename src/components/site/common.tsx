import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import logo from "@/assets/clinimind-logo.png.asset.json";
import negativeLogo from "@/assets/clinimind-logo-negative.png.asset.json";
import { attributionSearch, track } from "@/lib/tracking";
import { cn } from "@/lib/utils";

export const PLATFORM_URL = "https://www.clinimind.net/dashboard";

export function Logo({ className, negative = false }: { className?: string | undefined; negative?: boolean }) {
  return <img src={negative ? negativeLogo.url : logo.url} alt="CliniMind" className={cn("h-10 w-auto", className)} />;
}

export function Reveal({ children, className, delay = 0, as: Tag = "div" }: { children: ReactNode; className?: string | undefined; delay?: number; as?: "div" | "li" }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { el.classList.add("is-visible"); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <Tag ref={ref as never} className={cn("reveal", className)} style={{ transitionDelay: `${delay}ms` }}>{children}</Tag>;
}

export function useSectionView(id: string) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { track("landing_section_view", { section_id: id }); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, [id]);
  return ref;
}

export function QuizCta({ position, label = "Teste a plataforma gratuitamente", note = "20 créditos grátis após o cadastro na CliniMind.", className }: { position: string; label?: string; note?: string | null; className?: string | undefined }) {
  return (
    <div className={cn("flex flex-col items-center gap-3 sm:items-start", className)}>
      <Link
        to="/quiz"
        search={attributionSearch()}
        onClick={() => track("landing_cta_click", { cta_id: `cta_${position}`, cta_position: position, cta_label: label })}
        className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-cta transition-all hover:-translate-y-0.5 hover:bg-primary/90 active:scale-[0.98] animate-pulse-ring"
      >
        {label}
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Link>
      {note && <p className="text-xs font-semibold text-brand-green-ink">{note}</p>}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string | undefined }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary-soft px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
      {children}
    </span>
  );
}

export function Blobs() {
  return (
    <>
      <div className="pointer-events-none absolute -top-20 left-[10%] h-[460px] w-[460px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-[5%] h-[380px] w-[380px] rounded-full bg-brand-green/10 blur-[110px]" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
    </>
  );
}
