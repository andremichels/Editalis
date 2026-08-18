import type { Metadata } from 'next';
import { LandingPage } from '@/components/marketing/LandingPage';

export const metadata: Metadata = {
  title: 'Licitações de limpeza e facilities — Editalis',
  description:
    'Nunca mais perca um edital de facilities. Monitor de licitações para limpeza, conservação, vigilância, portaria e serviços gerais.',
};

export default function LimpezaPage() {
  return <LandingPage variant="limpeza" />;
}
