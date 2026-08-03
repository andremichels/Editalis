const preferences = [
  'Resumo diário por e-mail às 06h30',
  'WhatsApp para aberturas em até 48h',
  'Notificação no app em tempo real',
  'Não enviar aos fins de semana',
];

export function SendPreferences() {
  return (
    <div className="mt-8 p-6" style={{ border: '2px solid var(--color-text)', background: 'var(--color-neutral-100)' }}>
      <div className="text-[15px] font-extrabold mb-4">Preferências de envio</div>
      <div className="flex flex-col gap-3 text-sm">
        {preferences.map((label) => (
          <label key={label} className="flex justify-between items-center cursor-pointer">
            <span>{label}</span>
            <input type="checkbox" className="w-[18px] h-[18px]" style={{ accentColor: 'var(--color-accent)' }} />
          </label>
        ))}
      </div>
    </div>
  );
}
