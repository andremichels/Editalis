import type { Metadata } from 'next';
import { LandingPage } from '@/components/marketing/LandingPage';

export const metadata: Metadata = {
  title: 'Licitações de comunicação — Editalis',
  description:
    'Nunca mais perca um edital de comunicação. Monitor de licitações para agências de publicidade e produtoras: publicidade, mídia, eventos, conteúdo e marketing.',
};

export default function ComunicacaoPage() {
  return <LandingPage variant="comunicacao" />;
}
