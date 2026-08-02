"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirm) { setError("Senhas não conferem"); return; }
    if (password.length < 6) { setError("Senha deve ter no mínimo 6 caracteres"); return; }

    setLoading(true);
    try {
      await signUp(email, password);
      setSuccess("Conta criada! Verifique seu email para confirmar o cadastro.");
      // opcional: criar perfil no banco com o nome
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-sm">
        <div className="p-8" style={{ background: "var(--color-surface)", border: "2px solid var(--color-divider)" }}>
          <h1 className="text-xl mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, color: "var(--color-text)" }}>
            Criar conta
          </h1>
          <p className="text-xs mb-6" style={{ color: "var(--color-neutral-600)" }}>
            Comece a monitorar licitações em 2 minutos
          </p>

          {success ? (
            <div className="text-center">
              <div className="text-3xl mb-3">📧</div>
              <p className="text-sm mb-2" style={{ color: "#155724", fontFamily: "var(--font-heading)", fontWeight: 800 }}>
                Verifique seu email
              </p>
              <p className="text-xs mb-4" style={{ color: "#155724" }}>
                Enviamos um link de confirmação para <strong>{email}</strong>. Clique no link para ativar sua conta.
              </p>
              <p className="text-xs" style={{ color: "var(--color-neutral-500)" }}>
                Não recebeu? Verifique o spam ou{" "}
                <button onClick={() => { setSuccess(""); setError(""); }} style={{ color: "var(--color-accent)", fontWeight: 800 }}>
                  tente novamente
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Nome</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required
                  className="w-full px-3 py-2 text-sm"
                  style={{ background: "var(--color-bg)", border: "2px solid var(--color-divider)", color: "var(--color-text)" }} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full px-3 py-2 text-sm"
                  style={{ background: "var(--color-bg)", border: "2px solid var(--color-divider)", color: "var(--color-text)" }} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Senha</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-3 py-2 text-sm"
                  style={{ background: "var(--color-bg)", border: "2px solid var(--color-divider)", color: "var(--color-text)" }} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Confirmar senha</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                  className="w-full px-3 py-2 text-sm"
                  style={{ background: "var(--color-bg)", border: "2px solid var(--color-divider)", color: "var(--color-text)" }} />
              </div>

              {error && <p className="text-xs" style={{ color: "var(--color-accent)" }}>{error}</p>}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Criando..." : "Criar conta"}
              </Button>
            </form>
          )}

          <p className="text-xs mt-4 text-center" style={{ color: "var(--color-neutral-500)" }}>
            Já tem conta?{" "}
            <Link href="/login" style={{ color: "var(--color-accent)", fontWeight: 800 }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
