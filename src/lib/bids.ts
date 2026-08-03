export interface Lote {
  numero: string;
  descricao: string;
  valor: string;
}

export interface AndamentoStep {
  label: string;
  date: string;
  state: 'done' | 'current' | 'pending';
}

export interface Bid {
  id: number;
  modalidade: string;
  situacao: 'Aberta' | 'Suspensa';
  numero: string;
  processo: string;
  orgao: string;
  secretaria?: string;
  municipio: string;
  uf: string;
  objeto: string;
  objetoDescricao: string;
  valor: string;
  abertura: string;
  aberturaCompleta: string;
  publicadoEm: string;
  publicadoCompleto: string;
  impugnacao: string;
  regime: string;
  lotes: Lote[];
  publicacaoOriginal: { fonte: string; texto: string };
  andamento: AndamentoStep[];
  historicoOrgao: string;
  favoritaPadrao: boolean;
}

export const bids: Bid[] = [
  {
    id: 1,
    modalidade: 'Pregão eletrônico',
    situacao: 'Aberta',
    numero: '114/2026',
    processo: '2026.0091.443',
    orgao: 'Prefeitura Municipal de Campinas',
    secretaria: 'Secretaria de Educação',
    municipio: 'Campinas',
    uf: 'SP',
    objeto: 'Contratação de empresa para reforma e ampliação de quatro unidades escolares da rede municipal',
    objetoDescricao: 'Reforma geral com substituição de cobertura, instalações elétricas e hidráulicas, adequação de acessibilidade e ampliação de blocos de salas de aula em quatro unidades escolares, conforme projeto básico e memorial descritivo anexos ao edital.',
    valor: 'R$ 2.480.000',
    abertura: '01/08',
    aberturaCompleta: '01/08/2026 09h00',
    publicadoEm: '28/07',
    publicadoCompleto: '28/07/2026',
    impugnacao: '29/07/2026',
    regime: 'Empreitada global',
    lotes: [
      { numero: '01', descricao: 'EMEF Vila União — reforma e cobertura', valor: 'R$ 812.400,00' },
      { numero: '02', descricao: 'EMEF Jardim Paulista — ampliação de 4 salas', valor: 'R$ 968.100,00' },
      { numero: '03', descricao: 'CEI Novo Horizonte — acessibilidade', valor: 'R$ 421.900,00' },
      { numero: '04', descricao: 'EMEF Campo Belo — instalações elétricas', valor: 'R$ 277.600,00' },
    ],
    publicacaoOriginal: {
      fonte: 'Diário Oficial do Município de Campinas · 28/07/2026 · pág. 14',
      texto: '"AVISO DE LICITAÇÃO — PREGÃO ELETRÔNICO Nº 114/2026. Objeto: contratação de empresa especializada para execução de reforma e ampliação de unidades escolares. Sessão pública em 01/08/2026 às 09h00, no portal de compras. Edital disponível no sítio oficial…"',
    },
    andamento: [
      { label: 'Aviso publicado', date: '28/07/2026', state: 'done' },
      { label: 'Sessão pública', date: '01/08/2026 · em 2 dias', state: 'current' },
      { label: 'Homologação', date: 'prevista', state: 'pending' },
    ],
    historicoOrgao: '142 licitações de obras nos últimos 24 meses · valor médio homologado R$ 1,7 mi · 68% adjudicadas.',
    favoritaPadrao: true,
  },
  {
    id: 2,
    modalidade: 'Concorrência',
    situacao: 'Aberta',
    numero: '07/2026',
    processo: '2026.0044.210',
    orgao: 'DER-MG',
    secretaria: 'Diretoria de Engenharia',
    municipio: 'Belo Horizonte',
    uf: 'MG',
    objeto: 'Recuperação de pavimento e drenagem em 42 km de rodovia estadual',
    objetoDescricao: 'Recuperação funcional do pavimento asfáltico, reconstrução do sistema de drenagem superficial e sinalização horizontal e vertical ao longo de 42 km da rodovia estadual, conforme projeto executivo e memorial descritivo anexos ao edital.',
    valor: 'R$ 14.900.000',
    abertura: '03/08',
    aberturaCompleta: '03/08/2026 10h00',
    publicadoEm: '28/07',
    publicadoCompleto: '28/07/2026',
    impugnacao: '31/07/2026',
    regime: 'Empreitada por preço unitário',
    lotes: [
      { numero: '01', descricao: 'Trecho km 0–14 — pavimentação', valor: 'R$ 5.100.000,00' },
      { numero: '02', descricao: 'Trecho km 14–28 — drenagem', valor: 'R$ 4.600.000,00' },
      { numero: '03', descricao: 'Trecho km 28–42 — pavimentação e sinalização', valor: 'R$ 5.200.000,00' },
    ],
    publicacaoOriginal: {
      fonte: 'Diário Oficial de Minas Gerais · 28/07/2026 · pág. 22',
      texto: '"AVISO DE LICITAÇÃO — CONCORRÊNCIA Nº 07/2026. Objeto: contratação de empresa para recuperação de pavimento e drenagem em rodovia estadual. Sessão pública em 03/08/2026 às 10h00. Edital disponível no portal de compras…"',
    },
    andamento: [
      { label: 'Aviso publicado', date: '28/07/2026', state: 'done' },
      { label: 'Sessão pública', date: '03/08/2026 · em 4 dias', state: 'current' },
      { label: 'Homologação', date: 'prevista', state: 'pending' },
    ],
    historicoOrgao: '58 licitações de obras rodoviárias nos últimos 24 meses · valor médio homologado R$ 9,4 mi · 61% adjudicadas.',
    favoritaPadrao: false,
  },
  {
    id: 3,
    modalidade: 'Dispensa',
    situacao: 'Aberta',
    numero: '22/2026',
    processo: '2026.0027.118',
    orgao: 'Universidade Federal de Minas Gerais',
    secretaria: 'Prefeitura Universitária',
    municipio: 'Belo Horizonte',
    uf: 'MG',
    objeto: 'Serviços continuados de manutenção predial em campus universitário',
    objetoDescricao: 'Prestação de serviços continuados de manutenção predial preventiva e corretiva, incluindo elétrica, hidráulica e civil, nas edificações do campus, conforme termo de referência anexo ao edital.',
    valor: 'R$ 386.500',
    abertura: '05/08',
    aberturaCompleta: '05/08/2026 14h00',
    publicadoEm: '27/07',
    publicadoCompleto: '27/07/2026',
    impugnacao: '01/08/2026',
    regime: 'Preço global',
    lotes: [
      { numero: '01', descricao: 'Manutenção elétrica', valor: 'R$ 156.200,00' },
      { numero: '02', descricao: 'Manutenção hidráulica', valor: 'R$ 118.300,00' },
      { numero: '03', descricao: 'Manutenção civil', valor: 'R$ 112.000,00' },
    ],
    publicacaoOriginal: {
      fonte: 'Diário Oficial da União · 27/07/2026 · seção 3, pág. 88',
      texto: '"AVISO DE DISPENSA Nº 22/2026. Objeto: contratação de empresa para manutenção predial continuada em campus universitário. Proposta até 05/08/2026 às 14h00…"',
    },
    andamento: [
      { label: 'Aviso publicado', date: '27/07/2026', state: 'done' },
      { label: 'Recebimento de propostas', date: '05/08/2026 · em 6 dias', state: 'current' },
      { label: 'Homologação', date: 'prevista', state: 'pending' },
    ],
    historicoOrgao: '34 dispensas de serviços continuados nos últimos 24 meses · valor médio homologado R$ 410 mil · 74% adjudicadas.',
    favoritaPadrao: true,
  },
  {
    id: 4,
    modalidade: 'Pregão eletrônico',
    situacao: 'Aberta',
    numero: '201/2026',
    processo: '2026.0038.552',
    orgao: 'Tribunal de Justiça de São Paulo',
    secretaria: 'Secretaria de Infraestrutura',
    municipio: 'São Paulo',
    uf: 'SP',
    objeto: 'Execução de reforma da sede administrativa e adequação de acessibilidade',
    objetoDescricao: 'Execução de obras de reforma da sede administrativa, incluindo adequação de rotas de acessibilidade, substituição de esquadrias e modernização de instalações elétricas, conforme projeto básico anexo ao edital.',
    valor: 'R$ 1.120.000',
    abertura: '07/08',
    aberturaCompleta: '07/08/2026 09h30',
    publicadoEm: '27/07',
    publicadoCompleto: '27/07/2026',
    impugnacao: '04/08/2026',
    regime: 'Empreitada global',
    lotes: [
      { numero: '01', descricao: 'Adequação de acessibilidade', valor: 'R$ 480.000,00' },
      { numero: '02', descricao: 'Esquadrias', valor: 'R$ 340.000,00' },
      { numero: '03', descricao: 'Instalações elétricas', valor: 'R$ 300.000,00' },
    ],
    publicacaoOriginal: {
      fonte: 'Diário da Justiça Eletrônico · 27/07/2026 · pág. 31',
      texto: '"AVISO DE LICITAÇÃO — PREGÃO ELETRÔNICO Nº 201/2026. Objeto: contratação de empresa para reforma da sede administrativa. Sessão pública em 07/08/2026 às 09h30…"',
    },
    andamento: [
      { label: 'Aviso publicado', date: '27/07/2026', state: 'done' },
      { label: 'Sessão pública', date: '07/08/2026 · em 8 dias', state: 'current' },
      { label: 'Homologação', date: 'prevista', state: 'pending' },
    ],
    historicoOrgao: '27 licitações de obras nos últimos 24 meses · valor médio homologado R$ 980 mil · 70% adjudicadas.',
    favoritaPadrao: false,
  },
  {
    id: 5,
    modalidade: 'Concorrência',
    situacao: 'Aberta',
    numero: '15/2026',
    processo: '2026.0019.847',
    orgao: 'Secretaria Municipal de Saúde',
    municipio: 'Campinas',
    uf: 'SP',
    objeto: 'Construção de unidade básica de saúde no distrito de Sousas',
    objetoDescricao: 'Construção de nova unidade básica de saúde, incluindo fundação, estrutura, instalações prediais completas e equipamentos, conforme projeto básico e memorial descritivo anexos ao edital.',
    valor: 'R$ 5.740.000',
    abertura: '11/08',
    aberturaCompleta: '11/08/2026 09h00',
    publicadoEm: '26/07',
    publicadoCompleto: '26/07/2026',
    impugnacao: '06/08/2026',
    regime: 'Empreitada global',
    lotes: [
      { numero: '01', descricao: 'Fundação e estrutura', valor: 'R$ 2.200.000,00' },
      { numero: '02', descricao: 'Instalações prediais', valor: 'R$ 1.940.000,00' },
      { numero: '03', descricao: 'Acabamentos e equipamentos', valor: 'R$ 1.600.000,00' },
    ],
    publicacaoOriginal: {
      fonte: 'Diário Oficial do Município de Campinas · 26/07/2026 · pág. 19',
      texto: '"AVISO DE LICITAÇÃO — CONCORRÊNCIA Nº 15/2026. Objeto: construção de unidade básica de saúde no distrito de Sousas. Sessão pública em 11/08/2026 às 09h00…"',
    },
    andamento: [
      { label: 'Aviso publicado', date: '26/07/2026', state: 'done' },
      { label: 'Sessão pública', date: '11/08/2026 · em 12 dias', state: 'current' },
      { label: 'Homologação', date: 'prevista', state: 'pending' },
    ],
    historicoOrgao: '19 licitações de unidades de saúde nos últimos 24 meses · valor médio homologado R$ 4,2 mi · 63% adjudicadas.',
    favoritaPadrao: false,
  },
  {
    id: 6,
    modalidade: 'Pregão eletrônico',
    situacao: 'Suspensa',
    numero: '88/2026',
    processo: '2026.0052.339',
    orgao: 'Prefeitura de Ribeirão Preto',
    secretaria: 'Secretaria de Serviços Públicos',
    municipio: 'Ribeirão Preto',
    uf: 'SP',
    objeto: 'Serviços de engenharia para modernização de iluminação pública',
    objetoDescricao: 'Modernização do parque de iluminação pública com substituição de luminárias por tecnologia LED e implantação de sistema de telegestão, conforme termo de referência anexo ao edital.',
    valor: 'R$ 3.260.000',
    abertura: '14/08',
    aberturaCompleta: '14/08/2026 09h00',
    publicadoEm: '25/07',
    publicadoCompleto: '25/07/2026',
    impugnacao: '—',
    regime: 'Empreitada global',
    lotes: [
      { numero: '01', descricao: 'Substituição de luminárias', valor: 'R$ 2.100.000,00' },
      { numero: '02', descricao: 'Sistema de telegestão', valor: 'R$ 780.000,00' },
      { numero: '03', descricao: 'Manutenção por 12 meses', valor: 'R$ 380.000,00' },
    ],
    publicacaoOriginal: {
      fonte: 'Diário Oficial do Município de Ribeirão Preto · 25/07/2026 · pág. 9',
      texto: '"AVISO DE SUSPENSÃO — PREGÃO ELETRÔNICO Nº 88/2026. Objeto: modernização de iluminação pública. Sessão pública suspensa para reanálise do edital…"',
    },
    andamento: [
      { label: 'Aviso publicado', date: '25/07/2026', state: 'done' },
      { label: 'Sessão pública suspensa', date: '14/08/2026', state: 'pending' },
      { label: 'Homologação', date: 'prevista', state: 'pending' },
    ],
    historicoOrgao: '21 licitações de iluminação pública nos últimos 24 meses · valor médio homologado R$ 2,8 mi · 55% adjudicadas.',
    favoritaPadrao: false,
  },
];

export function getBidById(id: number): Bid | undefined {
  return bids.find((b) => b.id === id);
}
