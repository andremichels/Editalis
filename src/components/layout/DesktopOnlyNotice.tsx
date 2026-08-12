export function DesktopOnlyNotice({ description }: { description?: string }) {
  return (
    <div className="lg:hidden py-20 px-8 text-center">
      <div className="text-4xl mb-4">💻</div>
      <h2 className="text-xl font-black mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
        Essa área funciona melhor no desktop
      </h2>
      <p className="text-sm max-w-[300px] mx-auto leading-[1.6]" style={{ color: 'var(--color-neutral-600)' }}>
        {description || 'Ainda não adaptamos essa tela pro celular — abra pelo computador pra uma experiência melhor.'}
      </p>
    </div>
  );
}
