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
