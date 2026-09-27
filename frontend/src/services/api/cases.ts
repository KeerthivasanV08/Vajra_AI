import client from './client';
import type { Case } from '@/types';
import { extractCases, normalizeCase } from '@/lib/normalizers/caseNormalizer';

export async function fetchCases(): Promise<Case[]> {
  const raw = await client.request<unknown>({ path: '/api/cases' });
  return extractCases(raw);
}

export async function fetchCase(id: string): Promise<Case> {
  const raw = await client.request<unknown>({ path: `/api/cases/${encodeURIComponent(id)}` });
  return normalizeCase(raw);
}

export async function createCase(payload: Partial<Case>): Promise<Case> {
  const raw = await client.request<unknown>({ method: 'POST', path: '/api/cases/create', body: payload });
  return normalizeCase(raw);
}

export async function assignCase(id: string, officerId: string) {
  return client.request<void>({ method: 'POST', path: `/api/cases/${encodeURIComponent(id)}/assign`, body: { officerId } });
}

export async function freezeCase(id: string) {
  return client.request<void>({ method: 'POST', path: `/api/cases/${encodeURIComponent(id)}/freeze` });
}

export async function sarCase(id: string) {
  return client.request<void>({ method: 'POST', path: `/api/cases/${encodeURIComponent(id)}/sar`, body: { evidence: 'SAR_REQUESTED' } });
}
