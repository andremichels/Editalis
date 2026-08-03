export interface AlertProfile {
  name: string;
  query: string;
  channels: string[];
  newCount: number;
  active: boolean;
}

export const alertProfiles: AlertProfile[] = [
  {
    name: 'Obras civis SP/MG',
    query: '("reforma" OU "ampliação") E uf:SP,MG E valor:>500000',
    channels: ['E-mail + WhatsApp', 'Diário 06h30'],
    newCount: 18,
    active: true,
  },
  {
    name: 'Manutenção predial',
    query: '"manutenção predial" NÃO "hospitalar"',
    channels: ['E-mail', 'Diário 06h30'],
    newCount: 11,
    active: true,
  },
  {
    name: 'Reformas escolares',
    query: '"escola" E ("reforma" OU "cobertura") E uf:SP',
    channels: ['App', 'Tempo real'],
    newCount: 8,
    active: false,
  },
];

export const favoritasDestaque = [
  { bidId: 1, prazo: 'abre em 2 dias', urgente: true },
  { bidId: 3, prazo: 'abre em 6 dias', urgente: false },
  { bidId: 4, prazo: 'abre em 8 dias', urgente: false },
  { bidId: 5, prazo: 'abre em 12 dias', urgente: false },
];
