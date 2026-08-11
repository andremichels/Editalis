'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { AuthGuard } from '@/components/AuthGuard';
import { authFetch } from '@/lib/api';
import { Check, XCircle, ArrowRight } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

export default function ConvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'already'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) return;
    authFetch(`${API_BASE}/api/v1/account/team/accept/${token}`, { method: 'POST' })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
        } else if (data.detail?.includes('expirado')) {
          setStatus('expired');
        } else if (data.detail?.includes('já aceito')) {
          setStatus('already');
        } else {
          setStatus('error');
          setErrorMsg(data.detail || 'Erro ao aceitar convite');
        }
      })
      .catch(() => {
        setStatus('error');
        setErrorMsg('Erro de conexão');
      });
  }, [token]);

  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center max-w-md px-6 py-14">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full skeleton" />
              <div className="h-6 w-48 mx-auto skeleton mb-3" />
              <div className="h-4 w-64 mx-auto skeleton" />
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ background: '#d4edda' }}>
                <Check className="w-8 h-8" style={{ color: '#155724' }} />
              </div>
              <h1 className="text-[28px] font-black tracking-[-0.03em] mb-3"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                Convite aceito!
              </h1>
              <p className="text-base mb-8" style={{ color: 'var(--color-neutral-700)' }}>
                Você agora faz parte da organização. Acesse o painel para começar.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-bold cursor-pointer"
                style={{ background: 'var(--color-accent)', color: '#fff', border: 'none' }}
              >
                Ir para o painel <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {(status === 'error' || status === 'expired' || status === 'already') && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ background: '#f8d7da' }}>
                <XCircle className="w-8 h-8" style={{ color: '#721c24' }} />
              </div>
              <h1 className="text-[28px] font-black tracking-[-0.03em] mb-3"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                {status === 'expired' ? 'Convite expirado' : status === 'already' ? 'Já aceito' : 'Erro'}
              </h1>
              <p className="text-base mb-8" style={{ color: 'var(--color-neutral-700)' }}>
                {errorMsg || 'Não foi possível processar o convite.'}
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-7 py-3.5 text-base font-bold cursor-pointer"
                style={{ background: 'transparent', border: '2px solid var(--color-text)', color: 'var(--color-text)' }}
              >
                Voltar ao painel
              </button>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
