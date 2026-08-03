"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "cadastro">("login");
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-md">
        {/* Tabs */}
        <div className="flex mb-0" style={{ borderBottom: "2px solid var(--color-text)", background: "var(--color-surface)" }}>
          <button onClick={() => setTab("login")} className="flex-1 py-4 text-sm font-bold text-center"
            style={{ borderBottom: tab === "login" ? "3px solid var(--color-accent)" : "3px solid transparent", color: tab === "login" ? "var(--color-text)" : "var(--color-neutral-500)" }}>
            Entrar
          </button>
          <button onClick={() => setTab("cadastro")} className="flex-1 py-4 text-sm font-bold text-center"
            style={{ borderBottom: tab === "cadastro" ? "3px solid var(--color-accent)" : "3px solid transparent", color: tab === "cadastro" ? "var(--color-text)" : "var(--color-neutral-500)" }}>
            Criar conta
          </button>
        </div>

        <div className="p-8" style={{ background: "var(--color-surface)", border: "2px solid var(--color-text)", borderTop: "none" }}>
          {tab === "login" ? <LoginForm /> : <CadastroForm />}
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    else router.push("/dashboard");
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 900, letterSpacing: "-0.02em" }}>Entrar</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: "var(--color-neutral-600)" }}>E-mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full px-4 py-3 text-sm" style={{ background: "var(--color-bg)", border: "2px solid var(--color-text)", color: "var(--color-text)" }} />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: "var(--color-neutral-600)" }}>Senha</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full px-4 py-3 text-sm" style={{ background: "var(--color-bg)", border: "2px solid var(--color-text)", color: "var(--color-text)" }} />
        </div>
        {error && <p className="text-xs" style={{ color: "var(--color-accent)" }}>{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</Button>
      </form>
      <p className="text-xs mt-4 text-center" style={{ color: "var(--color-neutral-500)" }}>
        Não tem conta? <button onClick={() => window.location.reload()} style={{ color: "var(--color-accent)", fontWeight: 700 }}>Criar conta</button>
      </p>
    </div>
  );
}

function CadastroForm() {
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aceito, setAceito] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Senha deve ter no mínimo 8 caracteres"); return; }
    if (!aceito) { setError("Você precisa aceitar os termos"); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({ email, password, options: { data: { nome, cnpj } } });
    if (err) setError(err.message);
    else router.push("/dashboard");
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 900, letterSpacing: "-0.02em" }}>Criar conta</h1>
      <p className="text-xs mb-6" style={{ color: "var(--color-neutral-600)" }}>7 dias de plano Profissional, sem cartão.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: "var(--color-neutral-600)" }}>Nome</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} required
            className="w-full px-4 py-3 text-sm" style={{ background: "var(--color-bg)", border: "2px solid var(--color-text)", color: "var(--color-text)" }} placeholder="Ana Ribeiro" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: "var(--color-neutral-600)" }}>CNPJ</label>
          <input type="text" value={cnpj} onChange={e => setCnpj(e.target.value)}
            className="w-full px-4 py-3 text-sm" style={{ background: "var(--color-bg)", border: "2px solid var(--color-text)", color: "var(--color-text)" }} placeholder="00.000.000/0001-00" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: "var(--color-neutral-600)" }}>E-mail corporativo</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full px-4 py-3 text-sm" style={{ background: "var(--color-bg)", border: "2px solid var(--color-text)", color: "var(--color-text)" }} placeholder="voce@empresa.com.br" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: "var(--color-neutral-600)" }}>Senha</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
            className="w-full px-4 py-3 text-sm" style={{ background: "var(--color-bg)", border: "2px solid var(--color-text)", color: "var(--color-text)" }} placeholder="mínimo 8 caracteres" />
        </div>
        <label className="flex items-start gap-2 cursor-pointer text-xs" style={{ color: "var(--color-neutral-600)" }}>
          <input type="checkbox" checked={aceito} onChange={e => setAceito(e.target.checked)} style={{ accentColor: "var(--color-accent)", marginTop: 2 }} />
          Li e aceito os <Link href="/termos" className="underline" style={{ color: "var(--color-accent)" }}>termos de uso</Link> e a <Link href="/privacidade" className="underline" style={{ color: "var(--color-accent)" }}>política de privacidade</Link> (LGPD).
        </label>
        {error && <p className="text-xs" style={{ color: "var(--color-accent)" }}>{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Criando..." : "Criar conta e escolher plano →"}
        </Button>
      </form>
    </div>
  );
}
