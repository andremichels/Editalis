// Tipos compartilhados — matching DOU Scrapper API response
export interface Article {
  id: number;
  slug: string;
  title: string;
  title_marker?: string;
  content: string;
  published_date: string;
  edition?: string;
  section?: string;
  page?: string;
  organ?: string;
  organ_level_1?: string;
  organ_level_2?: string;
  organ_level_3?: string;
  created_at?: string;
  excerpt?: string;
  normalized_data?: NormalizedData;
}

export interface SearchResponse {
  articles: Article[];
  total?: number;
}

export interface Organ {
  organ: string;
  count: number;
}

export interface Vertical {
  id: number;
  slug: string;
  name: string;
  description?: string;
  keywords?: string[];
  cnaes?: string[];
}

export interface Processo {
  id: number;
  numero: string;
  numero_canonical: string;
  organ?: string;
  objeto?: string;
  modalidade?: string;
  valor?: number;
  data_abertura?: string;
  uf?: string;
  data_primeira_publicacao?: string;
  data_ultima_publicacao?: string;
  total_artigos?: number;
  keywords?: string[];
  status?: string;
  timeline?: ProcessoAto[];
}

export interface ProcessoAto {
  article_id: number;
  slug?: string;
  title?: string;
  published_date?: string;
  doc_type?: string;
  modality?: string;
  value?: number;
  opening_date?: string;
  organ?: string;
}

export interface NormalizedData {
  doc_type?: string;
  modality?: string;
  process_number?: string;
  object_summary?: string;
  value?: number;
  opening_date?: string;
  cnpjs?: string[];
  ufs?: string[];
  keywords?: string[];
  organ_normalized?: string;
  contract_number?: string;
  summary?: string;
}
