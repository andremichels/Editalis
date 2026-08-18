import type { Metadata } from 'next';
import { LandingPage } from '@/components/marketing/LandingPage';

export const metadata: Metadata = {
  title: 'Licitações de alimentação — Editalis',
  description:
    'Nunca mais perca um edital de alimentação. Monitor de licitações para alimentação e distribuidoras: gêneros alimentícios, merenda escolar e refeições.',
};

export default function AlimentacaoPage() {
  return <LandingPage variant="alimentacao" />;
}
