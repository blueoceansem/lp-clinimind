import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/site/common";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade | CliniMind" },
      { name: "description", content: "Como a CliniMind trata os contatos informados no roteiro de estudo." },
      { property: "og:title", content: "Política de privacidade | CliniMind" },
      { property: "og:description", content: "Como a CliniMind trata os contatos informados no roteiro de estudo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <div className="min-h-screen bg-background px-5 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-card">
        <Link to="/"><Logo /></Link>
        <h1 className="mt-6 text-2xl font-bold">Política de privacidade</h1>
        <p className="mt-4 text-sm text-muted-foreground">Texto provisório. A política de privacidade oficial da CliniMind será publicada aqui antes da veiculação dos anúncios.</p>
      </div>
    </div>
  ),
});
