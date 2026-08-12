import { Article, Organ, SearchResponse } from './types';
import { supabase } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://editalis-api.smartpeople.us';

/**
 * Fetch with Supabase JWT Bearer token.
 * Automatically gets the current session token and adds it to the Authorization header.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
}

// ── Stats ──

export interface PublicStats {
  total_articles: number;
  articles_today: number;
  articles_this_week: number;
  last_sync_at: string | null;
}

export async function getStats(): Promise<PublicStats> {
  const res = await fetch(`${API_BASE}/api/v1/stats`);
  if (!res.ok) throw new Error(`Stats failed: ${res.status}`);
  return res.json();
}

// ── Search ──

export async function searchArticles(params: {
  q: string;
  organ?: string;
  limit?: number;
  offset?: number;
  published_since?: string;
  published_until?: string;
  sort_by?: 'relevance' | 'date';
}): Promise<SearchResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set('q', params.q);
  if (params.organ) searchParams.set('organ', params.organ);
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));
  if (params.published_since) searchParams.set('published_since', params.published_since);
  if (params.published_until) searchParams.set('published_until', params.published_until);
  if (params.sort_by) searchParams.set('sort_by', params.sort_by);

  const res = await fetch(`${API_BASE}/api/v1/search?${searchParams}`);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const articles: Article[] = await res.json();
  return { articles };
}

export async function getArticle(slug: string): Promise<Article> {
  const res = await fetch(`${API_BASE}/api/v1/article/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error(`Article not found: ${res.status}`);
  return res.json();
}

export async function getRecentArticles(limit = 10, since?: string): Promise<Article[]> {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  if (since) params.set('since', since);
  const res = await fetch(`${API_BASE}/api/v1/recent?${params}`);
  if (!res.ok) throw new Error(`Recent failed: ${res.status}`);
  return res.json();
}

export async function getOrgans(query?: string): Promise<Organ[]> {
  const url = query
    ? `${API_BASE}/api/v1/organs?q=${encodeURIComponent(query)}`
    : `${API_BASE}/api/v1/organs`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

export async function searchByCNPJ(cnpj: string): Promise<SearchResponse> {
  const res = await fetch(`${API_BASE}/api/v1/search/cnpj/${cnpj.replace(/\D/g, '')}`);
  if (!res.ok) throw new Error(`CNPJ search failed: ${res.status}`);
  const articles: Article[] = await res.json();
  return { articles };
}

// ── Account / subscription ──
// See ACCOUNT_API.md — `portal`/`checkout` aren't implemented backend-side yet
// (404 until a payment provider is chosen), everything else is live.

export interface Subscription {
  plan: 'essencial' | 'profissional' | 'enterprise';
  plan_label: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled';
  billing_cycle: 'monthly' | 'annual';
  price_cents: number | null;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_ends_at: string | null;
  usage: {
    alert_profiles_used: number;
    alert_profiles_limit: number | null;
  };
}

export async function getSubscription(userId: string): Promise<Subscription> {
  const res = await authFetch(`${API_BASE}/api/v1/account/subscription`);
  if (!res.ok) throw new Error(`Subscription failed: ${res.status}`);
  return res.json();
}

export async function getSubscriptionPortalUrl(userId: string): Promise<string> {
  return `/checkout?plan=profissional&cycle=monthly`;
}

export async function cancelSubscription(userId: string): Promise<boolean> {
  const res = await authFetch(`${API_BASE}/api/v1/account/subscription/cancel`, { method: 'POST' });
  return res.ok;
}

// ── Payments (client history) ──

export interface Payment {
  id: number;
  amount_cents: number;
  currency: string;
  status: string;
  plan: string | null;
  billing_cycle: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
  invoice_url: string | null;
  receipt_url: string | null;
}

export async function getPayments(): Promise<Payment[]> {
  const res = await authFetch(`${API_BASE}/api/v1/account/payments`);
  if (!res.ok) throw new Error(`Payments failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
