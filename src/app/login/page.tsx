"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-sm">
        <div className="p-8" style={{ background: "var(--color-surface)", border: "2px solid var(--color-divider)" }}>
          <h1 className="text-xl mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, color: "var(--color-text)" }}>
            Entrar
          </h1>
          <p className="text-xs mb-6" style={{ color: "var(--color-neutral-600)" }}>
            Acesse sua conta no Editalis
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-3 py-2 text-sm"
                style={{ background: "var(--color-bg)", border: "2px solid var(--color-divider)", color: "var(--color-text)" }}
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Senha</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-3 py-2 text-sm"
                style={{ background: "var(--color-bg)", border: "2px solid var(--color-divider)", color: "var(--color-text)" }}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-xs" style={{ color: "var(--color-accent)" }}>{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="text-xs mt-4 text-center" style={{ color: "var(--color-neutral-500)" }}>
            Não tem conta?{" "}
            <Link href="/cadastro" style={{ color: "var(--color-accent)", fontWeight: 800 }}>
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
