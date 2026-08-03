import type { Bid } from '@/lib/bids';

const sectionLabel = 'text-[11px] font-bold uppercase mb-3.5';
const sectionLabelStyle = { letterSpacing: '0.14em', color: 'var(--color-neutral-600)' };

export function BidObjectSection({ bid }: { bid: Bid }) {
  return (
    <div className="py-8 px-10 min-w-0" style={{ borderRight: '2px solid var(--color-text)' }}>
      <div className={sectionLabel} style={sectionLabelStyle}>Objeto</div>
      <p className="text-base leading-[1.6] mb-8" style={{ color: 'var(--color-neutral-900)' }}>{bid.objetoDescricao}</p>

      <div className={sectionLabel} style={sectionLabelStyle}>Itens e lotes</div>
      <table className="w-full border-collapse text-sm mb-8">
        <thead>
          <tr className="text-left" style={{ borderTop: '2px solid var(--color-text)', borderBottom: '2px solid var(--color-text)' }}>
            <th className="py-2.5 font-extrabold">Lote</th>
            <th className="py-2.5 font-extrabold">Descrição</th>
            <th className="py-2.5 font-extrabold text-right">Valor estimado</th>
          </tr>
        </thead>
        <tbody>
          {bid.lotes.map((lote, i) => (
            <tr key={lote.numero} style={{ borderBottom: i === bid.lotes.length - 1 ? '2px solid var(--color-text)' : '1px solid var(--color-divider)' }}>
              <td className="py-3">{lote.numero}</td>
              <td className="py-3">{lote.descricao}</td>
              <td className="py-3 text-right font-bold">{lote.valor}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={sectionLabel} style={sectionLabelStyle}>Publicação original</div>
      <div className="p-5 text-sm leading-[1.7]" style={{ border: '2px solid var(--color-text)', background: 'var(--color-neutral-100)', color: 'var(--color-neutral-800)' }}>
        <div className="font-extrabold mb-2" style={{ color: 'var(--color-text)' }}>{bid.publicacaoOriginal.fonte}</div>
        {bid.publicacaoOriginal.texto}
      </div>
    </div>
  );
}
