import type { Metadata } from 'next';
import { LandingPage } from '@/components/marketing/LandingPage';

export const metadata: Metadata = {
  title: 'Licitações de obras — Editalis',
  description:
    'Nunca mais perca uma obra pública. Monitor de licitações para construtoras e engenharia: obras, infraestrutura e manutenção predial.',
};

export default function ConstrucaoPage() {
  return <LandingPage variant="construcao" />;
}
