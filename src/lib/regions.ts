/** UFs agrupadas por região — para escolher "todo o Sul" com um clique. */
export const REGIONS: { name: string; ufs: string[] }[] = [
  { name: 'Norte', ufs: ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO'] },
  { name: 'Nordeste', ufs: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'] },
  { name: 'Centro-Oeste', ufs: ['DF', 'GO', 'MS', 'MT'] },
  { name: 'Sudeste', ufs: ['ES', 'MG', 'RJ', 'SP'] },
  { name: 'Sul', ufs: ['PR', 'RS', 'SC'] },
];

export const ALL_UFS = REGIONS.flatMap((r) => r.ufs).sort();
