import type { Metadata } from 'next';
import { LandingPage } from '@/components/marketing/LandingPage';

export const metadata: Metadata = {
  title: 'Licitações de tecnologia — Editalis',
  description:
    'Nunca mais perca um edital de tecnologia. Monitor de licitações para empresas de TI: software, cloud, dados, infraestrutura e equipamentos.',
};

export default function TecnologiaPage() {
  return <LandingPage variant="tecnologia" />;
}
