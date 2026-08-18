import type { Metadata } from 'next';
import { LandingPage } from '@/components/marketing/LandingPage';

export const metadata: Metadata = {
  title: 'Licitações de saúde — Editalis',
  description:
    'Nunca mais perca um edital de saúde. Monitor de licitações para saúde, hospitais e laboratórios: medicamentos, equipamentos e serviços.',
};

export default function SaudePage() {
  return <LandingPage variant="saude" />;
}
