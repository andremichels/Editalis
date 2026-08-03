export function AuthPromoPanel() {
  return (
    <div
      className="hidden lg:flex flex-col justify-between px-14 py-16"
      style={{ background: 'var(--color-accent)', color: '#fff' }}
    >
      <div className="text-[22px] font-black tracking-[-0.03em]" style={{ fontFamily: 'var(--font-heading)' }}>
        EDITALIS
      </div>
      <div>
        <h2 className="text-[52px] font-black leading-none tracking-[-0.035em] mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
          1.284 novas licitações desde ontem.
        </h2>
        <p className="text-[17px] leading-[1.55] max-w-[420px]" style={{ color: 'var(--color-accent-200)' }}>
          Entre para ver as que casam com o seu perfil de captação, os prazos que fecham esta semana e suas favoritas.
        </p>
      </div>
      <div className="text-[13px]" style={{ color: 'var(--color-accent-300)' }}>
        Ambiente seguro · dados públicos oficiais
      </div>
    </div>
  );
}
