'use client';

import { useState } from 'react';
import { FormField } from '@/components/ui/FormField';

export interface Cnae {
  codigo: string;
  descricao: string;
}

export interface CompanyData {
  razao_social: string;
  cnpj: string;
  inscricao_municipal: string;
  cep: string;
  cidade_uf: string;
  email_nota_fiscal: string;
}

const sectionLabel = 'text-[11px] font-bold uppercase';
const sectionLabelStyle = { letterSpacing: '0.14em', color: 'var(--color-neutral-600)' };

const DOCS = [
  { tipo: 'CND Federal' },
  { tipo: 'CRF / FGTS' },
  { tipo: 'Certidão trabalhista' },
];

interface EmpresaTabProps {
  company: CompanyData;
  onCompanyChange: (c: CompanyData) => void;
  onSaveCompany: () => void;
  cnaes: Cnae[];
  onAddCnae: (c: Cnae) => void;
  onRemoveCnae: (codigo: string) => void;
}

export function EmpresaTab({ company, onCompanyChange, onSaveCompany, cnaes, onAddCnae, onRemoveCnae }: EmpresaTabProps) {
  const [cnaeCodigo, setCnaeCodigo] = useState('');
  const [cnaeDescricao, setCnaeDescricao] = useState('');

  const addCnae = () => {
    if (!cnaeCodigo.trim() || !cnaeDescricao.trim()) return;
    onAddCnae({ codigo: cnaeCodigo.trim(), descricao: cnaeDescricao.trim() });
    setCnaeCodigo('');
    setCnaeDescricao('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="py-8 px-10 min-w-0" style={{ borderRight: '2px solid var(--color-text)' }}>
        <div className={`${sectionLabel} mb-5`} style={sectionLabelStyle}>Dados cadastrais</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[640px]">
          <div className="sm:col-span-2">
            <FormField label="Razão social" value={company.razao_social} onChange={(e) => onCompanyChange({ ...company, razao_social: e.target.value })} />
          </div>
          <FormField label="CNPJ" value={company.cnpj} onChange={(e) => onCompanyChange({ ...company, cnpj: e.target.value })} placeholder="00.000.000/0001-00" />
          <FormField label="Inscrição municipal" value={company.inscricao_municipal} onChange={(e) => onCompanyChange({ ...company, inscricao_municipal: e.target.value })} />
          <FormField label="CEP" value={company.cep} onChange={(e) => onCompanyChange({ ...company, cep: e.target.value })} />
          <FormField label="Cidade / UF" value={company.cidade_uf} onChange={(e) => onCompanyChange({ ...company, cidade_uf: e.target.value })} placeholder="Campinas / SP" />
          <div className="sm:col-span-2">
            <FormField label="E-mail para nota fiscal" type="email" value={company.email_nota_fiscal} onChange={(e) => onCompanyChange({ ...company, email_nota_fiscal: e.target.value })} />
          </div>
        </div>

        <div className="mt-8 pt-7 max-w-[640px]" style={{ borderTop: '2px solid var(--color-text)' }}>
          <div className={`${sectionLabel} mb-4`} style={sectionLabelStyle}>CNAEs de atuação</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {cnaes.map((c) => (
              <span key={c.codigo} className="text-[13px] font-bold py-2 px-3 flex items-center gap-2" style={{ border: '2px solid var(--color-accent)', color: 'var(--color-accent-700)' }}>
                {c.codigo} · {c.descricao}
                <button onClick={() => onRemoveCnae(c.codigo)} className="cursor-pointer" style={{ color: 'var(--color-accent-700)' }}>×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={cnaeCodigo}
              onChange={(e) => setCnaeCodigo(e.target.value)}
              placeholder="41.20-4"
              className="w-32 px-3 py-2.5 text-sm"
              style={{ border: '1px solid var(--color-neutral-400)', background: 'var(--color-neutral-100)' }}
            />
            <input
              value={cnaeDescricao}
              onChange={(e) => setCnaeDescricao(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCnae()}
              placeholder="Construção de edifícios"
              className="flex-1 px-3 py-2.5 text-sm"
              style={{ border: '1px solid var(--color-neutral-400)', background: 'var(--color-neutral-100)' }}
            />
            <button onClick={addCnae} className="px-4 text-sm font-bold cursor-pointer shrink-0" style={{ border: '1px dashed var(--color-neutral-500)', color: 'var(--color-neutral-700)' }}>
              + adicionar
            </button>
          </div>
          <p className="text-[13px] mt-3.5 max-w-[560px] leading-[1.55]" style={{ color: 'var(--color-neutral-700)' }}>
            Os CNAEs alimentam a sugestão automática de licitações compatíveis no painel.
          </p>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onSaveCompany}
            className="text-left py-3.5 px-6 text-[15px] font-bold cursor-pointer"
            style={{ background: 'var(--color-accent)', border: '2px solid var(--color-accent)', color: '#fff' }}
          >
            Salvar dados da empresa
          </button>
        </div>
      </div>

      <div>
        <div className="p-6" style={{ borderBottom: '2px solid var(--color-text)' }}>
          <div className={`${sectionLabel} mb-3`} style={sectionLabelStyle}>Situação cadastral</div>
          <p className="text-sm" style={{ color: 'var(--color-neutral-700)' }}>Ainda não verificamos seu CNPJ na Receita Federal.</p>
        </div>
        <div className="p-6">
          <div className={`${sectionLabel} mb-3.5`} style={sectionLabelStyle}>Documentos de habilitação</div>
          <div className="text-sm">
            {DOCS.map((d, i) => (
              <div key={d.tipo} className="flex justify-between py-3" style={{ borderBottom: i < DOCS.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
                <span>{d.tipo}</span>
                <span style={{ color: 'var(--color-neutral-500)' }}>não configurado</span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-3.5" style={{ color: 'var(--color-neutral-600)' }}>Em breve.</p>
        </div>
      </div>
    </div>
  );
}
