export function PlanCard() {
  return (
    <div className="py-7 px-10" style={{ borderBottom: '2px solid var(--color-text)' }}>
      <div className="text-[11px] font-bold uppercase mb-4" style={{ letterSpacing: '0.14em', color: 'var(--color-neutral-600)' }}>
        Plano e cobrança
      </div>
      <div className="flex items-center justify-between max-w-md p-5" style={{ border: '2px solid var(--color-text)', background: 'var(--color-neutral-100)' }}>
        <div>
          <div className="text-lg font-black">Profissional</div>
          <div className="text-[13px] mt-1" style={{ color: 'var(--color-neutral-700)' }}>R$ 199/mês · renova em 12/08/2026</div>
        </div>
        <button
          className="text-sm font-bold py-2.5 px-4 cursor-pointer whitespace-nowrap"
          style={{ border: '2px solid var(--color-text)', background: 'transparent', color: 'var(--color-text)' }}
        >
          Gerenciar assinatura
        </button>
      </div>
    </div>
  );
}
